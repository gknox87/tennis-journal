
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { useToast } from "@/hooks/use-toast";

export const useDataFetching = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth check error:', error);
      throw error;
    }
    if (!session) {
      throw new Error('No active session');
    }
    return session;
  }, []);

  const fetchPlayerNotes = useCallback(async () => {
    try {
      const session = await checkAuth();

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Limit initial load

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching player notes:', error);
      if (error.message === 'No active session') {
        toast({
          title: "Authentication Required",
          description: "Please log in to view notes",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch player notes",
          variant: "destructive",
        });
      }
      return [];
    }
  }, [checkAuth, toast]);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await checkAuth();

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          id,
          created_at,
          date,
          score,
          is_win,
          notes,
          final_set_tiebreak,
          opponent_id,
          court_type,
          opponents (
            name
          )
        `)
        .order("date", { ascending: false })
        .limit(10); // Limit initial load

      if (matchesError) throw matchesError;

      const processedMatches: Match[] = matchesData?.map(match => ({
        id: match.id,
        created_at: match.created_at,
        date: match.date,
        score: match.score,
        is_win: match.is_win,
        notes: match.notes || null,
        final_set_tiebreak: match.final_set_tiebreak || false,
        opponent_id: match.opponent_id || null,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        user_id: session.user.id,
        court_type: match.court_type || null,
      })) || [];

      return processedMatches;
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      if (error.message === 'No active session') {
        toast({
          title: "Authentication Required",
          description: "Please log in to view matches",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch matches",
          variant: "destructive",
        });
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, toast]);

  return {
    fetchPlayerNotes,
    fetchMatches,
    isLoading
  };
};
