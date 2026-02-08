
import { WellnessEntry, WellnessZone, WELLNESS_ALERTS, WELLNESS_ZONE_COLORS } from "@/types/wellness";

export function calculateHooperIndex(entry: Pick<WellnessEntry, "sleep_quality" | "fatigue" | "muscle_soreness" | "stress_level" | "mood">): number {
  return entry.sleep_quality + entry.fatigue + entry.muscle_soreness + entry.stress_level + entry.mood;
}

export function getWellnessZone(score: number): WellnessZone {
  if (score >= 21) return "good";
  if (score >= 16) return "moderate";
  if (score >= WELLNESS_ALERTS.TOTAL_SCORE_LOW) return "concern";
  return "critical";
}

export function getWellnessZoneColor(zone: WellnessZone): string {
  return WELLNESS_ZONE_COLORS[zone];
}

export function getWellnessZoneLabel(zone: WellnessZone): string {
  switch (zone) {
    case "good": return "Good";
    case "moderate": return "Moderate";
    case "concern": return "Concern";
    case "critical": return "Critical";
  }
}

export function calculateWellnessZScore(
  currentScore: number,
  athleteBaseline: number,
  athleteSD: number
): number {
  if (athleteSD === 0) return 0;
  return (currentScore - athleteBaseline) / athleteSD;
}

export interface WellnessAlert {
  type: "critical" | "warning" | "info";
  message: string;
}

export function checkWellnessAlerts(
  entry: WellnessEntry,
  history: WellnessEntry[]
): WellnessAlert[] {
  const alerts: WellnessAlert[] = [];

  // Check total score
  if (entry.total_wellness_score < WELLNESS_ALERTS.TOTAL_SCORE_LOW) {
    alerts.push({
      type: "warning",
      message: `Total wellness score (${entry.total_wellness_score}/25) is below threshold. Consider a lighter training day.`,
    });
  }

  // Check individual critical items
  const fields: { key: keyof WellnessEntry; label: string }[] = [
    { key: "sleep_quality", label: "Sleep" },
    { key: "fatigue", label: "Fatigue" },
    { key: "muscle_soreness", label: "Muscle soreness" },
    { key: "stress_level", label: "Stress" },
    { key: "mood", label: "Mood" },
  ];

  for (const field of fields) {
    const value = entry[field.key] as number;
    if (value === WELLNESS_ALERTS.SINGLE_ITEM_CRITICAL) {
      alerts.push({
        type: "critical",
        message: `${field.label} rated 1/5 — immediate attention recommended.`,
      });
    }
  }

  // Check sleep critical
  if (entry.sleep_quality <= WELLNESS_ALERTS.SLEEP_CRITICAL) {
    const recentSleepScores = history
      .slice(-3)
      .map((e) => e.sleep_quality);
    if (recentSleepScores.length >= 2 && recentSleepScores.every((s) => s <= WELLNESS_ALERTS.SLEEP_CRITICAL)) {
      alerts.push({
        type: "critical",
        message: "Sleep has been consistently poor. Consider addressing sleep hygiene.",
      });
    }
  }

  // Check consecutive decline
  if (history.length >= WELLNESS_ALERTS.CONSECUTIVE_DECLINE) {
    const recent = history.slice(-(WELLNESS_ALERTS.CONSECUTIVE_DECLINE));
    let declining = true;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].total_wellness_score >= recent[i - 1].total_wellness_score) {
        declining = false;
        break;
      }
    }
    if (declining && entry.total_wellness_score < recent[recent.length - 1].total_wellness_score) {
      alerts.push({
        type: "warning",
        message: `Wellness scores have been declining for ${WELLNESS_ALERTS.CONSECUTIVE_DECLINE}+ days.`,
      });
    }
  }

  return alerts;
}

export interface WellnessTrendPoint {
  date: string;
  score: number;
  sleep: number;
  fatigue: number;
  soreness: number;
  stress: number;
  mood: number;
}

export function calculateWellnessTrend(entries: WellnessEntry[]): WellnessTrendPoint[] {
  return entries.map((e) => ({
    date: e.entry_date,
    score: e.total_wellness_score,
    sleep: e.sleep_quality,
    fatigue: e.fatigue,
    soreness: e.muscle_soreness,
    stress: e.stress_level,
    mood: e.mood,
  }));
}

export function calculateWellnessAverage(entries: WellnessEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.total_wellness_score, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

export function calculateWellnessStreak(entries: WellnessEntry[]): number {
  if (entries.length === 0) return 0;

  const sorted = [...entries].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDate = new Date(sorted[0].entry_date);
  firstDate.setHours(0, 0, 0, 0);

  // If the most recent entry isn't today or yesterday, streak is 0
  const diffDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1].entry_date);
    const prev = new Date(sorted[i].entry_date);
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
    const diff = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
