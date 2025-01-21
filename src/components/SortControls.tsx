import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpDown, CalendarDays } from "lucide-react";

type SortOption = "newest" | "oldest" | "alphabetical";

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortControls = ({ currentSort, onSortChange }: SortControlsProps) => {
  return (
    <div className="flex flex-nowrap gap-2 mb-4 min-w-max">
      <Button
        variant={currentSort === "newest" ? "default" : "outline"}
        onClick={() => onSortChange("newest")}
        className="flex items-center gap-2 text-sm whitespace-nowrap"
        size="sm"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="hidden sm:inline">Newest First</span>
        <span className="sm:hidden">New</span>
      </Button>
      <Button
        variant={currentSort === "oldest" ? "default" : "outline"}
        onClick={() => onSortChange("oldest")}
        className="flex items-center gap-2 text-sm whitespace-nowrap"
        size="sm"
      >
        <CalendarDays className="h-4 w-4" />
        <span className="hidden sm:inline">Oldest First</span>
        <span className="sm:hidden">Old</span>
      </Button>
      <Button
        variant={currentSort === "alphabetical" ? "default" : "outline"}
        onClick={() => onSortChange("alphabetical")}
        className="flex items-center gap-2 text-sm whitespace-nowrap"
        size="sm"
      >
        <ArrowDownAZ className="h-4 w-4" />
        <span className="hidden sm:inline">Alphabetical</span>
        <span className="sm:hidden">A-Z</span>
      </Button>
    </div>
  );
};