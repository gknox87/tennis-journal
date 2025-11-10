import { useNavigate } from "react-router-dom";
import { Trophy, Star, TrendingUp, CircleCheck, Award, Zap } from "lucide-react";
import { useSport } from "@/context/SportContext";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  totalMatches: number;
  matchesThisYear: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
  tiebreaksWon: number;
}

export const StatsOverview = ({ 
  totalMatches,
  matchesThisYear,
  winRate,
  setsWon,
  setsLost,
  tiebreaksWon,
}: StatsOverviewProps) => {
  const navigate = useNavigate();
  const { sport } = useSport();
  const sportJourneyLabel = sport?.name ?? "Sport";

  const handleStatClick = () => {
    navigate("/matches");
  };

  const stats = [
    {
      title: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200/50",
    },
    {
      title: "Total Matches",
      value: totalMatches,
      icon: Star,
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      borderColor: "border-blue-200/50",
    },
    {
      title: "This Year",
      value: matchesThisYear,
      icon: TrendingUp,
      color: "from-green-400 to-teal-500",
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      borderColor: "border-green-200/50",
    },
    {
      title: "Sets Won",
      value: setsWon,
      icon: CircleCheck,
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200/50",
    },
    {
      title: "Sets Lost",
      value: setsLost,
      icon: Award,
      color: "from-rose-400 to-pink-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200/50",
    },
    {
      title: "Tiebreaks",
      value: tiebreaksWon,
      icon: Zap,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200/50",
    }
  ];

  return (
    <div className="space-y-2.5">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold gradient-text leading-tight">Your {sportJourneyLabel} Journey</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">Track your progress and celebrate your wins</p>
        </div>
      </div>
      
      {/* Horizontal Scrolling Stats on Mobile, Single Row on Desktop */}
      <div className="relative">
        {/* Mobile: Horizontal Scroll */}
        <div className="sm:hidden overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-2 min-w-max px-1">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <button
                  key={stat.title}
                  onClick={handleStatClick}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center justify-center",
                    "min-w-[90px] w-[90px] h-[72px]",
                    "rounded-lg border border-gray-200/60",
                    "bg-white/90 backdrop-blur-sm",
                    stat.bgColor,
                    stat.borderColor,
                    "shadow-sm active:shadow-md",
                    "transition-all duration-150",
                    "active:scale-[0.97]",
                    "touch-manipulation",
                    "snap-start"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md bg-gradient-to-r",
                    stat.color,
                    "flex items-center justify-center",
                    "shadow-sm mb-1"
                  )}>
                    <IconComponent className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{stat.value}</p>
                  <p className="text-[9px] font-medium text-gray-600 leading-tight text-center px-0.5">{stat.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablet/Desktop: Single Row Grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-6 gap-2">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={handleStatClick}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "h-[76px] md:h-20 rounded-lg border",
                  "bg-white/90 backdrop-blur-sm",
                  stat.bgColor,
                  stat.borderColor,
                  "shadow-sm hover:shadow-md hover:scale-[1.02]",
                  "transition-all duration-200",
                  "group cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-7 h-7 md:w-8 md:h-8 rounded-md bg-gradient-to-r",
                  stat.color,
                  "flex items-center justify-center",
                  "shadow-sm mb-1.5 md:mb-2 group-hover:scale-110",
                  "transition-transform duration-200"
                )}>
                  <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <p className="text-base md:text-lg font-bold text-gray-900 leading-none mb-0.5 md:mb-1">{stat.value}</p>
                <p className="text-[10px] md:text-xs font-medium text-gray-600 leading-tight text-center">{stat.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
