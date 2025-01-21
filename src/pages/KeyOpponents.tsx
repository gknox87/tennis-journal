import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  date: string;
  score: string;
  is_win: boolean;
}

interface Opponent {
  id: string;
  name: string;
  created_at: string;
  matches?: Match[];
  stats?: {
    wins: number;
    losses: number;
    totalMatches: number;
    lastMatch?: {
      date: string;
      isWin: boolean;
      score: string;
    };
  };
}

const KeyOpponents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeyOpponents = async () => {
      try {
        // First get key opponents
        const { data: opponentsData, error: opponentsError } = await supabase
          .from('opponents')
          .select('*')
          .eq('is_key_opponent', true)
          .order('name');

        if (opponentsError) throw opponentsError;

        // Then get matches for each opponent
        const opponentsWithMatches = await Promise.all(
          (opponentsData || []).map(async (opponent) => {
            const { data: matches, error: matchesError } = await supabase
              .from('matches')
              .select('id, date, score, is_win')
              .eq('opponent_id', opponent.id)
              .order('date', { ascending: false });

            if (matchesError) throw matchesError;

            const stats = matches ? {
              wins: matches.filter(m => m.is_win).length,
              losses: matches.filter(m => !m.is_win).length,
              totalMatches: matches.length,
              lastMatch: matches.length > 0 ? {
                date: matches[0].date,
                isWin: matches[0].is_win,
                score: matches[0].score,
              } : undefined,
            } : undefined;

            return {
              ...opponent,
              matches,
              stats,
            };
          })
        );

        setOpponents(opponentsWithMatches);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch key opponents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKeyOpponents();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Key Opponents</h1>
      </div>

      {loading ? (
        <p>Loading key opponents...</p>
      ) : opponents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No key opponents found. Add key opponents when recording matches.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opponents.map((opponent) => (
            <Card 
              key={opponent.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/opponent/${opponent.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{opponent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Record:</span>
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-green-500">
                        {opponent.stats?.wins || 0} W
                      </Badge>
                      <Badge variant="destructive">
                        {opponent.stats?.losses || 0} L
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Times Played:</span>
                    <span className="font-medium">{opponent.stats?.totalMatches || 0}</span>
                  </div>
                  {opponent.stats?.lastMatch && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-1">Last Match:</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {new Date(opponent.stats.lastMatch.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={opponent.stats.lastMatch.isWin ? "default" : "destructive"}
                            className={opponent.stats.lastMatch.isWin ? "bg-green-500" : ""}
                          >
                            {opponent.stats.lastMatch.isWin ? "Won" : "Lost"}
                          </Badge>
                          <span className="font-medium">{opponent.stats.lastMatch.score}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyOpponents;