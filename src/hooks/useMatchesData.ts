
import { useState, useCallback, useRef, useEffect } from "react";
import { Match } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";

export const useMatchesData = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const { fetchMatches } = useDataFetching();
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for ongoing fetches
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshMatches = useCallback(async () => {
    if (isFetchingRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    
    try {
      isFetchingRef.current = true;
      abortControllerRef.current = new AbortController();
      
      console.log('Refreshing matches data...');
      const matchesData = await fetchMatches();
      console.log('Fetched matches:', matchesData);
      
      setMatches(matchesData);
      setFilteredMatches(matchesData);
    } finally {
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [fetchMatches]);

  return {
    matches,
    setMatches,
    filteredMatches,
    setFilteredMatches,
    refreshMatches
  };
};
