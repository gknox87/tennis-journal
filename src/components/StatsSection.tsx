
import { Match } from "@/types/match";
import { StatsOverview } from "./StatsOverview";
import { useSport } from "@/context/SportContext";

interface StatsSectionProps {
  matches: Match[];
}

export const StatsSection = ({ matches }: StatsSectionProps) => {
  const { sport } = useSport();
  
  // Filter matches by current sport to calculate sport-specific stats
  // This allows users to see stats for their selected sport even if they have matches for multiple sports
  // If no matches match the current sport, fall back to all matches (user might have data for a different sport)
  const sportMatches = sport?.id 
    ? matches.filter((match) => match.sport_id === sport.id)
    : matches;
  
  // If filtering by sport returns no matches, but we have matches, use all matches for stats
  // This handles the case where user's profile sport doesn't match their match data
  const matchesForStats = sportMatches.length > 0 ? sportMatches : matches;
  
  const totalMatches = matchesForStats.length;
  const currentYear = new Date().getFullYear();
  const matchesThisYear = matchesForStats.filter(
    (match) => new Date(match.date).getFullYear() === currentYear
  ).length;

  const wins = matchesForStats.filter((match) => match.is_win).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Calculate sets won/lost - use matches for stats
  const setStats = matchesForStats.reduce(
    (acc, match) => {
      if (!match.score) return acc;
      const sets = match.score.split(" ");
      sets.forEach((set) => {
        if (!set) return;
        const cleanSet = set.replace(/\([^)]*\)/g, '');
        const [playerScore, opponentScore] = cleanSet.split("-").map(Number);

        if (!isNaN(playerScore) && !isNaN(opponentScore)) {
          if (playerScore > opponentScore) {
            acc.setsWon++;
          } else if (opponentScore > playerScore) {
            acc.setsLost++;
          }
        }
      });
      return acc;
    },
    { setsWon: 0, setsLost: 0 }
  );

  // Calculate tiebreaks won/lost - use matches for stats
  const tiebreaksWon = matchesForStats.reduce((acc, match) => {
    if (match.final_set_tiebreak) {
      return match.is_win ? acc + 1 : acc;
    }
    return acc;
  }, 0);

  return (
    <StatsOverview
      totalMatches={totalMatches}
      matchesThisYear={matchesThisYear}
      winRate={winRate}
      setsWon={setStats.setsWon}
      setsLost={setStats.setsLost}
      tiebreaksWon={tiebreaksWon}
    />
  );
};
