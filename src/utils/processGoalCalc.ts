import {
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { WeeklyAdherence, WeekBucket } from "@/types/goals";

const WEEK_OPTS = { weekStartsOn: 1 as const };

/**
 * Bucket activity dates into Monday-start calendar weeks within a goal period.
 * The in-progress week is marked pending and never counted as missed.
 */
export function computeWeeklyAdherence(
  dates: string[],
  periodStart: string,
  periodEnd: string,
  targetValue: number,
  referenceDate: Date = new Date()
): WeeklyAdherence {
  const periodStartDate = startOfDay(parseISO(periodStart));
  const periodEndDate = endOfDay(parseISO(periodEnd));
  const today = startOfDay(referenceDate);

  const weeks: WeekBucket[] = [];
  let cursor = startOfWeek(periodStartDate, WEEK_OPTS);

  while (!isAfter(cursor, periodEndDate)) {
    const weekEnd = endOfWeek(cursor, WEEK_OPTS);
    const effectiveStart =
      isBefore(cursor, periodStartDate) ? periodStartDate : cursor;
    const effectiveEnd =
      isAfter(weekEnd, periodEndDate) ? periodEndDate : weekEnd;

    if (!isAfter(effectiveStart, effectiveEnd)) {
      const count = dates.filter((dateStr) => {
        const date = startOfDay(parseISO(dateStr));
        return isWithinInterval(date, {
          start: effectiveStart,
          end: effectiveEnd,
        });
      }).length;

      const isCurrent = isWithinInterval(today, {
        start: effectiveStart,
        end: effectiveEnd,
      });
      const isPending = isCurrent && !isAfter(today, periodEndDate);
      const met = count >= targetValue;

      weeks.push({
        weekStart: format(cursor, "yyyy-MM-dd"),
        count,
        met,
        isCurrent,
        isPending,
      });
    }

    cursor = addWeeks(cursor, 1);
  }

  const currentWeek = weeks.find((w) => w.isCurrent);
  const currentWeekCount = currentWeek?.count ?? 0;
  const completedWeeks = weeks.filter((w) => !w.isPending);
  const weeksMet = completedWeeks.filter((w) => w.met).length;
  const weeksElapsed = completedWeeks.length;
  const weeksTotal = weeks.length;

  return {
    weeks,
    weeksMet,
    weeksElapsed,
    weeksTotal,
    currentWeekCount,
  };
}

/** Whether every non-pending week in the period met the weekly target. */
export function allWeeklyTargetsMet(adherence: WeeklyAdherence): boolean {
  const evaluableWeeks = adherence.weeks.filter((w) => !w.isPending);
  return evaluableWeeks.length > 0 && evaluableWeeks.every((w) => w.met);
}

export function weeklyProgressPercentage(
  currentWeekCount: number,
  targetValue: number
): number {
  if (targetValue <= 0) return 0;
  return Math.min(100, Math.round((currentWeekCount / targetValue) * 100));
}

export function weeklyRemaining(currentWeekCount: number, targetValue: number): number {
  return Math.max(0, targetValue - currentWeekCount);
}
