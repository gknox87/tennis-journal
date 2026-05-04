
import { TrainingSession, WeeklyLoadMetrics, RiskZone, ACWRDataPoint, DailyLoadData, ActivityDistributionData, ACTIVITY_TYPES } from "@/types/trainingLoad";
import { format, subDays, eachDayOfInterval, parseISO, startOfDay } from "date-fns";

export function calculateTrainingLoad(rpe: number, durationMinutes: number): number {
  return rpe * durationMinutes;
}

export function calculateEWMA(loads: number[], lambda: number): number {
  return loads.reduce((ewma, load, i) => {
    if (i === 0) return load;
    return load * lambda + ewma * (1 - lambda);
  }, 0);
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
  const dailyLoads28 = getDailyLoads(sessions, 28);

  const weeklyTotalLoad = dailyLoads7.reduce((a, b) => a + b, 0);
  const dailyAverageLoad = weeklyTotalLoad / 7;

  const variance = dailyLoads7.reduce((sum, l) => sum + Math.pow(l - dailyAverageLoad, 2), 0) / 7;
  const standardDeviation = Math.sqrt(variance);

  const trainingMonotony = standardDeviation > 0 ? dailyAverageLoad / standardDeviation : 0;
  const trainingStrain = weeklyTotalLoad * trainingMonotony;

  const acuteLambda = 2 / (7 + 1);
  const chronicLambda = 2 / (28 + 1);

  const acuteLoad = calculateEWMA(dailyLoads28, acuteLambda);
  const chronicLoad = calculateEWMA(dailyLoads28, chronicLambda);
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

  return {
    weeklyTotalLoad,
    dailyAverageLoad,
    standardDeviation,
    trainingMonotony,
    trainingStrain,
    acuteLoad,
    chronicLoad,
    acwr,
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

  const acuteLambda = 2 / (7 + 1);
  const chronicLambda = 2 / (28 + 1);

  let acuteEWMA = 0;
  let chronicEWMA = 0;

  // Build full 56-day window for proper EWMA warm-up
  const fullStart = subDays(today, 55);
  const fullInterval = eachDayOfInterval({ start: fullStart, end: today });

  const results: ACWRDataPoint[] = [];

  fullInterval.forEach((day, i) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLoad = sessions
      .filter((s) => s.session_date === dayStr)
      .reduce((sum, s) => sum + s.training_load, 0);

    if (i === 0) {
      acuteEWMA = dayLoad;
      chronicEWMA = dayLoad;
    } else {
      acuteEWMA = dayLoad * acuteLambda + acuteEWMA * (1 - acuteLambda);
      chronicEWMA = dayLoad * chronicLambda + chronicEWMA * (1 - chronicLambda);
    }

    if (day >= startDate) {
      results.push({
        date: format(day, "MMM dd"),
        acwr: chronicEWMA > 0 ? acuteEWMA / chronicEWMA : 0,
        acuteLoad: acuteEWMA,
        chronicLoad: chronicEWMA,
      });
    }
  });

  return results;
}

export function getActivityDistribution(sessions: TrainingSession[]): ActivityDistributionData[] {
  const map = new Map<string, { count: number; totalLoad: number }>();
  sessions.forEach((s) => {
    const existing = map.get(s.activity_type) || { count: 0, totalLoad: 0 };
    map.set(s.activity_type, { count: existing.count + 1, totalLoad: existing.totalLoad + s.training_load });
  });

  return Array.from(map.entries()).map(([type, data]) => ({
    type: type as ActivityType,
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
