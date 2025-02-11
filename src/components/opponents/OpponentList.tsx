
import { OpponentCard } from "./OpponentCard";
import type { Opponent } from "@/types/opponents";

interface OpponentListProps {
  opponents: Opponent[];
  onDelete: (id: string) => void;
}

export const OpponentList = ({ opponents, onDelete }: OpponentListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {opponents.map((opponent) => (
        <OpponentCard
          key={opponent.id}
          opponent={opponent}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
