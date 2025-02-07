
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { useToast } from "@/hooks/use-toast";

export const useDataFetching = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
        .limit(5) // Reduced initial load
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) throw error;
      return data ? [data] : [];
    } catch (error: any) {
      console.error('Error fetching player notes:', error);
      return [];
    }
  }, [checkAuth]);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await checkAuth();

      // Fetch only essential data first
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          id,
          date,
          score,
          is_win,
          opponent_id,
          opponents (
            name
          )
        `)
        .order("date", { ascending: false })
        .limit(5); // Reduced initial load

      if (matchesError) throw matchesError;

      const processedMatches: Match[] = matchesData?.map(match => ({
        id: match.id,
        date: match.date,
        score: match.score,
        is_win: match.is_win,
        opponent_id: match.opponent_id || null,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        user_id: session.user.id,
        notes: null, // Load notes on demand
        final_set_tiebreak: false,
        court_type: null,
        created_at: new Date().toISOString()
      })) || [];

      return processedMatches;
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  return {
    fetchPlayerNotes,
    fetchMatches,
    isLoading
  };
};
