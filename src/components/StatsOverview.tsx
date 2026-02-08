import { useNavigate } from "react-router-dom";
import { Trophy, Star, TrendingUp, ChevronRight } from "lucide-react";
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
      color: "from-amber-400 to-orange-500",
      iconBg: "bg-amber-500/10",
      accent: "text-amber-600",
      ring: "ring-amber-200/60",
    },
    {
      title: "Total Matches",
      value: totalMatches,
      icon: Star,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10",
      accent: "text-blue-600",
      ring: "ring-blue-200/60",
    },
    {
      title: "This Year",
      value: matchesThisYear,
      icon: TrendingUp,
      color: "from-emerald-400 to-teal-500",
      iconBg: "bg-emerald-500/10",
      accent: "text-emerald-600",
      ring: "ring-emerald-200/60",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
            Your {sportJourneyLabel} Journey
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
            Track your progress and celebrate your wins
          </p>
        </div>
        <button
          onClick={handleStatClick}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
        >
          Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="relative">
        {/* Mobile: Full Width Grid */}
        <div className="sm:hidden grid grid-cols-3 gap-2.5">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={handleStatClick}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "py-4 rounded-xl",
                  "bg-gray-50/80 border border-gray-100",
                  "active:bg-gray-100/80 active:scale-[0.97]",
                  "transition-all duration-150",
                  "touch-manipulation"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg",
                  stat.iconBg,
                  "flex items-center justify-center mb-2"
                )}>
                  <IconComponent className={cn("w-4 h-4", stat.accent)} />
                </div>
                <p className="text-xl font-bold text-gray-900 leading-none mb-1 tabular-nums">{stat.value}</p>
                <p className={cn("text-[10px] font-semibold uppercase tracking-wider", stat.accent)}>{stat.title}</p>
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
                  "py-5 md:py-6 rounded-xl",
                  "bg-gray-50/60 border border-gray-100",
                  "hover:bg-white hover:shadow-md hover:border-gray-200",
                  "hover:ring-2", stat.ring,
                  "transition-all duration-200",
                  "group cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-xl",
                  stat.iconBg,
                  "flex items-center justify-center",
                  "mb-3 group-hover:scale-110",
                  "transition-transform duration-200"
                )}>
                  <IconComponent className={cn("w-5 h-5 md:w-5.5 md:h-5.5", stat.accent)} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-none mb-1.5 tabular-nums">{stat.value}</p>
                <p className={cn("text-[11px] md:text-xs font-semibold uppercase tracking-wider", stat.accent)}>{stat.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
