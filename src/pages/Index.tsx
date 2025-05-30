
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Check auth state and fetch user profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Fetch user profile
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
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
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

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([refreshMatches(), refreshNotes()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    if (!isLoading) {
      loadInitialData();
    }
  }, [refreshMatches, refreshNotes, isLoading]);

  // Filter matches with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
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

      setFilteredMatches(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, matches, setFilteredMatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <Header userProfile={userProfile} />
          <div className="mt-6 sm:mt-8">
            <DashboardContent
              matches={matches}
              filteredMatches={filteredMatches}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              playerNotes={playerNotes}
              onMatchDelete={refreshMatches}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
