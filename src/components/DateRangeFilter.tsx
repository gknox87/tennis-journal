import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { addDays, addMonths, addYears, startOfDay } from "date-fns";

type DateRange = "week" | "month" | "year" | "all";

interface DateRangeFilterProps {
  currentRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ currentRange, onRangeChange }: DateRangeFilterProps) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={currentRange === "week" ? "default" : "outline"}
        onClick={() => onRangeChange("week")}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Last Week
      </Button>
      <Button
        variant={currentRange === "month" ? "default" : "outline"}
        onClick={() => onRangeChange("month")}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Last Month
      </Button>
      <Button
        variant={currentRange === "year" ? "default" : "outline"}
        onClick={() => onRangeChange("year")}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Last Year
      </Button>
      <Button
        variant={currentRange === "all" ? "default" : "outline"}
        onClick={() => onRangeChange("all")}
      >
        All Time
      </Button>
    </div>
  );
};

export const getDateRangeStart = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case "week":
      return startOfDay(addDays(now, -7));
    case "month":
      return startOfDay(addMonths(now, -1));
    case "year":
      return startOfDay(addYears(now, -1));
    case "all":
      return null;
  }
};