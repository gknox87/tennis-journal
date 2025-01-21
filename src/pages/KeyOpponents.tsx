import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Opponent {
  id: string;
  name: string;
  created_at: string;
  matches: {
    id: string;
    date: string;
    is_win: boolean;
  }[];
}

const KeyOpponents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeyOpponents = async () => {
      try {
        const { data, error } = await supabase
          .from('opponents')
          .select(`
            *,
            matches (
              id,
              date,
              is_win
            )
          `)
          .eq('is_key_opponent', true)
          .order('name');

        if (error) throw error;
        setOpponents(data || []);
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

  const getOpponentStats = (matches: Opponent['matches']) => {
    const totalMatches = matches.length;
    const wins = matches.filter(match => match.is_win).length;
    const lastMatch = matches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      totalMatches,
      wins,
      losses: totalMatches - wins,
      lastMatch: lastMatch ? new Date(lastMatch.date).toLocaleDateString() : 'No matches'
    };
  };

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
          {opponents.map((opponent) => {
            const stats = getOpponentStats(opponent.matches);
            return (
              <Card 
                key={opponent.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/opponent/${opponent.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{opponent.name}</span>
                    <Badge variant="outline">
                      {stats.totalMatches} {stats.totalMatches === 1 ? 'match' : 'matches'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Record:</span>
                      <span className="font-medium">
                        {stats.wins}W - {stats.losses}L
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Match:</span>
                      <span className="font-medium">{stats.lastMatch}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KeyOpponents;