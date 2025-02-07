
import { useState, useCallback, useRef } from "react";
import { Match } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";

export const useMatchesData = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const { fetchMatches } = useDataFetching();
  const isFetchingRef = useRef(false);

  const refreshMatches = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      console.log('Refreshing matches data...');
      const matchesData = await fetchMatches();
      console.log('Fetched matches:', matchesData);
      setMatches(matchesData);
      setFilteredMatches(matchesData);
    } finally {
      isFetchingRef.current = false;
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
