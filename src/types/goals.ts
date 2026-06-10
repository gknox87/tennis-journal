import type { ActivityType } from "@/types/trainingLoad";

export type GoalType =
  | "win_rate"
  | "matches_played"
  | "matches_won"
  | "matches_logged"
  | "training_sessions"
  | "personal_best"
  | "streak_days"
  | "wellness_checkins"
  | "journaled_sessions"
  | "match_reflections"
  | "activity_sessions";

export type GoalStatus = "active" | "completed" | "expired" | "abandoned";

export type GoalCadence = "period_total" | "weekly";

export type GoalCategory = "outcome" | "process";

export interface GoalMetadata {
  activity_type?: ActivityType;
}

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
  cadence: GoalCadence;
  metadata: GoalMetadata;
  created_at: string;
  updated_at: string;
}

export interface WeekBucket {
  weekStart: string;
  count: number;
  met: boolean;
  isCurrent: boolean;
  isPending: boolean;
}

export interface WeeklyAdherence {
  weeks: WeekBucket[];
  weeksMet: number;
  weeksElapsed: number;
  weeksTotal: number;
  currentWeekCount: number;
}

export interface GoalProgress {
  percentage: number;
  remaining: number;
  isOnTrack: boolean;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  projectedValue: number;
  weekly?: WeeklyAdherence;
}

export interface GoalTypeConfig {
  id: GoalType;
  label: string;
  description: string;
  defaultTarget: number;
  defaultUnit: string;
  higherIsBetter: boolean;
  icon: string;
  category: GoalCategory;
  supportsWeekly: boolean;
}

export const GOAL_TYPE_CONFIGS: GoalTypeConfig[] = [
  {
    id: "training_sessions",
    label: "Training Sessions",
    description: "Number of training sessions completed",
    defaultTarget: 3,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "💪",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "wellness_checkins",
    label: "Wellness Check-ins",
    description: "Daily wellness questionnaires logged",
    defaultTarget: 5,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "🌿",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "journaled_sessions",
    label: "Training Notes",
    description: "Training journal entries recorded",
    defaultTarget: 3,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "📓",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "match_reflections",
    label: "Match Reflections",
    description: "Guided post-match reflections completed",
    defaultTarget: 1,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "🪞",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "activity_sessions",
    label: "Activity Sessions",
    description: "Training sessions of a specific activity type",
    defaultTarget: 2,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "🎯",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "matches_logged",
    label: "Matches Logged",
    description: "Total matches recorded in your journal",
    defaultTarget: 15,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "📝",
    category: "process",
    supportsWeekly: true,
  },
  {
    id: "streak_days",
    label: "Journaling Streak",
    description: "Consecutive days of logging activity",
    defaultTarget: 30,
    defaultUnit: "days",
    higherIsBetter: true,
    icon: "🔥",
    category: "process",
    supportsWeekly: false,
  },
  {
    id: "matches_played",
    label: "Matches Played",
    description: "Total number of matches played in this period",
    defaultTarget: 10,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "🎾",
    category: "outcome",
    supportsWeekly: true,
  },
  {
    id: "win_rate",
    label: "Win Rate",
    description: "Percentage of matches won during this period",
    defaultTarget: 70,
    defaultUnit: "percent",
    higherIsBetter: true,
    icon: "🏆",
    category: "outcome",
    supportsWeekly: false,
  },
  {
    id: "matches_won",
    label: "Matches Won",
    description: "Total number of matches won in this period",
    defaultTarget: 5,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "✅",
    category: "outcome",
    supportsWeekly: true,
  },
  {
    id: "personal_best",
    label: "Personal Best",
    description: "Set a new personal best in any event",
    defaultTarget: 1,
    defaultUnit: "count",
    higherIsBetter: true,
    icon: "⚡",
    category: "outcome",
    supportsWeekly: false,
  },
];

export const PROCESS_GOAL_CONFIGS = GOAL_TYPE_CONFIGS.filter(
  (c) => c.category === "process"
);

export const OUTCOME_GOAL_CONFIGS = GOAL_TYPE_CONFIGS.filter(
  (c) => c.category === "outcome"
);

export interface GoalTemplate {
  id: string;
  label: string;
  goal_type: GoalType;
  cadence: GoalCadence;
  target_value: number;
  title: string;
  description?: string;
  metadata?: GoalMetadata;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "training-weekly",
    label: "3 training sessions / week",
    goal_type: "training_sessions",
    cadence: "weekly",
    target_value: 3,
    title: "3 training sessions per week",
    description: "Build consistency with regular on-court or gym work.",
  },
  {
    id: "wellness-weekly",
    label: "5 wellness check-ins / week",
    goal_type: "wellness_checkins",
    cadence: "weekly",
    target_value: 5,
    title: "5 wellness check-ins per week",
    description: "Stay in tune with sleep, mood, and recovery.",
  },
  {
    id: "notes-weekly",
    label: "3 training notes / week",
    goal_type: "journaled_sessions",
    cadence: "weekly",
    target_value: 3,
    title: "3 training notes per week",
    description: "Reflect on what you worked on after each session.",
  },
  {
    id: "reflections-weekly",
    label: "Reflect on every match",
    goal_type: "match_reflections",
    cadence: "weekly",
    target_value: 1,
    title: "Complete a match reflection each week",
    description: "Use guided prompts to learn from every match.",
  },
  {
    id: "technical-weekly",
    label: "2 technical sessions / week",
    goal_type: "activity_sessions",
    cadence: "weekly",
    target_value: 2,
    title: "2 technical sessions per week",
    description: "Dedicated technical practice to sharpen your game.",
    metadata: { activity_type: "technical" },
  },
];
