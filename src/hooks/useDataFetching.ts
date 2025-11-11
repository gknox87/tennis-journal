
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
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

  const fetchScheduledEvents = useCallback(async () => {
    try {
      const session = await checkAuth();

      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return data as ScheduledEvent[] || [];
    } catch (error: any) {
      console.error('Error fetching scheduled events:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduled events",
        variant: "destructive",
      });
      return [];
    }
  }, [checkAuth, toast]);

  const fetchPlayerNotes = useCallback(async () => {
    try {
      const session = await checkAuth();

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(9);

      if (error) {
        console.error('Error fetching player notes:', error);
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching player notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
      return [];
    }
  }, [checkAuth, toast]);

  const fetchMatches = useCallback(async (sportId?: string) => {
    setIsLoading(true);
    try {
      const session = await checkAuth();

      let query = supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          ),
          sports (
            name,
            slug
          )
        `)
        .eq('user_id', session.user.id)
        .order("date", { ascending: false });

      if (sportId) {
        query = query.eq("sport_id", sportId);
      }

      const { data: matchesData, error: matchesError } = await query;

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        throw matchesError;
      }

      const processedMatches: Match[] = matchesData?.map(match => ({
        id: match.id,
        date: match.date,
        score: match.score,
        is_win: match.is_win,
        opponent_id: match.opponent_id || null,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        user_id: session.user.id,
        notes: match.notes || null,
        final_set_tiebreak: match.final_set_tiebreak || false,
        court_type: match.court_type || null,
        created_at: match.created_at,
        sport_id: match.sport_id || null,
        sport_name: match.sports?.name,
        sport_slug: match.sports?.slug
      })) || [];

      return processedMatches;
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, toast]);

  return {
    fetchPlayerNotes,
    fetchMatches,
    fetchScheduledEvents,
    isLoading
  };
};
