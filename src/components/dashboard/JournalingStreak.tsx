import { useJournalingStreak } from '@/hooks/useJournalingStreak';
import { Card, CardContent } from '@/components/ui/card';
import { getNextMilestone } from '@/utils/streakCalculations';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function JournalingStreak() {
  const { streakData } = useJournalingStreak();

  if (streakData.isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg">
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
    <Card className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 border-0 shadow-xl overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      </div>

      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main streak display */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Fire emoji with pulse animation */}
            <div className="relative">
              <div
                className={cn(
                  "text-5xl md:text-6xl transition-transform duration-300",
                  currentStreak > 0 && "animate-pulse"
                )}
              >
                🔥
              </div>
              {currentStreak > 0 && (
                <div className="absolute inset-0 text-5xl md:text-6xl opacity-50 animate-ping">
                  🔥
                </div>
              )}
            </div>

            {/* Streak number and label */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
                  {currentStreak}
                </span>
                <span className="text-xl md:text-2xl font-semibold text-white/90">
                  day{currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-lg md:text-xl font-medium text-white/95 mt-1">
                {getStreakMessage()}
              </p>
            </div>
          </div>

          {/* Stats and progress */}
          <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[200px]">
            {/* Longest streak */}
            {longestStreak > 0 && (
              <div className="flex items-center gap-2 text-white/90">
                <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base font-medium">
                  Best: {longestStreak} days
                </span>
              </div>
            )}

            {/* Weekly consistency */}
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base font-medium">
                This week: {weeklyConsistency}%
              </span>
            </div>

            {/* Progress to next milestone */}
            {currentStreak > 0 && nextMilestone.daysRemaining > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>Next milestone: {nextMilestone.milestone} days</span>
                  <span>{nextMilestone.daysRemaining} to go</span>
                </div>
                <Progress
                  value={nextMilestone.percentage}
                  className="h-2 bg-white/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Motivational message for zero streak */}
        {currentStreak === 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-center text-white/90 text-sm md:text-base">
              Journal your first match or training session to start your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

