import { useEffect, useState } from "react";
import { AddMatchButton } from "@/components/AddMatchButton";
import { StatsOverview } from "@/components/StatsOverview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { TagCloud } from "@/components/TagCloud";
import { SearchBar } from "@/components/SearchBar";
import { MatchList } from "@/components/MatchList";

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
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
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

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      if (data) {
        setAvailableTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      const { data: tagsData, error: tagsError } = await supabase
        .from("match_tags")
        .select(`
          match_id,
          tags:tag_id(id, name)
        `)
        .in(
          "match_id",
          matchesData?.map((match) => match.id) || []
        );

      if (tagsError) throw tagsError;

      const matchesWithTags = matchesData?.map((match) => ({
        ...match,
        tags: tagsData
          ?.filter((tag) => tag.match_id === match.id)
          .map((tag) => tag.tags),
      }));

      setMatches(matchesWithTags || []);
      setFilteredMatches(matchesWithTags || []);
      calculateStats(matchesWithTags || []);
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
    fetchTags();

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

  useEffect(() => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((match) =>
        selectedTags.every((tagId) =>
          match.tags?.some((tag) => tag.id === tagId)
        )
      );
    }

    setFilteredMatches(filtered);
  }, [searchTerm, selectedTags, matches]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Tennis Match Journal</h1>
        <div className="flex gap-2 sm:gap-4">
          <AddMatchButton />
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <StatsOverview {...stats} onRefresh={fetchMatches} />
      </div>

      <TagCloud
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <MatchList
        matches={filteredMatches}
        onMatchDelete={fetchMatches}
      />
    </div>
  );
};

export default Index;
