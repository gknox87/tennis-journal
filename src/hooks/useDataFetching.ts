
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { Tag } from "@/types/match";
import { useToast } from "@/hooks/use-toast";

export const useDataFetching = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth check error:', error);
      throw error;
    }
    if (!session) {
      throw new Error('No active session');
    }
    return session;
  };

  const fetchPlayerNotes = async () => {
    try {
      console.log('Fetching player notes...');
      const session = await checkAuth();

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched notes:', data);
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
  };

  const fetchTags = async () => {
    try {
      console.log('Fetching tags...');
      const session = await checkAuth();

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched tags:', data);
      return data || [];
    } catch (error: any) {
      console.error("Error fetching tags:", error);
      if (error.message === 'No active session') {
        toast({
          title: "Authentication Required",
          description: "Please log in to view tags",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tags",
          variant: "destructive",
        });
      }
      return [];
    }
  };

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching matches...');
      const session = await checkAuth();

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          ),
          tags!match_tags (
            id,
            name
          )
        `)
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      console.log('Raw matches data:', matchesData);

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
        tags: match.tags || [],
        user_id: session.user.id,
        court_type: match.court_type || null,
      })) || [];

      console.log('Processed matches:', processedMatches);
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
  };

  return {
    fetchPlayerNotes,
    fetchTags,
    fetchMatches,
    isLoading
  };
};
