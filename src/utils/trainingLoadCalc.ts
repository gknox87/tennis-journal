
import { TrainingSession, WeeklyLoadMetrics, RiskZone, ACWRDataPoint, DailyLoadData, ActivityDistributionData, ACTIVITY_TYPES } from "@/types/trainingLoad";
import { format, subDays, eachDayOfInterval, parseISO, startOfDay, differenceInDays } from "date-fns";

export const ACWR_ACUTE_DAYS = 7;
export const ACWR_CHRONIC_DAYS = 28;
export const ACWR_MIN_HISTORY_DAYS = 28;

export function calculateTrainingLoad(rpe: number, durationMinutes: number): number {
  return rpe * durationMinutes;
}

export function getRiskZone(acwr: number): RiskZone {
  if (acwr < 0.8) return "undertraining";
  if (acwr <= 1.3) return "optimal";
  if (acwr <= 1.5) return "caution";
  return "danger";
}

export function getRiskZoneColor(zone: RiskZone): string {
  switch (zone) {
    case "optimal": return "#4CAF50";
    case "caution": return "#FFC107";
    case "danger": return "#F44336";
    case "undertraining": return "#2196F3";
  }
}

export function getRiskZoneLabel(zone: RiskZone): string {
  switch (zone) {
    case "optimal": return "Optimal";
    case "caution": return "Elevated risk";
    case "danger": return "High risk";
    case "undertraining": return "Below range";
  }
}

export function getTrainingHistoryDays(sessions: TrainingSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = sessions.map((s) => startOfDay(parseISO(s.session_date)));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  return differenceInDays(startOfDay(new Date()), earliest) + 1;
}

export function isACWRReliable(sessions: TrainingSession[], asOfDate: Date = startOfDay(new Date())): boolean {
  if (sessions.length === 0) return false;
  const dates = sessions.map((s) => startOfDay(parseISO(s.session_date)));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  return differenceInDays(asOfDate, earliest) + 1 >= ACWR_MIN_HISTORY_DAYS;
}

function buildDailyLoadMap(sessions: TrainingSession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const session of sessions) {
    map.set(session.session_date, (map.get(session.session_date) ?? 0) + session.training_load);
  }
  return map;
}

function getRollingAverageLoad(
  dailyLoads: Map<string, number>,
  endDate: Date,
  windowDays: number
): number {
  let sum = 0;
  for (let i = 0; i < windowDays; i++) {
    const dayStr = format(subDays(endDate, i), "yyyy-MM-dd");
    sum += dailyLoads.get(dayStr) ?? 0;
  }
  return sum / windowDays;
}

export function calculateACWR(
  sessions: TrainingSession[],
  asOfDate: Date = startOfDay(new Date())
): { acuteLoad: number; chronicLoad: number; acwr: number | null; reliable: boolean } {
  const reliable = isACWRReliable(sessions, asOfDate);
  const dailyLoads = buildDailyLoadMap(sessions);
  const acuteLoad = getRollingAverageLoad(dailyLoads, asOfDate, ACWR_ACUTE_DAYS);
  const chronicLoad = getRollingAverageLoad(dailyLoads, asOfDate, ACWR_CHRONIC_DAYS);
  const acwr = reliable && chronicLoad > 0 ? acuteLoad / chronicLoad : null;

  return { acuteLoad, chronicLoad, acwr, reliable };
}

function getDailyLoads(sessions: TrainingSession[], days: number): number[] {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);
  const interval = eachDayOfInterval({ start: startDate, end: today });

  return interval.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return sessions
      .filter((s) => s.session_date === dayStr)
      .reduce((sum, s) => sum + s.training_load, 0);
  });
}

export function calculateWeeklyMetrics(sessions: TrainingSession[]): WeeklyLoadMetrics {
  const dailyLoads7 = getDailyLoads(sessions, 7);

  const weeklyTotalLoad = dailyLoads7.reduce((a, b) => a + b, 0);
  const dailyAverageLoad = weeklyTotalLoad / 7;

  const variance = dailyLoads7.reduce((sum, l) => sum + Math.pow(l - dailyAverageLoad, 2), 0) / 7;
  const standardDeviation = Math.sqrt(variance);

  const trainingMonotony = standardDeviation > 0 ? dailyAverageLoad / standardDeviation : 0;
  const trainingStrain = weeklyTotalLoad * trainingMonotony;

  const { acuteLoad, chronicLoad, acwr, reliable } = calculateACWR(sessions);

  return {
    weeklyTotalLoad,
    dailyAverageLoad,
    standardDeviation,
    trainingMonotony,
    trainingStrain,
    acuteLoad,
    chronicLoad,
    acwr,
    acwrReliable: reliable,
  };
}

export function getDailyLoadChartData(sessions: TrainingSession[], days: number = 14): DailyLoadData[] {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);
  const interval = eachDayOfInterval({ start: startDate, end: today });

  return interval.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const daySessions = sessions.filter((s) => s.session_date === dayStr);
    const load = daySessions.reduce((sum, s) => sum + s.training_load, 0);
    return {
      date: format(day, "MMM dd"),
      load,
      activityType: daySessions[0]?.activity_type,
    };
  });
}

export function getACWRChartData(sessions: TrainingSession[], days: number = 28): ACWRDataPoint[] {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);
  const interval = eachDayOfInterval({ start: startDate, end: today });

  return interval.map((day) => {
    const { acuteLoad, chronicLoad, acwr } = calculateACWR(sessions, day);
    return {
      date: format(day, "MMM dd"),
      acwr,
      acuteLoad,
      chronicLoad,
    };
  });
}

export function getActivityDistribution(sessions: TrainingSession[]): ActivityDistributionData[] {
  const map = new Map<string, { count: number; totalLoad: number }>();
  sessions.forEach((s) => {
    const existing = map.get(s.activity_type) || { count: 0, totalLoad: 0 };
    map.set(s.activity_type, { count: existing.count + 1, totalLoad: existing.totalLoad + s.training_load });
  });

  return Array.from(map.entries()).map(([type, data]) => ({
    type: type as any,
    label: ACTIVITY_TYPES.find((a) => a.value === type)?.label || type,
    ...data,
  }));
}

export function getWeeklyTotals(sessions: TrainingSession[], weeks: number = 8): { week: string; load: number }[] {
  const today = startOfDay(new Date());
  const result: { week: string; load: number }[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = subDays(today, w * 7);
    const weekStart = subDays(weekEnd, 6);
    const weekSessions = sessions.filter((s) => {
      const d = parseISO(s.session_date);
      return d >= weekStart && d <= weekEnd;
    });
    result.push({
      week: format(weekStart, "MMM dd"),
      load: weekSessions.reduce((sum, s) => sum + s.training_load, 0),
    });
  }

  return result;
}
