import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types/match";

interface OpponentDetails {
  id: string;
  name: string;
  matches: Match[];
  is_key_opponent: boolean;
  created_at: string;
  user_id: string;
}

const OpponentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opponent, setOpponent] = useState<OpponentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpponentDetails = async () => {
      try {
        const { data: opponentData, error: opponentError } = await supabase
          .from('opponents')
          .select(`
            *,
            matches:matches(*)
          `)
          .eq('id', id)
          .single();

        if (opponentError) throw opponentError;

        // Transform the data to match the OpponentDetails type
        const transformedData: OpponentDetails = {
          ...opponentData,
          matches: opponentData.matches.map((match: any) => ({
            ...match,
            opponent_name: opponentData.name // Add the required opponent_name field
          }))
        };

        setOpponent(transformedData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch opponent details",
          variant: "destructive",
        });
        navigate('/key-opponents');
      } finally {
        setLoading(false);
      }
    };

    fetchOpponentDetails();
  }, [id, navigate, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!opponent) {
    return <div>Opponent not found</div>;
  }

  const wins = opponent.matches.filter(match => match.is_win).length;
  const totalMatches = opponent.matches.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate("/key-opponents")} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{opponent.name}</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <p className="text-2xl font-bold">{totalMatches}</p>
              <p className="text-sm text-muted-foreground">Total Matches</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-bold">{wins}</p>
              <p className="text-sm text-muted-foreground">Wins</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-bold">{totalMatches - wins}</p>
              <p className="text-sm text-muted-foreground">Losses</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-bold">
                {totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Match History</h2>
      <div className="space-y-4">
        {opponent.matches
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((match) => (
            <Card 
              key={match.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/match/${match.id}`)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="font-medium">{new Date(match.date).toLocaleDateString()}</p>
                  <p className="text-lg">{match.score}</p>
                </div>
                <Badge variant={match.is_win ? "default" : "destructive"}>
                  {match.is_win ? "Win" : "Loss"}
                </Badge>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default OpponentDetail;