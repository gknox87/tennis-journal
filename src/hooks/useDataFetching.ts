
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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log('No session found, skipping notes fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched notes:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching player notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch player notes",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchTags = async () => {
    try {
      console.log('Fetching tags...');
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log('No session found, skipping tag fetch');
        return [];
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      console.log('Fetched tags:', data);
      return data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches...');
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log('No session found, skipping match fetch');
        return [];
      }

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

      const processedMatches = matchesData?.map(match => ({
        ...match,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        tags: match.tags
      })) || [];

      console.log('Fetched matches:', processedMatches);
      return processedMatches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    fetchPlayerNotes,
    fetchTags,
    fetchMatches,
    isLoading
  };
};
