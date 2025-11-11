import { useNavigate } from "react-router-dom";
import { Trophy, Star, TrendingUp } from "lucide-react";
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
      bgColor: "bg-gradient-to-br from-yellow-50 via-orange-50/80 to-orange-50",
      borderColor: "border-yellow-300/60",
    },
    {
      title: "Total Matches",
      value: totalMatches,
      icon: Star,
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-50 via-purple-50/80 to-purple-50",
      borderColor: "border-blue-300/60",
    },
    {
      title: "This Year",
      value: matchesThisYear,
      icon: TrendingUp,
      color: "from-green-400 to-teal-500",
      bgColor: "bg-gradient-to-br from-green-50 via-teal-50/80 to-teal-50",
      borderColor: "border-green-300/60",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            Your {sportJourneyLabel} Journey
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
            Track your progress and celebrate your wins
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="relative">
        {/* Mobile: Full Width Grid */}
        <div className="sm:hidden grid grid-cols-3 gap-2">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={handleStatClick}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "h-[100px] rounded-xl border-2",
                  stat.bgColor,
                  stat.borderColor,
                  "shadow-md active:shadow-lg",
                  "transition-all duration-200",
                  "active:scale-[0.96]",
                  "touch-manipulation",
                  "relative overflow-hidden"
                )}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-br",
                  stat.color,
                  "flex items-center justify-center",
                  "shadow-md mb-2 relative z-10"
                )}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-extrabold text-gray-900 leading-none mb-1 relative z-10">{stat.value}</p>
                <p className="text-[10px] font-semibold text-gray-700 leading-tight text-center px-1 relative z-10">{stat.title}</p>
              </button>
            );
          })}
        </div>

        {/* Tablet/Desktop: Grid Layout */}
        <div className="hidden sm:grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={handleStatClick}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "h-[110px] md:h-[120px] rounded-xl border-2",
                  stat.bgColor,
                  stat.borderColor,
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "transition-all duration-200",
                  "group cursor-pointer",
                  "relative overflow-hidden"
                )}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                
                <div className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br",
                  stat.color,
                  "flex items-center justify-center",
                  "shadow-md mb-3 group-hover:scale-110",
                  "transition-transform duration-200 relative z-10"
                )}>
                  <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none mb-2 relative z-10">{stat.value}</p>
                <p className="text-xs md:text-sm font-semibold text-gray-700 leading-tight text-center relative z-10">{stat.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
