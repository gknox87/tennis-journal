
export type ActivityType =
  | "technical"
  | "tactical"
  | "conditioning"
  | "strength"
  | "plyometrics"
  | "match_play"
  | "practice_match"
  | "recovery"
  | "other";

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "tactical", label: "Tactical" },
  { value: "conditioning", label: "Conditioning" },
  { value: "strength", label: "Strength" },
  { value: "plyometrics", label: "Plyometrics" },
  { value: "match_play", label: "Match Play" },
  { value: "practice_match", label: "Practice Match" },
  { value: "recovery", label: "Recovery" },
  { value: "other", label: "Other" },
];

export interface TrainingSession {
  id: string;
  user_id: string;
  sport_id?: string | null;
  rpe: number;
  duration_minutes: number;
  training_load: number;
  activity_type: ActivityType;
  sport_specific?: string | null;
  session_date: string;
  session_start_time?: string | null;
  session_end_time?: string | null;
  rpe_collected_at?: string | null;
  planned_duration?: number | null;
  notes?: string | null;
  training_note_id?: string | null;
  created_at: string;
}

export interface WeeklyLoadMetrics {
  weeklyTotalLoad: number;
  dailyAverageLoad: number;
  standardDeviation: number;
  trainingMonotony: number;
  trainingStrain: number;
  acuteLoad: number;
  chronicLoad: number;
  acwr: number | null;
  acwrReliable: boolean;
}

export interface RPEDescriptor {
  value: number;
  label: string;
  color: string;
}

export const RPE_SCALE: RPEDescriptor[] = [
  { value: 0, label: "Rest", color: "#E8F5E9" },
  { value: 1, label: "Very, Very Easy", color: "#C8E6C9" },
  { value: 2, label: "Easy", color: "#A5D6A7" },
  { value: 3, label: "Moderate", color: "#81C784" },
  { value: 4, label: "Somewhat Hard", color: "#FFF59D" },
  { value: 5, label: "Hard", color: "#FFE082" },
  { value: 6, label: "Hard+", color: "#FFD54F" },
  { value: 7, label: "Very Hard", color: "#FFB74D" },
  { value: 8, label: "Very, Very Hard", color: "#FF8A65" },
  { value: 9, label: "Really, Really Hard", color: "#EF5350" },
  { value: 10, label: "Maximal", color: "#C62828" },
];

export type RiskZone = "optimal" | "caution" | "danger" | "undertraining";

export interface DailyLoadData {
  date: string;
  load: number;
  activityType?: ActivityType;
}

export interface ACWRDataPoint {
  date: string;
  acwr: number | null;
  acuteLoad: number;
  chronicLoad: number;
}

export interface ActivityDistributionData {
  type: ActivityType;
  label: string;
  count: number;
  totalLoad: number;
}
