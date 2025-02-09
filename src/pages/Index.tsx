
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMatchesData } from "@/hooks/useMatchesData";
import { useNotesData } from "@/hooks/useNotesData";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
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

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
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
  }, [navigate, toast]);

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
      await Promise.all([refreshMatches(), refreshNotes()]);
    };
    
    loadInitialData();
  }, [refreshMatches, refreshNotes]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Header userProfile={userProfile} />
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
  );
};

export default Index;
