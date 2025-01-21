import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MatchList } from "@/components/MatchList";
import { Header } from "@/components/Header";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";

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
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Header />
      <StatsSection matches={matches} onRefresh={fetchMatches} />
      <SearchSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
      />
      <div className="mt-6">
        <MatchList
          matches={filteredMatches}
          onMatchDelete={fetchMatches}
        />
      </div>
    </div>
  );
};

export default Index;