
import { useState, useEffect } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const { sport } = useSport();

  // Fetch user profile (auth is already guaranteed by ProtectedRoute)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching profile:', error);
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  // Initial data load - fetch ALL matches (not filtered by sport) so user can see all their data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch all matches without sport filter to show all user data
        // Stats will be filtered by sport in StatsSection component
        await Promise.all([refreshMatches(undefined), refreshNotes()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    // Wait for both auth and sport context to be ready
    if (!isLoading) {
      loadInitialData();
    }
  }, [refreshMatches, refreshNotes, isLoading]);


  // Initialize filteredMatches with all matches when matches are loaded
  useEffect(() => {
    if (matches.length > 0) {
      setFilteredMatches(matches);
    }
  }, [matches, setFilteredMatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* Header - Sticky at top */}
      <Header userProfile={userProfile} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-1 lg:pt-2 pb-24 sm:pb-28">
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
