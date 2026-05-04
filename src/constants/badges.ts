export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "streak" | "achievement" | "dedication" | "versatility" | "goals";
  tiers: BadgeTier[];
}

export interface BadgeTier {
  tier: 1 | 2 | 3 | 4 | 5;
  label: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  color: string;
  icon: string;
  requirement: number;
  earnedAt?: string;
}

export interface EarnedBadge {
  badge_id: string;
  tier: number;
  earned_at: string;
}

export interface BadgeProgress {
  definition: BadgeDefinition;
  currentValue: number;
  currentTier: number;
  isEarned: (tier: BadgeTier) => boolean;
}

export const BADGES: BadgeDefinition[] = [
  // ─── MILESTONE BADGES ───
  {
    id: "first_match",
    name: "First Match",
    description: "Log your very first match",
    icon: "🎾",
    category: "milestone",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 1 },
    ],
  },
  {
    id: "matches_logged",
    name: "Match Logger",
    description: "Log matches consistently throughout your journey",
    icon: "📝",
    category: "milestone",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 5 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 25 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 50 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 100 },
      { tier: 5, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 250 },
    ],
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "100 total journal entries (matches + training + wellness)",
    icon: "💯",
    category: "milestone",
    tiers: [
      { tier: 1, label: "gold", color: "#d4af37", icon: "🥇", requirement: 100 },
      { tier: 2, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 500 },
    ],
  },
  {
    id: "wins_milestone",
    name: "Winner's Circle",
    description: "Accumulate match wins",
    icon: "🏆",
    category: "milestone",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 5 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 25 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 50 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 100 },
      { tier: 5, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 200 },
    ],
  },

  // ─── STREAK BADGES ───
  {
    id: "journaling_streak",
    name: "Journaling Streak",
    description: "Maintain consecutive days of journaling",
    icon: "🔥",
    category: "streak",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 7 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 30 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 90 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 180 },
      { tier: 5, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 365 },
    ],
  },
  {
    id: "win_streak",
    name: "Winning Streak",
    description: "Win matches consecutively",
    icon: "⚡",
    category: "streak",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 3 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 5 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 10 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 15 },
      { tier: 5, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 20 },
    ],
  },

  // ─── ACHIEVEMENT BADGES ───
  {
    id: "win_rate_elite",
    name: "Elite Performance",
    description: "Maintain a high win rate over a season",
    icon: "📈",
    category: "achievement",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 50 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 60 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 70 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 80 },
      { tier: 5, label: "diamond", color: "#b9f2ff", icon: "💠", requirement: 90 },
    ],
  },
  {
    id: "straight_sets",
    name: "Straight Sets",
    description: "Win matches without dropping a set",
    icon: "🎯",
    category: "achievement",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 5 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 15 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 30 },
    ],
  },

  // ─── DEDICATION BADGES ───
  {
    id: "training_beast",
    name: "Training Beast",
    description: "Log training sessions consistently",
    icon: "💪",
    category: "dedication",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 10 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 50 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 100 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 250 },
    ],
  },
  {
    id: "wellness_champion",
    name: "Wellness Champion",
    description: "Complete wellness check-ins",
    icon: "❤️",
    category: "dedication",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 7 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 30 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 90 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 180 },
    ],
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Log entries every day for 7 days straight",
    icon: "🌟",
    category: "dedication",
    tiers: [
      { tier: 1, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 1 },
      { tier: 2, label: "gold", color: "#d4af37", icon: "🥇", requirement: 4 },
      { tier: 3, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 12 },
    ],
  },

  // ─── VERSATILITY BADGES ───
  {
    id: "court_explorer",
    name: "Court Explorer",
    description: "Play on different court surfaces",
    icon: "🗺️",
    category: "versatility",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 2 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 3 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 4 },
    ],
  },
  {
    id: "multi_sport",
    name: "Multi-Sport Athlete",
    description: "Log entries across different sports",
    icon: "🌍",
    category: "versatility",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 2 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 3 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 5 },
    ],
  },
  {
    id: "opponent_variety",
    name: "Social Player",
    description: "Play against different opponents",
    icon: "🤝",
    category: "versatility",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 5 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 15 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 30 },
    ],
  },

  // ─── GOAL BADGES ───
  {
    id: "goal_getter",
    name: "Goal Getter",
    description: "Complete period goals",
    icon: "🎯",
    category: "goals",
    tiers: [
      { tier: 1, label: "bronze", color: "#cd7f32", icon: "🥉", requirement: 1 },
      { tier: 2, label: "silver", color: "#a8a8a8", icon: "🥈", requirement: 3 },
      { tier: 3, label: "gold", color: "#d4af37", icon: "🥇", requirement: 5 },
      { tier: 4, label: "platinum", color: "#e5e4e2", icon: "💎", requirement: 10 },
    ],
  },
];
