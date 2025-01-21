import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Opponent {
  id: string;
  name: string;
  matches: {
    is_win: boolean;
    date: string;
    score: string;
  }[];
}

const KeyOpponents = () => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOpponents = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to view key opponents.",
            variant: "destructive",
          });
          return;
        }

        const { data: opponentsData, error } = await supabase
          .from("opponents")
          .select(`
            id,
            name,
            matches (
              is_win,
              date,
              score
            )
          `)
          .eq("is_key_opponent", true)
          .eq("user_id", session.user.id);

        if (error) throw error;

        setOpponents(opponentsData || []);
      } catch (error) {
        console.error("Error fetching opponents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch key opponents.",
          variant: "destructive",
        });
      }
    };

    fetchOpponents();
  }, [toast]);

  const getOpponentStats = (matches: Opponent["matches"]) => {
    const wins = matches.filter(match => match.is_win).length;
    const losses = matches.length - wins;
    const lastMatch = matches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      wins,
      losses,
      timesPlayed: matches.length,
      lastMatch,
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Key Opponents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opponents.map((opponent) => {
          const stats = getOpponentStats(opponent.matches);
          return (
            <Card key={opponent.id} className="w-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{opponent.name}</h2>
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
        })}
      </div>
    </div>
  );
};

export default KeyOpponents;