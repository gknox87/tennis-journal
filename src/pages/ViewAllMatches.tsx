
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { MatchList } from "@/components/MatchList";
import { SortControls } from "@/components/SortControls";
import { addMonths, addYears, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type SortOption = "newest" | "oldest" | "alphabetical" | "lastMonth" | "lastYear";

const ViewAllMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          )
        `)
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      const processedMatches = matchesData?.map(match => ({
        ...match,
        opponent_name: match.opponents?.name || "Unknown Opponent"
      })) || [];

      setMatches(processedMatches);
      setFilteredMatches(processedMatches);
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
    const now = new Date();

    // Apply date filters based on sort option
    if (sortOption === "lastMonth") {
      const monthAgo = startOfDay(addMonths(now, -1));
      filtered = filtered.filter(match => new Date(match.date) >= monthAgo);
    } else if (sortOption === "lastYear") {
      const yearAgo = startOfDay(addYears(now, -1));
      filtered = filtered.filter(match => new Date(match.date) >= yearAgo);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        match =>
          match.opponent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          return (a.opponent_name || "").localeCompare(b.opponent_name || "");
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, sortOption]);

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

        <MatchList matches={filteredMatches} onMatchDelete={fetchMatches} />
      </div>
    </div>
  );
};

export default ViewAllMatches;
