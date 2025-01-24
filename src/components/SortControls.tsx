import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpDown, CalendarDays, Calendar } from "lucide-react";

type SortOption = "newest" | "oldest" | "alphabetical" | "lastMonth" | "lastYear";

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortControls = ({ currentSort, onSortChange }: SortControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
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
      <Button
        variant={currentSort === "lastMonth" ? "default" : "outline"}
        onClick={() => onSortChange("lastMonth")}
        className="flex items-center gap-2 text-sm whitespace-nowrap"
        size="sm"
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Last Month</span>
        <span className="sm:hidden">Month</span>
      </Button>
      <Button
        variant={currentSort === "lastYear" ? "default" : "outline"}
        onClick={() => onSortChange("lastYear")}
        className="flex items-center gap-2 text-sm whitespace-nowrap"
        size="sm"
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Last Year</span>
        <span className="sm:hidden">Year</span>
      </Button>
    </div>
  );
};