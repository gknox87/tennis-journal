
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { Tag } from "@/types/match";
import { useToast } from "@/hooks/use-toast";

export const useDataFetching = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlayerNotes = async () => {
    try {
      console.log('Fetching player notes...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping notes fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched notes:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching player notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch player notes. Please make sure you're logged in.",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchTags = async () => {
    try {
      console.log('Fetching tags...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping tag fetch');
        toast({
          title: "Authentication Required",
          description: "Please log in to view tags",
          variant: "destructive",
        });
        return [];
      }

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', session.user.id)  // Restore user_id filter
        .order('name');
      
      if (error) throw error;
      console.log('Fetched tags:', data);
      return data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags. Please make sure you're logged in.",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching matches...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping match fetch');
        toast({
          title: "Authentication Required",
          description: "Please log in to view matches",
          variant: "destructive",
        });
        return [];
      }

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
        .eq('user_id', session.user.id)  // Restore user_id filter
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
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches. Please make sure you're logged in.",
        variant: "destructive",
      });
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
