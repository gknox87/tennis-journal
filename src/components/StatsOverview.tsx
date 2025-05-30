
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, CheckCircle, CircleCheck, Award, ThumbsUp, TrendingUp, Zap } from "lucide-react";

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

  const handleStatClick = () => {
    navigate("/matches");
  };

  const stats = [
    {
      title: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      description: "Your success rate"
    },
    {
      title: "Total Matches",
      value: totalMatches,
      icon: Star,
      color: "from-blue-500 to-purple-600",
      bgColor: "from-blue-50 to-purple-50",
      description: "Games played"
    },
    {
      title: "This Year",
      value: matchesThisYear,
      icon: TrendingUp,
      color: "from-green-400 to-blue-500",
      bgColor: "from-green-50 to-blue-50",
      description: "Recent activity"
    },
    {
      title: "Sets Won",
      value: setsWon,
      icon: CircleCheck,
      color: "from-emerald-400 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50",
      description: "Winning sets"
    },
    {
      title: "Sets Lost",
      value: setsLost,
      icon: Award,
      color: "from-rose-400 to-pink-500",
      bgColor: "from-rose-50 to-pink-50",
      description: "Learning moments"
    },
    {
      title: "Tiebreaks",
      value: tiebreaksWon,
      icon: Zap,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-50",
      description: "Clutch wins"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Your Tennis Journey</h2>
        <p className="text-muted-foreground text-sm md:text-base">Track your progress and celebrate your wins!</p>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 px-2">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.title}
              className={`stat-card cursor-pointer touch-manipulation bg-gradient-to-br ${stat.bgColor} border-0 hover:shadow-xl transition-all duration-300 group min-h-[140px] md:min-h-[160px]`}
              onClick={handleStatClick}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center space-y-2 h-full relative z-10">
                <div className={`p-2 md:p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white floating-icon" />
                </div>
                <div className="text-center flex-1 flex flex-col justify-center">
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">{stat.value}</p>
                  <p className="text-xs md:text-sm font-medium text-gray-600 leading-tight mt-1">{stat.title}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden lg:block leading-tight">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
