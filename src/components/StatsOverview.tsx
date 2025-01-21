import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:gap-4">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{totalMatches}</p>
        </CardContent>
      </Card>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            This Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{matchesThisYear}</p>
        </CardContent>
      </Card>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{winRate}%</p>
        </CardContent>
      </Card>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Sets Won
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{setsWon}</p>
        </CardContent>
      </Card>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Sets Lost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{setsLost}</p>
        </CardContent>
      </Card>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleStatClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Tiebreaks Won
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{tiebreaksWon}</p>
        </CardContent>
      </Card>
    </div>
  );
};