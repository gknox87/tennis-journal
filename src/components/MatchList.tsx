import { MatchCard } from "@/components/MatchCard";
import { useNavigate } from "react-router-dom";
import { Match } from "@/types/match";
interface MatchListProps {
  matches: Match[];
  onMatchDelete: () => void;
}
export const MatchList = ({
  matches,
  onMatchDelete
}: MatchListProps) => {
  const navigate = useNavigate();
  const handleEditMatch = (matchId: string) => {
    navigate(`/edit-match/${matchId}`);
  };
  return <div>
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Recent Performances</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {matches.map(match => (
          <MatchCard
            key={match.id}
            id={match.id}
            date={match.date}
            opponent_name={match.opponent_name || "Unknown Opponent"}
            score={match.score}
            isWin={match.is_win}
            finalSetTiebreak={match.final_set_tiebreak}
            sportId={match.sport_id}
            sportName={match.sport_name}
            onDelete={onMatchDelete}
            onEdit={() => handleEditMatch(match.id)}
          />
        ))}
        {matches.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">
            No matches found. Try adjusting your search or filters.
          </div>}
      </div>
    </div>;
};