import { useJournalingStreak } from '@/hooks/useJournalingStreak';
import { Card, CardContent } from '@/components/ui/card';
import { getNextMilestone } from '@/utils/streakCalculations';
import { Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function JournalingStreak() {
  const { streakData } = useJournalingStreak();

  if (streakData.isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentStreak, longestStreak, weeklyConsistency } = streakData;
  const nextMilestone = getNextMilestone(currentStreak);

  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your journaling journey!";
    }
    if (currentStreak === 1) {
      return "You're on fire! 🔥";
    }
    if (currentStreak < 7) {
      return "Keep it going! 🔥";
    }
    return "Incredible consistency! 🔥";
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border-0 shadow-2xl overflow-hidden relative rounded-2xl">
      {/* Layered background effects */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.4)_0%,transparent_40%)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col items-start gap-4">
          {/* Main streak display */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Fire emoji with glow */}
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-xl transition-opacity duration-700",
                  currentStreak > 0 ? "bg-yellow-300/40 opacity-100 animate-pulse" : "opacity-0"
                )}
              />
              <div
                className={cn(
                  "relative text-5xl md:text-6xl transition-transform duration-500 select-none",
                  currentStreak > 0 && "hover:scale-110"
                )}
              >
                🔥
              </div>
            </div>

            {/* Streak number and label */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                  {currentStreak}
                </span>
                <span className="text-lg md:text-xl font-semibold text-white/80 uppercase tracking-wider">
                  day{currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-base md:text-lg font-medium text-white/90 mt-0.5">
                {getStreakMessage()}
              </p>
            </div>
          </div>

          {/* Stats pills and progress */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap gap-2">
              {/* Longest streak pill */}
              {longestStreak > 0 && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-white/95 shadow-inner">
                  <Trophy className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    Best: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Weekly consistency pill */}
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-white/95 shadow-inner">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                  Week: {weeklyConsistency}%
                </span>
              </div>
            </div>

            {/* Progress to next milestone */}
            {currentStreak > 0 && nextMilestone.daysRemaining > 0 && (
              <div className="space-y-1.5 mt-1 max-w-xs">
                <div className="flex items-center justify-between text-[11px] md:text-xs font-medium text-white/75">
                  <span>Next: {nextMilestone.milestone} days</span>
                  <span>{nextMilestone.daysRemaining} to go</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-300 to-white transition-all duration-500 ease-out"
                    style={{ width: `${nextMilestone.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational message for zero streak */}
        {currentStreak === 0 && (
          <div className="mt-5 pt-4 border-t border-white/20">
            <p className="text-center text-white/90 text-sm md:text-base font-medium">
              Journal your first match or training session to start your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

