import { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchDetailViewProps {
  match: Match;
}

export const MatchDetailView = ({ match }: MatchDetailViewProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            {match.opponent_name}
          </CardTitle>
          <Badge 
            variant={match.is_win ? "default" : "destructive"}
            className={`${match.is_win ? "bg-green-500 hover:bg-green-600" : ""} text-center px-4 py-1`}
          >
            {match.is_win ? "Win" : "Loss"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Date</h3>
          <p className="text-base sm:text-lg">
            {new Date(match.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Score</h3>
          <p className="text-xl sm:text-2xl">{match.score}</p>
        </div>
        {match.notes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-base sm:text-lg whitespace-pre-wrap">{match.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};