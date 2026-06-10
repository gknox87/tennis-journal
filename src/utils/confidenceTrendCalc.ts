import { Match } from '@/types/match';
import { WellnessEntry } from '@/types/wellness';
import { format, parseISO } from 'date-fns';

export interface ConfidenceDataPoint {
  date: string;
  dailyConfidence: number | null;
  matchConfidence: number | null;
  isWin?: boolean;
  opponent?: string;
}

export function buildConfidenceTimeline(
  wellnessEntries: WellnessEntry[],
  matches: Match[],
  days = 90
): ConfidenceDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = format(cutoff, 'yyyy-MM-dd');

  const byDate = new Map<string, ConfidenceDataPoint>();

  for (const entry of wellnessEntries) {
    if (entry.entry_date < cutoffStr) continue;
    byDate.set(entry.entry_date, {
      date: entry.entry_date,
      dailyConfidence: entry.performance_confidence,
      matchConfidence: null,
    });
  }

  for (const match of matches) {
    if (match.date < cutoffStr || match.pre_confidence == null) continue;
    const existing = byDate.get(match.date);
    if (existing) {
      existing.matchConfidence = match.pre_confidence;
      existing.isWin = match.is_win;
      existing.opponent = match.opponent_name ?? undefined;
    } else {
      byDate.set(match.date, {
        date: match.date,
        dailyConfidence: null,
        matchConfidence: match.pre_confidence,
        isWin: match.is_win,
        opponent: match.opponent_name ?? undefined,
      });
    }
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function formatConfidenceChartData(points: ConfidenceDataPoint[]) {
  return points.map((p) => ({
    ...p,
    dateLabel: format(parseISO(p.date), 'MMM dd'),
  }));
}
