import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";

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
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
          .eq("user_id", session.user.id)
          .order('name');

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

  const filteredOpponents = opponents.filter(opponent =>
    opponent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Key Opponents</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search opponents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOpponents.map((opponent) => {
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