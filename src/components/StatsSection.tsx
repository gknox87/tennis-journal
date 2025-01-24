import { Match } from "@/types/match";
import { StatsOverview } from "./StatsOverview";

interface StatsSectionProps {
  matches: Match[];
}

export const StatsSection = ({ matches }: StatsSectionProps) => {
  const totalMatches = matches.length;
  const currentYear = new Date().getFullYear();
  const matchesThisYear = matches.filter(
    (match) => new Date(match.date).getFullYear() === currentYear
  ).length;

  const wins = matches.filter((match) => match.is_win).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Calculate sets won/lost from the score string
  const setStats = matches.reduce(
    (acc, match) => {
      // Split the score string into individual sets
      const sets = match.score.split(" ");
      
      sets.forEach((set) => {
        // Handle potential empty strings or invalid formats
        if (!set) return;
        
        // Split each set into player and opponent scores
        const scores = set.split("-");
        if (scores.length !== 2) return;
        
        const [playerScore, opponentScore] = scores.map(score => {
          // Remove any non-numeric characters (like parentheses for tiebreaks)
          const cleanScore = score.replace(/[^0-9]/g, '');
          return parseInt(cleanScore, 10);
        });

        // Only count valid scores
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

  // Calculate tiebreaks won
  const tiebreaksWon = matches.reduce((acc, match) => {
    if (match.is_win && match.final_set_tiebreak) {
      return acc + 1;
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