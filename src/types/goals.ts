export type GoalType =
  | "win_rate"
  | "matches_played"
  | "matches_won"
  | "matches_logged"
  | "training_sessions"
  | "personal_best"
  | "streak_days";

export type GoalStatus = "active" | "completed" | "expired" | "abandoned";

export interface PeriodGoal {
  id: string;
  user_id: string;
  sport_id: string | null;
  title: string;
  description: string | null;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  unit: string;
  period_start: string;
  period_end: string;
  status: GoalStatus;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  percentage: number;
  remaining: number;
  isOnTrack: boolean;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  projectedValue: number;
}

export interface GoalTypeConfig {
  id: GoalType;
  label: string;
  description: string;
  defaultTarget: number;
  defaultUnit: string;
  higherIsBetter: boolean;
  icon: string;
}

export const GOAL_TYPE_CONFIGS: GoalTypeConfig[] = [
  {
    id: "win_rate",
    label: "Win Rate",
    description: "Percentage of matches won during this period",
    defaultTarget: 70,
    defaultUnit: "percent",
    higherIsBetter: true,
    icon: "🏆",
  },
  {
    id: "matches_played",
    label: "Matches Played",
    description: "Total number of matches played in this period",
    defaultTarget: 10,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "🎾",
  },
  {
    id: "matches_won",
    label: "Matches Won",
    description: "Total number of matches won in this period",
    defaultTarget: 5,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "✅",
  },
  {
    id: "matches_logged",
    label: "Matches Logged",
    description: "Total matches recorded in your journal",
    defaultTarget: 15,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "📝",
  },
  {
    id: "training_sessions",
    label: "Training Sessions",
    description: "Number of training sessions completed",
    defaultTarget: 12,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "💪",
  },
  {
    id: "personal_best",
    label: "Personal Best",
    description: "Set a new personal best in any event",
    defaultTarget: 1,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "⚡",
  },
  {
    id: "streak_days",
    label: "Journaling Streak",
    description: "Consecutive days of logging activity",
    defaultTarget: 30,
    defaultUnit: "days",
    higherIsBetter: true,
    icon: "🔥",
  },
];
