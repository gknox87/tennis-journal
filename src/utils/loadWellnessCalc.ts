
import {
  TrainingSession,
  WeeklyLoadMetrics,
  LoadWellnessTimelinePoint,
  LoadInterpretation,
} from "@/types/trainingLoad";
import { WellnessEntry } from "@/types/wellness";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO } from "date-fns";

export function getWeekOverWeekLoadChange(sessions: TrainingSession[]): number | null {
  const today = startOfDay(new Date());

  const getWeekTotal = (weekOffset: number) => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const dayStr = format(subDays(today, weekOffset * 7 + i), "yyyy-MM-dd");
      total += sessions
        .filter((s) => s.session_date === dayStr)
        .reduce((sum, s) => sum + s.training_load, 0);
    }
    return total;
  };

  const currentWeek = getWeekTotal(0);
  const priorWeek = getWeekTotal(1);

  if (priorWeek === 0) return currentWeek > 0 ? 100 : null;
  return Math.round(((currentWeek - priorWeek) / priorWeek) * 100);
}

export function getMoodRollingAverages(entries: WellnessEntry[]): {
  current7Avg: number | null;
  prior7Avg: number | null;
  change: number | null;
} {
  const today = startOfDay(new Date());

  const getMoodAvg = (startOffset: number, endOffset: number) => {
    const moods: number[] = [];
    for (let i = startOffset; i <= endOffset; i++) {
      const dayStr = format(subDays(today, i), "yyyy-MM-dd");
      const entry = entries.find((e) => e.entry_date === dayStr);
      if (entry) moods.push(entry.mood);
    }
    if (moods.length === 0) return null;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  };

  const current7Avg = getMoodAvg(0, 6);
  const prior7Avg = getMoodAvg(7, 13);

  if (current7Avg === null || prior7Avg === null) {
    return { current7Avg, prior7Avg, change: null };
  }

  return {
    current7Avg,
    prior7Avg,
    change: current7Avg - prior7Avg,
  };
}

export function getLoadWellnessTimeline(
  sessions: TrainingSession[],
  wellnessEntries: WellnessEntry[],
  days: number = 14
): LoadWellnessTimelinePoint[] {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);
  const interval = eachDayOfInterval({ start: startDate, end: today });

  const moodByDate = new Map(wellnessEntries.map((e) => [e.entry_date, e.mood]));

  return interval.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const load = sessions
      .filter((s) => s.session_date === dayStr)
      .reduce((sum, s) => sum + s.training_load, 0);

    return {
      date: dayStr,
      dateLabel: format(day, "MMM dd"),
      load,
      mood: moodByDate.get(dayStr) ?? null,
    };
  });
}

function hasWellnessData(entries: WellnessEntry[]): boolean {
  return entries.length > 0;
}

export function generateLoadInterpretations(
  sessions: TrainingSession[],
  metrics: WeeklyLoadMetrics,
  wellnessEntries: WellnessEntry[]
): LoadInterpretation[] {
  const interpretations: LoadInterpretation[] = [];
  const wowChange = getWeekOverWeekLoadChange(sessions);
  const moodTrend = getMoodRollingAverages(wellnessEntries);
  const hasWellness = hasWellnessData(wellnessEntries);

  const loadSpiked = wowChange !== null && wowChange >= 20;
  const moodDipped = moodTrend.change !== null && moodTrend.change <= -0.5;
  const loadStable = wowChange !== null && Math.abs(wowChange) < 10;

  // Cross-signal: load spike + mood dip
  if (loadSpiked && moodDipped && hasWellness) {
    interpretations.push({
      severity: "warning",
      headline: "Load spike with mood dip",
      message: `Your load spiked ${wowChange}% this week — lower mood is a normal response. Fatigue and irritability are common when volume jumps.`,
      action: "Protect sleep and consider a lighter session tomorrow.",
    });
  }

  // ACWR danger
  if (metrics.acwrReliable && metrics.acwr !== null && metrics.acwr > 1.5) {
    interpretations.push({
      severity: "warning",
      headline: "High injury risk",
      message: "Training jumped too fast for your body to adapt. Fatigue and irritability are common — pull back for 2–3 days.",
      action: "Swap high-intensity work for recovery or technique sessions.",
    });
  }

  // ACWR caution
  if (
    metrics.acwrReliable &&
    metrics.acwr !== null &&
    metrics.acwr > 1.3 &&
    metrics.acwr <= 1.5
  ) {
    interpretations.push({
      severity: "caution",
      headline: "Elevated load",
      message: "Load is building quickly. Watch for soreness and mood dips — a recovery day now beats a week out injured.",
      action: "Monitor how you feel and don't push through persistent fatigue.",
    });
  }

  // Load spike without wellness cross-signal
  if (loadSpiked && !(moodDipped && hasWellness)) {
    interpretations.push({
      severity: "caution",
      headline: "Load spike detected",
      message: `Your load spiked ${wowChange}% compared to last week. Expect extra fatigue — protect sleep and hydration.`,
      action: "Listen to your body and adjust intensity if needed.",
    });
  }

  // High monotony
  if (metrics.trainingMonotony > 2) {
    interpretations.push({
      severity: "caution",
      headline: "Repetitive training pattern",
      message: "Your training looks repetitive. Same sessions day after day increases strain — mix intensity or activity type.",
      action: "Try varying session types across the week.",
    });
  }

  // High strain
  if (metrics.trainingStrain > 6000) {
    interpretations.push({
      severity: "warning",
      headline: "High cumulative strain",
      message: "Overall training strain is high. Your body needs variety and rest to absorb this workload.",
      action: "Schedule at least one full recovery day this week.",
    });
  }

  // ACWR undertraining
  if (metrics.acwrReliable && metrics.acwr !== null && metrics.acwr < 0.8) {
    interpretations.push({
      severity: "info",
      headline: "Below baseline load",
      message: "Load is below your recent baseline. If you feel fresh, you can gradually build — if tired, recovery may be what you need.",
    });
  }

  // Mood dip with stable load
  if (moodDipped && loadStable && hasWellness && !loadSpiked) {
    interpretations.push({
      severity: "caution",
      headline: "Mood dip without load change",
      message: "Mood has dipped this week without a big load change. Stress, sleep, and life load matter too.",
      action: "Check in on sleep quality and non-training stressors.",
    });
  }

  // ACWR optimal
  if (
    metrics.acwrReliable &&
    metrics.acwr !== null &&
    metrics.acwr >= 0.8 &&
    metrics.acwr <= 1.3 &&
    interpretations.length === 0
  ) {
    interpretations.push({
      severity: "info",
      headline: "Load in healthy range",
      message: "Load is in a healthy range. Keep logging sessions and check-ins to stay on track.",
    });
  }

  return interpretations.slice(0, 3);
}
