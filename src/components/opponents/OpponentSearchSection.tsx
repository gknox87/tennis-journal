
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddOpponentDialog } from "./AddOpponentDialog";

interface OpponentSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddOpponent: (name: string) => Promise<void>;
}

export const OpponentSearchSection = ({
  searchTerm,
  onSearchChange,
  onAddOpponent,
}: OpponentSearchSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search opponents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <AddOpponentDialog onAdd={onAddOpponent} />
    </div>
  );
};
