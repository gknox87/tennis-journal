import { StatsOverview } from "@/components/StatsOverview";

interface Match {
  is_win: boolean;
  score: string;
}

interface StatsSectionProps {
  matches: Match[];
  onRefresh: () => void;
}

export const StatsSection = ({ matches, onRefresh }: StatsSectionProps) => {
  const calculateStats = (matches: Match[]) => {
    const currentYear = new Date().getFullYear();
    const matchesThisYear = matches.filter(
      (match) => new Date(match.date).getFullYear() === currentYear
    );
    const wins = matches.filter((match) => match.is_win).length;

    let setsWon = 0;
    let setsLost = 0;
    let tiebreaksWon = 0;

    matches.forEach((match) => {
      const sets = match.score.split(", ");
      sets.forEach((set) => {
        const [playerScore, opponentScore] = set.split("-").map(Number);
        if (playerScore > opponentScore) setsWon++;
        if (opponentScore > playerScore) setsLost++;
        if (playerScore === 7 || opponentScore === 7) tiebreaksWon++;
      });
    });

    return {
      totalMatches: matches.length,
      matchesThisYear: matchesThisYear.length,
      winRate: matches.length ? Math.round((wins / matches.length) * 100) : 0,
      setsWon,
      setsLost,
      tiebreaksWon,
    };
  };

  const stats = calculateStats(matches);

  return (
    <div className="mb-6 sm:mb-8">
      <StatsOverview {...stats} onRefresh={onRefresh} />
    </div>
  );
};