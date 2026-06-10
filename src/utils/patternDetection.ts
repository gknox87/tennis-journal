
import { Match } from "@/types/match";
import { WellnessEntry } from "@/types/wellness";
import { TrainingSession } from "@/types/trainingLoad";
import {
  DetectedPattern,
  PatternConfidence,
  MIN_MATCHES_FOR_PATTERNS,
} from "@/types/athletePattern";
import { parseSetCount, getWinRate } from "@/utils/scoreParsing";
import {
  parseReflectionNotes,
  parseNervesRating,
  isGuidedReflection,
} from "@/utils/reflectionNotes";
import { calculateACWR, ACWR_MIN_HISTORY_DAYS } from "@/utils/trainingLoadCalc";
import {
  format,
  subDays,
  parseISO,
  startOfDay,
  differenceInDays,
  addDays,
} from "date-fns";

export interface PatternDetectionInput {
  matches: Match[];
  wellnessEntries: WellnessEntry[];
  trainingSessions: TrainingSession[];
}

function confidenceFromSample(n: number): PatternConfidence {
  if (n >= 8) return "high";
  if (n >= 5) return "medium";
  return "low";
}

function detectThreeSetterWinRate(matches: Match[]): DetectedPattern | null {
  const threeSet = matches.filter((m) => parseSetCount(m.score) === 3);
  if (threeSet.length < 5) return null;

  const twoSet = matches.filter((m) => parseSetCount(m.score) === 2);
  const threeSetWinRate = getWinRate(threeSet);
  const baseline =
    twoSet.length >= 3 ? getWinRate(twoSet) : getWinRate(matches);
  const gap = baseline - threeSetWinRate;

  if (gap < 15 && threeSetWinRate >= 40) return null;

  const wins = threeSet.filter((m) => m.is_win).length;
  const losses = threeSet.length - wins;

  return {
    key: "three_set_loss_rate",
    category: "match",
    headline: `3-set matches: ${threeSetWinRate}% win rate (${wins}W/${losses}L) vs ${baseline}% overall`,
    evidence: {
      sampleSize: threeSet.length,
      metric: threeSetWinRate,
      baseline,
      matchIds: threeSet.map((m) => m.id),
    },
    confidence: confidenceFromSample(threeSet.length),
  };
}

function detectSurfaceGap(matches: Match[]): DetectedPattern | null {
  const bySurface = new Map<string, Match[]>();
  for (const m of matches) {
    const surface = m.court_type?.trim() || "Unknown";
    if (surface === "Unknown") continue;
    const list = bySurface.get(surface) ?? [];
    list.push(m);
    bySurface.set(surface, list);
  }

  const surfaces = [...bySurface.entries()].filter(([, ms]) => ms.length >= 5);
  if (surfaces.length < 2) return null;

  const rates = surfaces.map(([surface, ms]) => ({
    surface,
    rate: getWinRate(ms),
    matches: ms,
  }));
  rates.sort((a, b) => b.rate - a.rate);

  const best = rates[0];
  const worst = rates[rates.length - 1];
  const gap = best.rate - worst.rate;

  if (gap < 15) return null;

  return {
    key: "surface_win_rate_gap",
    category: "match",
    headline: `${worst.surface}: ${worst.rate}% win rate vs ${best.rate}% on ${best.surface} (${gap}pp gap)`,
    evidence: {
      sampleSize: worst.matches.length,
      metric: worst.rate,
      baseline: best.rate,
      detail: `${worst.surface} vs ${best.surface}`,
    },
    confidence: confidenceFromSample(worst.matches.length),
  };
}

function buildDailyLoadMap(sessions: TrainingSession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.session_date, (map.get(s.session_date) ?? 0) + s.training_load);
  }
  return map;
}

