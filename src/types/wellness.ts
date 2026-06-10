
export interface WellnessEntry {
  id: string;
  user_id: string;
  sport_id?: string | null;
  entry_date: string;
  sleep_quality: number;
  sleep_duration_hours?: number | null;
  fatigue: number;
  muscle_soreness?: number | null;
  stress_level: number;
  mood: number;
  motivation: number;
  performance_confidence: number;
  total_wellness_score: number;
  energy?: number | null;
  appetite?: number | null;
  notes?: string | null;
  menstrual_cycle_day?: number | null;
  created_at: string;
}

export type WellnessFieldKey =
  | "sleep_quality"
  | "fatigue"
  | "stress_level"
  | "mood"
  | "motivation"
  | "performance_confidence";

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
      { value: 5, label: "Very fresh (highly energised)" },
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
  {
    key: "motivation",
    title: "Motivation",
    question: "How MOTIVATED are you to train or compete today?",
    descriptors: [
      { value: 1, label: "No motivation (want to skip entirely)" },
      { value: 2, label: "Low motivation (going through the motions)" },
      { value: 3, label: "Moderate motivation (willing but not fired up)" },
      { value: 4, label: "Good motivation (keen to get started)" },
      { value: 5, label: "Highly motivated (can't wait to train/compete)" },
    ],
  },
  {
    key: "performance_confidence",
    title: "Confidence",
    question: "How CONFIDENT are you in your ability to perform today?",
    descriptors: [
      { value: 1, label: "No confidence (expect to struggle)" },
      { value: 2, label: "Low confidence (doubting my skills)" },
      { value: 3, label: "Moderate confidence (unsure either way)" },
      { value: 4, label: "Good confidence (trust my preparation)" },
      { value: 5, label: "Very confident (ready to execute at my best)" },
    ],
  },
];

export const WELLNESS_SORENESS_DESCRIPTORS: WellnessScaleDescriptor[] = [
  { value: 1, label: "Extremely sore (difficult to move normally)" },
  { value: 2, label: "Very sore (noticeable with every movement)" },
  { value: 3, label: "Somewhat sore (occasional discomfort)" },
  { value: 4, label: "Slightly sore (barely noticeable)" },
  { value: 5, label: "No soreness at all" },
];

export type WellnessZone = "good" | "moderate" | "concern" | "critical";

export const WELLNESS_MAX_SCORE = 30;

export const WELLNESS_ALERTS = {
  TOTAL_SCORE_LOW: 14,
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
