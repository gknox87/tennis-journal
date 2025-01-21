import { useEffect, useState } from "react";
import { AddMatchButton } from "@/components/AddMatchButton";
import { MatchCard } from "@/components/MatchCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Tag {
  id: string;
  name: string;
}

interface Match {
  id: string;
  date: string;
  opponent: string;
  score: string;
  is_win: boolean;
  final_set_tiebreak?: boolean;
  notes?: string;
  tags?: Tag[];
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    matchesThisYear: 0,
    winRate: 0,
    setsWon: 0,
    setsLost: 0,
    tiebreaksWon: 0,
  });

  const calculateStats = (matches: Match[]) => {
    const currentYear = new Date().getFullYear();
    const matchesThisYear = matches.filter(
      (match) => new Date(match.date).getFullYear() === currentYear
    );
    const wins = matches.filter((match) => match.is_win).length;

    let setsWon = 0;
    let setsLost = 0;
    let tiebreaksWon = 0;

    matches.forEach((match) => {
      const sets = match.score.split(", ");
      sets.forEach((set) => {
        const [playerScore, opponentScore] = set.split("-").map(Number);
        if (playerScore > opponentScore) setsWon++;
        if (opponentScore > playerScore) setsLost++;
        if (playerScore === 7 || opponentScore === 7) tiebreaksWon++;
      });
    });

    setStats({
      totalMatches: matches.length,
      matchesThisYear: matchesThisYear.length,
      winRate: matches.length ? Math.round((wins / matches.length) * 100) : 0,
      setsWon,
      setsLost,
      tiebreaksWon,
    });
  };

  const fetchMatches = async () => {
    try {
      // Fetch matches with their associated tags
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch all tags for these matches
      const { data: tagsData, error: tagsError } = await supabase
        .from("match_tags")
        .select(`
          match_id,
          tags:tag_id(id, name)
        `)
        .in(
          "match_id",
          matchesData.map((match) => match.id)
        );

      if (tagsError) throw tagsError;

      // Combine matches with their tags
      const matchesWithTags = matchesData.map((match) => ({
        ...match,
        tags: tagsData
          ?.filter((tag) => tag.match_id === match.id)
          .map((tag) => tag.tags),
      }));

      setMatches(matchesWithTags);
      calculateStats(matchesWithTags);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMatches();

    const subscription = supabase
      .channel("matches_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleEditMatch = (matchId: string) => {
    navigate(`/edit-match/${matchId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tennis Match Journal</h1>
        <div className="flex gap-4">
          <AddMatchButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <StatsOverview
          {...stats}
          onRefresh={fetchMatches}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            id={match.id}
            date={match.date}
            opponent={match.opponent}
            score={match.score}
            isWin={match.is_win}
            finalSetTiebreak={match.final_set_tiebreak}
            tags={match.tags}
            onDelete={fetchMatches}
            onEdit={() => handleEditMatch(match.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;