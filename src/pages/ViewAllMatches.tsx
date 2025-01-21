import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { MatchList } from "@/components/MatchList";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays, subMonths, subYears, isWithinInterval } from "date-fns";

interface Match {
  id: string;
  date: string;
  opponent: string;
  score: string;
  is_win: boolean;
  final_set_tiebreak?: boolean;
  notes?: string;
  tags?: { id: string; name: string; }[];
}

const ViewAllMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      const { data: tagsData, error: tagsError } = await supabase
        .from("match_tags")
        .select(`
          match_id,
          tags:tag_id(id, name)
        `)
        .in(
          "match_id",
          matchesData?.map((match) => match.id) || []
        );

      if (tagsError) throw tagsError;

      const matchesWithTags = matchesData?.map((match) => ({
        ...match,
        tags: tagsData
          ?.filter((tag) => tag.match_id === match.id)
          .map((tag) => tag.tags),
      }));

      setMatches(matchesWithTags || []);
      setFilteredMatches(matchesWithTags || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    let filtered = [...matches];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter !== "all" || (customDateRange.from && customDateRange.to)) {
      const now = new Date();
      let fromDate;

      if (customDateRange.from && customDateRange.to) {
        fromDate = customDateRange.from;
        filtered = filtered.filter((match) => {
          const matchDate = new Date(match.date);
          return isWithinInterval(matchDate, {
            start: fromDate!,
            end: customDateRange.to!,
          });
        });
      } else {
        switch (dateFilter) {
          case "week":
            fromDate = subDays(now, 7);
            break;
          case "month":
            fromDate = subMonths(now, 1);
            break;
          case "year":
            fromDate = subYears(now, 1);
            break;
          default:
            fromDate = null;
        }

        if (fromDate) {
          filtered = filtered.filter(
            (match) => new Date(match.date) >= fromDate!
          );
        }
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "alphabetical":
          return a.opponent.localeCompare(b.opponent);
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "newest":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, sortOrder, dateFilter, customDateRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">All Matches</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  {customDateRange.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd, y")} -{" "}
                        {format(customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={{
                    from: customDateRange.from,
                    to: customDateRange.to,
                  }}
                  onSelect={(range) => {
                    setCustomDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <MatchList
        matches={filteredMatches}
        onMatchDelete={fetchMatches}
      />
    </div>
  );
};

export default ViewAllMatches;