
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

  // Calculate sets won/lost
  const setStats = matches.reduce(
    (acc, match) => {
      const sets = match.score.split(" ");
      
      sets.forEach((set) => {
        if (!set) return;
        
        // Remove any parentheses content (tiebreak scores)
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

  // Calculate tiebreaks won/lost
  const tiebreaksWon = matches.reduce((acc, match) => {
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
