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
      const sets = match.score.split(" ");
      let setsWon = 0;
      let setsLost = 0;

      sets.forEach((set) => {
        const [playerScore, opponentScore] = set.split("-").map(Number);
        if (playerScore > opponentScore) setsWon++;
        if (opponentScore > playerScore) setsLost++;
      });

      return {
        setsWon: acc.setsWon + setsWon,
        setsLost: acc.setsLost + setsLost,
      };
    },
    { setsWon: 0, setsLost: 0 }
  );

  // Calculate tiebreaks won only for matches that were won and had a final set tiebreak
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