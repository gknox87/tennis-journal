import { useState, useCallback } from "react";
import { Match } from "@/types/match";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";

export const useMatchesData = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const { fetchMatches } = useDataFetching();

  const refreshMatches = useCallback(async () => {
    console.log('Refreshing matches data...');
    const matchesData = await fetchMatches();
    console.log('Fetched matches:', matchesData);
    setMatches(matchesData);
    setFilteredMatches(matchesData);
  }, [fetchMatches]);

  return {
    matches,
    setMatches,
    filteredMatches,
    setFilteredMatches,
    refreshMatches
  };
};