function detectLaggedMoodAfterHeavyLoad(
  wellnessEntries: WellnessEntry[],
  sessions: TrainingSession[]
): DetectedPattern | null {
  const loadDays = new Set(sessions.map((s) => s.session_date));
  if (wellnessEntries.length < 14 || loadDays.size < 10) return null;

  const dailyLoads = buildDailyLoadMap(sessions);
  const loadValues = [...dailyLoads.values()].filter((v) => v > 0).sort((a, b) => a - b);
  if (loadValues.length < 4) return null;

  const q3Index = Math.floor(loadValues.length * 0.75);
  const heavyThreshold = loadValues[q3Index];

  const moodByDate = new Map(wellnessEntries.map((e) => [e.entry_date, e.mood]));

  const baselineMoods: number[] = [];
  const postHeavyMoods: number[] = [];
  const heavyDates: string[] = [];

  for (const [date, load] of dailyLoads) {
    if (load < heavyThreshold) continue;
    heavyDates.push(date);

    const lagDate = format(addDays(parseISO(date), 2), "yyyy-MM-dd");
    const lagMood = moodByDate.get(lagDate);
    if (lagMood !== undefined) postHeavyMoods.push(lagMood);

    for (let i = 0; i < 7; i++) {
      const d = format(subDays(parseISO(date), i), "yyyy-MM-dd");
      const m = moodByDate.get(d);
      if (m !== undefined) baselineMoods.push(m);
    }
  }

  if (postHeavyMoods.length < 3 || baselineMoods.length < 5) return null;

  const postAvg =
    postHeavyMoods.reduce((a, b) => a + b, 0) / postHeavyMoods.length;
  const baselineAvg =
    baselineMoods.reduce((a, b) => a + b, 0) / baselineMoods.length;
  const drop = baselineAvg - postAvg;

  if (drop < 0.5) return null;

  return {
    key: "mood_drop_after_heavy_load",
    category: "wellness",
    headline: `Mood drops ~${drop.toFixed(1)} points 2 days after heavy training load days`,
    evidence: {
      sampleSize: postHeavyMoods.length,
      metric: Math.round(postAvg * 10) / 10,
      baseline: Math.round(baselineAvg * 10) / 10,
      dates: heavyDates.slice(0, 5),
    },
    confidence: confidenceFromSample(postHeavyMoods.length),
  };
}

function detectPoorSleepMatchOutcome(
  matches: Match[],
  wellnessEntries: WellnessEntry[]
): DetectedPattern | null {
  const wellnessByDate = new Map(
    wellnessEntries.map((e) => [e.entry_date, e])
  );

  const withPriorWellness: Array<{ match: Match; sleepQuality: number }> = [];
  for (const m of matches) {
    const priorDate = format(subDays(parseISO(m.date), 1), "yyyy-MM-dd");
    const entry = wellnessByDate.get(priorDate);
    if (entry) {
      withPriorWellness.push({ match: m, sleepQuality: entry.sleep_quality });
    }
  }

  if (withPriorWellness.length < 5) return null;

  const poorSleep = withPriorWellness.filter((w) => w.sleepQuality <= 2);
  const goodSleep = withPriorWellness.filter((w) => w.sleepQuality >= 4);

  if (poorSleep.length < 3) return null;

  const poorWinRate = getWinRate(poorSleep.map((w) => w.match));
  const baseline =
    goodSleep.length >= 3
      ? getWinRate(goodSleep.map((w) => w.match))
      : getWinRate(withPriorWellness.map((w) => w.match));

  const gap = baseline - poorWinRate;
  if (gap < 15) return null;

  return {
    key: "poor_sleep_match_outcome",
    category: "wellness",
    headline: `After poor sleep: ${poorWinRate}% win rate vs ${baseline}% when rested`,
    evidence: {
      sampleSize: poorSleep.length,
      metric: poorWinRate,
      baseline,
      matchIds: poorSleep.map((w) => w.match.id),
    },
    confidence: confidenceFromSample(poorSleep.length),
  };
}

