/**
 * Utility functions for calculating journaling streaks
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalJournalDays: number;
  lastJournaledAt: Date | null;
  journaledDates: Set<string>;
}

export interface JournalingDate {
  date: string; // ISO date string (YYYY-MM-DD)
  type: 'match' | 'training' | 'note';
}

/**
 * Converts a date to a normalized date string (YYYY-MM-DD) in local timezone
 */
export function normalizeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the date string for today in local timezone
 */
export function getTodayDateString(): string {
  return normalizeDate(new Date());
}

/**
 * Gets the date string for yesterday in local timezone
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return normalizeDate(yesterday);
}

/**
 * Calculates the current streak (consecutive days from today backwards)
 */
function calculateCurrentStreak(journaledDates: Set<string>): number {
  if (journaledDates.size === 0) {
    return 0;
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Check if user journaled today or yesterday (allow for timezone differences)
  if (!journaledDates.has(today) && !journaledDates.has(yesterday)) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Count backwards for consecutive days
  while (true) {
    const dateStr = normalizeDate(currentDate);
    
    if (journaledDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If we're checking today/yesterday and it's not there, but the other is, continue
      if (dateStr === today && journaledDates.has(yesterday)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      if (dateStr === yesterday && journaledDates.has(today)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

/**
 * Calculates the longest streak across all journaled dates
 */
function calculateLongestStreak(journaledDates: Set<string>): number {
  if (journaledDates.size === 0) {
    return 0;
  }

  // Convert to sorted array of dates
  const sortedDates = Array.from(journaledDates)
    .map(dateStr => new Date(dateStr + 'T00:00:00'))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currentDate = sortedDates[i];
    
    // Calculate days difference
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Streak broken
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Main function to calculate streak data from journaling dates
 */
export function calculateStreak(journalDates: (Date | string)[]): StreakData {
  // Normalize all dates to date strings (YYYY-MM-DD)
  const journaledDates = new Set<string>();
  
  journalDates.forEach(date => {
    const normalized = normalizeDate(date);
    journaledDates.add(normalized);
  });

  const currentStreak = calculateCurrentStreak(journaledDates);
  const longestStreak = calculateLongestStreak(journaledDates);
  const totalJournalDays = journaledDates.size;

  // Find the most recent journaled date
  let lastJournaledAt: Date | null = null;
  if (journaledDates.size > 0) {
    const sortedDates = Array.from(journaledDates)
      .map(dateStr => new Date(dateStr + 'T00:00:00'))
      .sort((a, b) => b.getTime() - a.getTime());
    lastJournaledAt = sortedDates[0];
  }

  return {
    currentStreak,
    longestStreak,
    totalJournalDays,
    lastJournaledAt,
    journaledDates,
  };
}

/**
 * Gets the next milestone for a given streak
 */
export function getNextMilestone(currentStreak: number): {
  milestone: number;
  daysRemaining: number;
  percentage: number;
} {
  const milestones = [7, 14, 30, 50, 100, 200, 365];
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        milestone,
        daysRemaining: milestone - currentStreak,
        percentage: (currentStreak / milestone) * 100,
      };
    }
  }

  // Beyond all milestones
  return {
    milestone: 365,
    daysRemaining: 0,
    percentage: 100,
  };
}

/**
 * Checks if a streak value is a milestone
 */
export function isMilestone(streak: number): boolean {
  const milestones = [7, 14, 30, 50, 100, 200, 365];
  return milestones.includes(streak);
}

/**
 * Gets milestone message for a given streak
 */
export function getMilestoneMessage(streak: number): {
  title: string;
  message: string;
  emoji: string;
} {
  const milestones: Record<number, { title: string; message: string; emoji: string }> = {
    7: {
      title: 'Week Warrior!',
      message: "You've journaled for a full week. Consistency is key!",
      emoji: '🔥',
    },
    14: {
      title: 'Two-Week Champion!',
      message: 'Two weeks of dedication! You\'re building a powerful habit.',
      emoji: '💪',
    },
    30: {
      title: 'Monthly Master!',
      message: 'A full month of reflection and growth. Incredible!',
      emoji: '🏆',
    },
    50: {
      title: 'Half Century Hero!',
      message: '50 days of journaling! You\'re halfway to a century!',
      emoji: '⭐',
    },
    100: {
      title: 'Century Club!',
      message: '100 days of dedication. You\'re unstoppable!',
      emoji: '💯',
    },
    200: {
      title: 'Double Century!',
      message: '200 days! Your commitment is truly remarkable.',
      emoji: '🚀',
    },
    365: {
      title: 'Year of Excellence!',
      message: 'A full year of journaling! This is extraordinary dedication.',
      emoji: '👑',
    },
  };

  return milestones[streak] || {
    title: 'Milestone Achieved!',
    message: `Congratulations on ${streak} days of journaling!`,
    emoji: '🎉',
  };
}

/**
 * Calculates weekly consistency percentage
 */
export function calculateWeeklyConsistency(journaledDates: Set<string>): number {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  let journaledDays = 0;
  const currentDate = new Date(weekAgo);
  
  while (currentDate <= today) {
    const dateStr = normalizeDate(currentDate);
    if (journaledDates.has(dateStr)) {
      journaledDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return Math.round((journaledDays / 7) * 100);
}

