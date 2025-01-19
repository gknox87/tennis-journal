import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  date: string;
  opponent: string;
  score: string;
  isWin: boolean;
}

export const MatchCard = ({ date, opponent, score, isWin }: MatchCardProps) => {
  return (
    <Card className="match-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{opponent}</CardTitle>
          <Badge variant={isWin ? "default" : "secondary"}>
            {isWin ? "Win" : "Loss"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{date}</p>
        <p className="mt-2 text-lg font-semibold">{score}</p>
      </CardContent>
    </Card>
  );
};