function detectHighAcwrWeekLosses(
  matches: Match[],
  sessions: TrainingSession[]
): DetectedPattern | null {
  if (sessions.length === 0) return null;

  const dates = sessions.map((s) => startOfDay(parseISO(s.session_date)));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  if (differenceInDays(startOfDay(new Date()), earliest) + 1 < ACWR_MIN_HISTORY_DAYS) {
    return null;
  }

  const highAcwrMatches: Match[] = [];
  const otherMatches: Match[] = [];

  for (const m of matches) {
    const matchDate = startOfDay(parseISO(m.date));
    const sessionsBefore = sessions.filter(
      (s) => parseISO(s.session_date) <= matchDate
    );
    const { acwr, reliable } = calculateACWR(sessionsBefore, matchDate);
    if (reliable && acwr !== null && acwr > 1.3) {
      highAcwrMatches.push(m);
    } else {
      otherMatches.push(m);
    }
  }

  if (highAcwrMatches.length < 3) return null;

  const highAcwrWinRate = getWinRate(highAcwrMatches);
  const baseline =
    otherMatches.length >= 3
      ? getWinRate(otherMatches)
      : getWinRate(matches);
  const gap = baseline - highAcwrWinRate;

  if (gap < 10) return null;

  return {
    key: "high_acwr_week_losses",
    category: "wellness",
    headline: `During high-load weeks (ACWR > 1.3): ${highAcwrWinRate}% win rate vs ${baseline}% normally`,
    evidence: {
      sampleSize: highAcwrMatches.length,
      metric: highAcwrWinRate,
      baseline,
      matchIds: highAcwrMatches.map((m) => m.id),
    },
    confidence: confidenceFromSample(highAcwrMatches.length),
  };
}

const NERVES_QUESTION_PREFIX = "how did you feel before the match";

function extractNervesFromNotes(notes: string | null | undefined): number | null {
  if (!notes) return null;
  const entries = parseReflectionNotes(notes);
  for (const entry of entries) {
    if (entry.question.toLowerCase().includes(NERVES_QUESTION_PREFIX)) {
      return parseNervesRating(entry.answer);
    }
  }
  return null;
}

function detectReflectionNervesPattern(matches: Match[]): DetectedPattern | null {
  const lossMatches = matches.filter((m) => !m.is_win && isGuidedReflection(m));
  if (lossMatches.length < 5) return null;

  const withNerves = lossMatches
    .map((m) => ({ match: m, nerves: extractNervesFromNotes(m.notes) }))
    .filter((x): x is { match: Match; nerves: number } => x.nerves !== null);

  if (withNerves.length < 5) return null;

  const highNerves = withNerves.filter((x) => x.nerves >= 7);
  const pct = Math.round((highNerves.length / withNerves.length) * 100);

  if (pct < 60) return null;

  return {
    key: "high_nerves_in_losses",
    category: "reflection",
    headline: `High pre-match nerves (7+/10) in ${pct}% of recent losses (${highNerves.length}/${withNerves.length})`,
    evidence: {
      sampleSize: withNerves.length,
      metric: pct,
      baseline: 60,
      matchIds: highNerves.map((x) => x.match.id),
    },
    confidence: confidenceFromSample(withNerves.length),
  };
}

export function detectPatterns(input: PatternDetectionInput): DetectedPattern[] {
  const { matches, wellnessEntries, trainingSessions } = input;

  const detectors = [
    detectThreeSetterWinRate(matches),
    detectSurfaceGap(matches),
    detectLaggedMoodAfterHeavyLoad(wellnessEntries, trainingSessions),
    detectPoorSleepMatchOutcome(matches, wellnessEntries),
    detectHighAcwrWeekLosses(matches, trainingSessions),
    detectReflectionNervesPattern(matches),
  ];

  return detectors.filter(
    (p): p is DetectedPattern => p !== null && p.confidence !== "low"
  );
}

export function getPatternUnlockProgress(matchCount: number): {
  remaining: number;
  unlocked: boolean;
} {
  const remaining = Math.max(0, MIN_MATCHES_FOR_PATTERNS - matchCount);
  return { remaining, unlocked: remaining === 0 };
}
