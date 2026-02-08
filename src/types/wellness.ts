
export interface WellnessEntry {
  id: string;
  user_id: string;
  sport_id?: string | null;
  entry_date: string;
  sleep_quality: number;
  sleep_duration_hours?: number | null;
  fatigue: number;
  muscle_soreness: number;
  stress_level: number;
  mood: number;
  total_wellness_score: number;
  motivation?: number | null;
  energy?: number | null;
  appetite?: number | null;
  notes?: string | null;
  menstrual_cycle_day?: number | null;
  created_at: string;
}

export type WellnessFieldKey =
  | "sleep_quality"
  | "fatigue"
  | "muscle_soreness"
  | "stress_level"
  | "mood";

export interface WellnessScaleDescriptor {
  value: number;
  label: string;
}

export interface WellnessQuestion {
  key: WellnessFieldKey;
  title: string;
  question: string;
  descriptors: WellnessScaleDescriptor[];
}

export const WELLNESS_QUESTIONS: WellnessQuestion[] = [
  {
    key: "sleep_quality",
    title: "Sleep",
    question: "How did you SLEEP last night?",
    descriptors: [
      { value: 1, label: "Terrible sleep (woke multiple times, couldn't fall asleep)" },
      { value: 2, label: "Poor sleep (restless, not refreshing)" },
      { value: 3, label: "Moderate sleep (okay but could be better)" },
      { value: 4, label: "Good sleep (slept well, minor interruptions)" },
      { value: 5, label: "Excellent sleep (slept through, woke refreshed)" },
    ],
  },
  {
    key: "fatigue",
    title: "Fatigue",
    question: "How FATIGUED do you feel right now?",
    descriptors: [
      { value: 1, label: "Always tired (completely exhausted)" },
      { value: 2, label: "More tired than normal" },
      { value: 3, label: "Normal fatigue levels" },
      { value: 4, label: "Less tired than normal" },
      { value: 5, label: "Very fresh (highly energized)" },
    ],
  },
  {
    key: "muscle_soreness",
    title: "Soreness",
    question: "How SORE were you when you woke up this morning?",
    descriptors: [
      { value: 1, label: "Extremely sore (difficult to move normally)" },
      { value: 2, label: "Very sore (noticeable with every movement)" },
      { value: 3, label: "Somewhat sore (occasional discomfort)" },
      { value: 4, label: "Slightly sore (barely noticeable)" },
      { value: 5, label: "No soreness at all" },
    ],
  },
  {
    key: "stress_level",
    title: "Stress",
    question: "How STRESSED do you feel right now?",
    descriptors: [
      { value: 1, label: "Highly stressed (overwhelmed)" },
      { value: 2, label: "Stressed (multiple worries)" },
      { value: 3, label: "Normal stress levels" },
      { value: 4, label: "Fairly relaxed" },
      { value: 5, label: "Very relaxed (calm and composed)" },
    ],
  },
  {
    key: "mood",
    title: "Mood",
    question: "How is your MOOD today?",
    descriptors: [
      { value: 1, label: "Highly irritated/anxious" },
      { value: 2, label: "Low mood" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Good mood" },
      { value: 5, label: "Great mood (positive and optimistic)" },
    ],
  },
];

export type WellnessZone = "good" | "moderate" | "concern" | "critical";

export const WELLNESS_ALERTS = {
  TOTAL_SCORE_LOW: 12,
  SINGLE_ITEM_CRITICAL: 1,
  CONSECUTIVE_DECLINE: 3,
  SLEEP_CRITICAL: 2,
};

export const WELLNESS_ZONE_COLORS: Record<WellnessZone, string> = {
  good: "#22c55e",
  moderate: "#eab308",
  concern: "#f97316",
  critical: "#ef4444",
};
