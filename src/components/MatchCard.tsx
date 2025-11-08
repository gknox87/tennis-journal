
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, Target, TrendingUp, TrendingDown } from "lucide-react";

import { DEFAULT_SPORT_ID, SPORTS, type SupportedSportId } from "@/constants/sports";

interface MatchCardProps {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  isWin: boolean;
  finalSetTiebreak?: boolean;
  sportId?: string | null;
  sportName?: string | null;
  onDelete: () => void;
  onEdit: () => void;
}

export const MatchCard = ({ 
  id, 
  date, 
  opponent_name = "Unknown Opponent", 
  score, 
  isWin,
  sportId,
  sportName,
  onDelete,
  onEdit 
}: MatchCardProps) => {
  const navigate = useNavigate();
  const resolvedSport = (() => {
    const id = sportId as SupportedSportId | undefined;
    if (id && SPORTS[id]) {
      return SPORTS[id];
    }
    return SPORTS[DEFAULT_SPORT_ID];
  })();

  const handleCardClick = () => {
    navigate(`/match/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const cardGradient = isWin 
    ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" 
    : "bg-gradient-to-br from-red-50 to-rose-100 border-red-200";

  const iconColor = isWin ? "text-green-600" : "text-red-600";
  const ResultIcon = isWin ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={`match-card hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${cardGradient} hover:scale-[1.02] group relative overflow-hidden`}
      onClick={handleCardClick}
    >
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isWin ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-full ${isWin ? 'bg-green-100' : 'bg-red-100'} flex-shrink-0`}>
              <ResultIcon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-800 truncate mb-1">
                {opponent_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{formatDate(date)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <span aria-hidden>{resolvedSport.icon}</span>
                  {sportName ?? resolvedSport.shortName}
                </span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant={isWin ? "default" : "destructive"}
            className={`text-xs font-bold px-3 py-1 flex-shrink-0 ${
              isWin 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <Trophy className="h-3 w-3 mr-1" />
            {isWin ? "WIN" : "LOSS"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-6">
        <div className="flex items-center gap-3">
          <Target className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
          <span className="text-2xl font-bold text-gray-800">
            {score}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
