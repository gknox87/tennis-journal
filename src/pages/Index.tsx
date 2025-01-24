import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MatchList } from "@/components/MatchList";
import { Header } from "@/components/Header";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { Match } from "@/types/match";

const Index = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);

  const fetchTags = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log("No session found, skipping tag fetch");
        return;
      }

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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log("No session found, skipping match fetch");
        return;
      }

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          ),
          tags!match_tags (
            id,
            name
          )
        `)
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      const processedMatches: Match[] = matchesData?.map(match => ({
        ...match,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        tags: match.tags
      })) || [];

      setMatches(processedMatches);
      setFilteredMatches(processedMatches);
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
          match.opponent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <Header />
      <div className="mt-4 sm:mt-8">
        <StatsSection matches={matches} />
      </div>
      <div className="mt-6 sm:mt-8">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
        />
      </div>
      <div className="mt-4 sm:mt-6">
        <MatchList
          matches={filteredMatches}
          onMatchDelete={fetchMatches}
        />
      </div>
    </div>
  );
};

export default Index;