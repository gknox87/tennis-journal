
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface OpponentCardProps {
  opponent: {
    id: string;
    name: string;
    matches: {
      is_win: boolean;
      date: string;
      score: string;
    }[];
  };
  onDelete: (id: string) => void;
}

export const OpponentCard = ({ opponent, onDelete }: OpponentCardProps) => {
  const stats = {
    wins: opponent.matches.filter(match => match.is_win).length,
    losses: opponent.matches.filter(match => !match.is_win).length,
    timesPlayed: opponent.matches.length,
    lastMatch: opponent.matches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{opponent.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(opponent.id)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Badge variant="default" className="bg-green-500">
              Wins: {stats.wins}
            </Badge>
            <Badge variant="destructive">
              Losses: {stats.losses}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Times Played: {stats.timesPlayed}
          </p>
          {stats.lastMatch && (
            <div className="text-sm">
              <p className="font-medium">Last Result:</p>
              <p>
                {new Date(stats.lastMatch.date).toLocaleDateString()} -{" "}
                {stats.lastMatch.is_win ? (
                  <span className="text-green-600">Won</span>
                ) : (
                  <span className="text-red-600">Lost</span>
                )}{" "}
                {stats.lastMatch.score}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
