import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, CheckCircle, CircleCheck, Award, ThumbsUp } from "lucide-react";

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

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:gap-3">
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-primary/20 to-primary/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <Trophy className="w-5 h-5 text-primary mb-1" />
          <p className="text-lg font-bold">{winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-secondary/20 to-secondary/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <Star className="w-5 h-5 text-secondary mb-1" />
          <p className="text-lg font-bold">{totalMatches}</p>
          <p className="text-xs text-muted-foreground">Total Matches</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-accent/20 to-accent/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <CheckCircle className="w-5 h-5 text-accent mb-1" />
          <p className="text-lg font-bold">{matchesThisYear}</p>
          <p className="text-xs text-muted-foreground">This Year</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-primary/20 to-primary/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <CircleCheck className="w-5 h-5 text-primary mb-1" />
          <p className="text-lg font-bold">{setsWon}</p>
          <p className="text-xs text-muted-foreground">Sets Won</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-secondary/20 to-secondary/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <Award className="w-5 h-5 text-secondary mb-1" />
          <p className="text-lg font-bold">{setsLost}</p>
          <p className="text-xs text-muted-foreground">Sets Lost</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 touch-manipulation bg-gradient-to-br from-accent/20 to-accent/5"
        onClick={handleStatClick}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center space-y-1">
          <ThumbsUp className="w-5 h-5 text-accent mb-1" />
          <p className="text-lg font-bold">{tiebreaksWon}</p>
          <p className="text-xs text-muted-foreground">Tiebreaks Won</p>
        </CardContent>
      </Card>
    </div>
  );
};