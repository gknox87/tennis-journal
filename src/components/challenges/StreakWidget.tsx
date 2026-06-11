import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJournalingStreak } from '@/hooks/useJournalingStreak';
import { normalizeDate } from '@/utils/streakCalculations';
import { Card, CardContent } from '@/components/ui/card';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakWidget() {
  const [expanded, setExpanded] = useState(false);
  const { streakData, journaledDates } = useJournalingStreak();

  if (streakData.isLoading) {
    return (
      <Card className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border-0 shadow-xl overflow-hidden rounded-2xl">
        <CardContent className="px-5 py-5 relative z-10">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="h-14 w-14 rounded-full bg-white/20" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-10 w-28 rounded-lg bg-white/20" />
              <div className="h-4 w-48 rounded bg-white/15" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentStreak, longestStreak, totalJournalDays, weeklyConsistency } = streakData;

  const getWeekDots = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = normalizeDate(date);
      return {
        dateStr,
        isJournaled: journaledDates.has(dateStr),
        isToday: date.getTime() === today.getTime(),
        isFuture: date > today,
      };
    });
  };

  const getContributionWeeks = () => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    currentWeekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - w * 7);
      const days = Array.from({ length: 7 }, (_, d) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = normalizeDate(date);
        return {
          dateStr,
          isJournaled: journaledDates.has(dateStr),
          isFuture: date > today,
        };
      });
      weeks.push(days);
    }
    return weeks;
  };

  const weekDots = getWeekDots();
  const contributionWeeks = getContributionWeeks();
  const weekJournaledCount = weekDots.filter((d) => d.isJournaled && !d.isFuture).length;

  return (
    <Card className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border-0 shadow-xl overflow-hidden rounded-2xl">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8)_0%,transparent_50%)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      <button
        type="button"
        className="w-full text-left relative z-10"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <CardContent className="px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-3xl',
                    currentStreak > 0 ? 'bg-white/20' : 'bg-white/10'
                  )}
                >
                  🔥
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {currentStreak}
                  </span>
                  <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                    day{currentStreak !== 1 ? 's' : ''} streak
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/75">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Best: {longestStreak}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {totalJournalDays} total days
                  </span>
                  <span>{weeklyConsistency}% this week</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1">
                {weekDots.map((dot, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      dot.isFuture
                        ? 'bg-white/20'
                        : dot.isJournaled
                        ? 'bg-white'
                        : 'bg-white/30',
                      dot.isToday && 'ring-1 ring-white ring-offset-1 ring-offset-orange-500'
                    )}
                    title={dot.dateStr}
                  />
                ))}
              </div>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-white/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/70" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <div className="px-5 pb-5 relative z-10 border-t border-white/20">
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                Journaling activity
              </span>
              <span className="text-xs text-white/70">
                This week: {weekJournaledCount}/7
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex gap-1 min-w-max">
                <div className="flex flex-col gap-1 pt-0.5 pr-1">
                  {DAY_LABELS.map((label, i) => (
                    <div
                      key={i}
                      className="h-3 flex items-center text-[10px] font-medium text-white/60"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1">
                  {contributionWeeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          className={cn(
                            'w-3 h-3 rounded-sm',
                            day.isFuture
                              ? 'bg-white/10'
                              : day.isJournaled
                              ? 'bg-white'
                              : 'bg-white/25'
                          )}
                          title={`${day.dateStr}: ${day.isJournaled ? 'Journaled' : 'No entry'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-white/70">
              <span>Last 12 weeks</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white/25" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
