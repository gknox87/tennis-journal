import { useState } from 'react';
import { Flame, Trophy, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJournalingStreak } from '@/hooks/useJournalingStreak';

interface StreakWidgetProps {
  onTap?: () => void;
}

export function StreakWidget({ onTap }: StreakWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { streakData, journaledDates } = useJournalingStreak();

  // Calculate this week's dots (Mon-Sun)
  const getWeekDots = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Adjust to Monday
    monday.setHours(0, 0, 0, 0);

    const dots = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isJournaled = journaledDates.has(dateStr);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      dots.push({ date, dateStr, isJournaled, isToday, isFuture });
    }
    return dots;
  };

  const weekDots = getWeekDots();

  // Generate last 12 weeks for contribution graph
  const getContributionWeeks = () => {
    const weeks = [];
    const today = new Date();
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    currentWeekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    currentWeekStart.setHours(0, 0, 0, 0);

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (w * 7));
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
          date,
          dateStr,
          isJournaled: journaledDates.has(dateStr),
          isFuture: date > today,
        });
      }
      weeks.push({ start: weekStart, days });
    }
    return weeks;
  };

  const contributionWeeks = getContributionWeeks();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main header - always visible */}
      <button
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && onTap) onTap();
        }}
      >
        <div className="flex items-center gap-3">
          {/* Flame icon with streak count */}
          <div className="relative">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                streakData.currentStreak > 0
                  ? 'bg-gradient-to-br from-orange-400 to-red-500'
                  : 'bg-gray-100'
              )}
            >
              <Flame
                className={cn(
                  'w-6 h-6',
                  streakData.currentStreak > 0 ? 'text-white' : 'text-gray-400'
                )}
              />
            </div>
            {streakData.currentStreak > 0 && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {streakData.currentStreak > 99 ? '99+' : streakData.currentStreak}
              </div>
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {streakData.currentStreak}
              </span>
              <span className="text-sm text-gray-500">day streak</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Best: {streakData.longestStreak}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {streakData.totalJournalDays} total days
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* This week dots */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            {weekDots.map((dot, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  dot.isFuture
                    ? 'bg-gray-100'
                    : dot.isJournaled
                    ? 'bg-green-500'
                    : 'bg-gray-200',
                  dot.isToday && 'ring-1 ring-purple-500 ring-offset-1'
                )}
              />
            ))}
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Streak calendar view (GitHub-style contribution graph) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Journaling Activity</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>Less</span>
                <div className="w-2 h-2 rounded-sm bg-gray-100" />
                <div className="w-2 h-2 rounded-sm bg-green-200" />
                <div className="w-2 h-2 rounded-sm bg-green-400" />
                <div className="w-2 h-2 rounded-sm bg-green-600" />
                <span>More</span>
              </div>
            </div>

            {/* Week labels */}
            <div className="flex gap-1 mb-1">
              {['M', '', 'W', '', 'F', '', 'S'].map((day, i) => (
                <div key={i} className="w-3 text-xs text-gray-400 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Contribution grid */}
            <div className="flex gap-0.5">
              {contributionWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.days.map((day, di) => (
                    <div
                      key={di}
                      className={cn(
                        'w-3 h-3 rounded-sm transition-colors',
                        day.isFuture
                          ? 'bg-gray-50'
                          : day.isJournaled
                          ? streakData.currentStreak > 90
                            ? 'bg-green-600'
                            : streakData.currentStreak > 30
                            ? 'bg-green-400'
                            : 'bg-green-200'
                          : 'bg-gray-100'
                      )}
                      title={`${day.dateStr}: ${day.isJournaled ? 'Journaled' : 'No entry'}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{streakData.totalJournalDays} total journal days</span>
              <span>This week: {weekDots.filter(d => d.isJournaled && !d.isFuture).length}/7</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
