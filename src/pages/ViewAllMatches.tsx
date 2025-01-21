import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { MatchList } from "@/components/MatchList";
import { SortControls } from "@/components/SortControls";
import { DateRangeFilter, getDateRangeStart } from "@/components/DateRangeFilter";
import { useToast } from "@/hooks/use-toast";

type SortOption = "newest" | "oldest" | "alphabetical";
type DateRange = "week" | "month" | "year" | "all";

const ViewAllMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*, tags!match_tags(id, name)")
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      setMatches(matchesData || []);
      setFilteredMatches(matchesData || []);
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
    const rangeStart = getDateRangeStart(dateRange);

    // Apply date range filter
    if (rangeStart) {
      filtered = filtered.filter(match => new Date(match.date) >= rangeStart);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        match =>
          match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "alphabetical":
          return a.opponent.localeCompare(b.opponent);
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, sortOption, dateRange]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">All Matches</h1>
      </div>

      <div className="space-y-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <SortControls currentSort={sortOption} onSortChange={setSortOption} />
        </div>
        
        <DateRangeFilter currentRange={dateRange} onRangeChange={setDateRange} />

        <MatchList matches={filteredMatches} onMatchDelete={fetchMatches} />
      </div>
    </div>
  );
};

export default ViewAllMatches;