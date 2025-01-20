import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsOverviewProps {
  totalMatches: number;
  matchesThisYear: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
  tiebreaksWon: number;
  onRefresh: () => void;
}

export const StatsOverview = ({ 
  totalMatches,
  matchesThisYear,
  winRate,
  setsWon,
  setsLost,
  tiebreaksWon,
  onRefresh
}: StatsOverviewProps) => {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-0 z-10"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMatches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matches This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{matchesThisYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{winRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sets Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{setsWon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sets Lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{setsLost}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiebreaks Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tiebreaksWon}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};