
import { useState, useCallback, useRef, useEffect } from "react";
import { Match } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";
import { supabase } from "@/integrations/supabase/client";

export const useMatchesData = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const { fetchMatches } = useDataFetching();
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSportIdRef = useRef<string | undefined>(undefined);

  // Cleanup function for ongoing fetches
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshMatches = useCallback(async (sportId?: string) => {
    if (isFetchingRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    
    try {
      isFetchingRef.current = true;
      abortControllerRef.current = new AbortController();
      if (sportId !== undefined) {
        lastSportIdRef.current = sportId;
      }
      
      console.log('Refreshing matches data...');
      const matchesData = await fetchMatches(lastSportIdRef.current);
      console.log('Fetched matches:', matchesData);
      
      setMatches(matchesData);
      setFilteredMatches(matchesData);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    } finally {
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [fetchMatches]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Matches change detected:', payload);
          refreshMatches(lastSportIdRef.current);
        }
      )
      .subscribe((status) => {
        console.log('Matches subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [refreshMatches]);

  return {
    matches,
    setMatches,
    filteredMatches,
    setFilteredMatches,
    refreshMatches
  };
};
