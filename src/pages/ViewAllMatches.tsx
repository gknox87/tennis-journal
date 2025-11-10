
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
import { useSport } from "@/context/SportContext";
import { Header } from "@/components/Header";

type SortOption = "newest" | "alphabetical" | "lastMonth" | "lastYear";

const ViewAllMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const { sport } = useSport();

  const fetchMatches = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session?.user) {
        setMatches([]);
        return;
      }

      console.log('ViewAllMatches - Fetching matches for user:', session.user.id);
      console.log('ViewAllMatches - Current sport.id:', sport.id);

      // Fetch ALL matches for the user (not filtered by sport) to show all performances
      // This ensures users can see all their matches regardless of sport_id
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          ),
          sports (
            name,
            slug
          )
        `)
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (matchesError) {
        console.error("Error fetching matches:", matchesError);
        throw matchesError;
      }

      console.log('ViewAllMatches - Fetched matches:', matchesData?.length || 0);
      if (matchesData && matchesData.length > 0) {
        console.log('ViewAllMatches - Match sport_ids:', matchesData.map(m => ({ 
          id: m.id, 
          sport_id: m.sport_id, 
          date: m.date,
          opponent: m.opponents?.name 
        })));
      }

      const processedMatches = matchesData?.map(match => ({
        ...match,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        sport_name: match.sports?.name,
        sport_slug: match.sports?.slug
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
  }, []); // Fetch once on mount, not when sport changes since we're showing all matches

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
          match.score?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "alphabetical":
          return (a.opponent_name || "").localeCompare(b.opponent_name || "");
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-28 max-w-7xl">
      <div className="space-y-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <SortControls currentSort={sortOption} onSortChange={setSortOption} />
        </div>

        <MatchList matches={filteredMatches} onMatchDelete={fetchMatches} />
      </div>
      </div>
    </div>
  );
};

export default ViewAllMatches;
