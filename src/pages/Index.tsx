
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  // Set up realtime subscriptions with debounced refresh
  useRealtimeSubscriptions({
    onMatchesUpdate: refreshAllData,
    onNotesUpdate: refreshAllData
  });

  // Filter matches with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Filtering matches with:', { searchTerm });
      if (!matches.length) return;

      let filtered = matches;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (match) =>
            match.opponent_name?.toLowerCase().includes(searchLower) ||
            match.score.toLowerCase().includes(searchLower) ||
            match.notes?.toLowerCase().includes(searchLower)
        );
      }

      console.log('Filtered matches:', filtered);
      setFilteredMatches(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, matches, setFilteredMatches]);

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-7xl">
      <Header />
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
