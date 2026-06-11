
import { useState, useEffect } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { useSport } from "@/context/SportContext";

const Index = () => {
  const [isDataReady, setIsDataReady] = useState(false);
  const { isLoading: sportLoading } = useSport();

  const {
    matches,
    filteredMatches,
    refreshMatches
  } = useMatchesData();

  const {
    playerNotes,
    refreshNotes,
    handleDeleteNote
  } = useNotesData();

  // Wait for sport preferences, then load dashboard data in one pass
  useEffect(() => {
    if (sportLoading) return;

    let cancelled = false;

    const loadInitialData = async () => {
      try {
        await Promise.all([refreshMatches(undefined), refreshNotes()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        if (!cancelled) {
          setIsDataReady(true);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [refreshMatches, refreshNotes, sportLoading]);

  if (sportLoading || !isDataReady) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center overflow-y-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-y-auto">

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <DashboardContent
            matches={matches}
            filteredMatches={filteredMatches}
            playerNotes={playerNotes}
            onMatchDelete={() => refreshMatches(undefined)}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
