import { MatchCard } from "@/components/MatchCard";
import { useNavigate } from "react-router-dom";
import { Match } from "@/types/match";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
interface MatchListProps {
  matches: Match[];
  onMatchDelete: () => void;
  showAddButton?: boolean;
}
export const MatchList = ({
  matches,
  onMatchDelete,
  showAddButton = true
}: MatchListProps) => {
  const navigate = useNavigate();
  const handleEditMatch = (matchId: string) => {
    navigate(`/edit-match/${matchId}`);
  };
  const handleAddPerformance = () => {
    navigate("/add-match");
  };

  return <div>
      <div className={`mb-4 flex flex-col sm:flex-row items-start sm:items-center ${showAddButton ? 'justify-between' : ''} gap-3`}>
        <h2 className="text-lg font-semibold">Recent Performances</h2>
        {showAddButton && (
          <Button
            onClick={handleAddPerformance}
            className="btn-primary text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Add Performance
          </Button>
        )}
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