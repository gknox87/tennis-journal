
import { useState, useCallback, useEffect } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const {
    matches,
    filteredMatches,
    setFilteredMatches,
    refreshMatches
  } = useMatchesData();

  const {
    playerNotes,
    refreshNotes,
    handleDeleteNote
  } = useNotesData();

  const refreshAllData = useCallback(async () => {
    try {
      console.log('Refreshing all data...');
      await Promise.all([
        refreshNotes(),
        refreshMatches()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  }, [refreshNotes, refreshMatches, toast]);

  // Set up realtime subscriptions
  useRealtimeSubscriptions({
    onMatchesUpdate: refreshAllData,
    onNotesUpdate: refreshAllData,
    onTagsUpdate: refreshAllData
  });

  // Filter matches when search term changes
  useEffect(() => {
    console.log('Filtering matches with:', { searchTerm });
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.opponent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log('Filtered matches:', filtered);
    setFilteredMatches(filtered);
  }, [searchTerm, matches, setFilteredMatches]);

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <DashboardContent
        matches={matches}
        filteredMatches={filteredMatches}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        playerNotes={playerNotes}
        onMatchDelete={refreshAllData}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};

export default Index;
