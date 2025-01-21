import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpDown, CalendarDays } from "lucide-react";

type SortOption = "newest" | "oldest" | "alphabetical";

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortControls = ({ currentSort, onSortChange }: SortControlsProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={currentSort === "newest" ? "default" : "outline"}
        onClick={() => onSortChange("newest")}
        className="flex items-center gap-2"
      >
        <ArrowUpDown className="h-4 w-4" />
        Newest First
      </Button>
      <Button
        variant={currentSort === "oldest" ? "default" : "outline"}
        onClick={() => onSortChange("oldest")}
        className="flex items-center gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        Oldest First
      </Button>
      <Button
        variant={currentSort === "alphabetical" ? "default" : "outline"}
        onClick={() => onSortChange("alphabetical")}
        className="flex items-center gap-2"
      >
        <ArrowDownAZ className="h-4 w-4" />
        Alphabetical
      </Button>
    </div>
  );
};