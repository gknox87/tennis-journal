import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";

const Index = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);

  const { fetchPlayerNotes, fetchTags, fetchMatches } = useDataFetching();

  const refreshData = useCallback(async () => {
    console.log('Refreshing all data...');
    const [notesData, tagsData, matchesData] = await Promise.all([
      fetchPlayerNotes(),
      fetchTags(),
      fetchMatches()
    ]);

    setPlayerNotes(notesData);
    setAvailableTags(tagsData);
    setMatches(matchesData);
    setFilteredMatches(matchesData);
  }, [fetchPlayerNotes, fetchTags, fetchMatches]);

  // Set up realtime subscriptions
  useRealtimeSubscriptions({
    onMatchesUpdate: refreshData,
    onNotesUpdate: refreshData,
    onTagsUpdate: refreshData
  });

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("player_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      
      // Real-time subscription will handle the update
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  // Filter matches when search term or selected tags change
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

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <Header />
      <DashboardContent
        matches={matches}
        filteredMatches={filteredMatches}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        playerNotes={playerNotes}
        onMatchDelete={refreshData}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};

export default Index;