import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MatchList } from "@/components/MatchList";
import { Header } from "@/components/Header";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { Card } from "@/components/ui/card";
import { Match } from "@/types/match";
import { CheckCircle2, Circle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotesDialog } from "@/components/NotesDialog";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
  source_match_id: string | null;
}

interface PlayerNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const [improvementPoints, setImprovementPoints] = useState<ImprovementPoint[]>([]);
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  const fetchImprovementPoints = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { data, error } = await supabase
        .from('improvement_points')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImprovementPoints(data || []);
    } catch (error) {
      console.error('Error fetching improvement points:', error);
      toast({
        title: "Error",
        description: "Failed to fetch improvement points",
        variant: "destructive",
      });
    }
  };

  const toggleImprovementPoint = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('improvement_points')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchImprovementPoints();
      
      toast({
        title: !currentStatus ? "Point completed!" : "Point uncompleted",
        description: "Your progress has been updated",
      });
    } catch (error) {
      console.error('Error updating improvement point:', error);
      toast({
        title: "Error",
        description: "Failed to update improvement point",
        variant: "destructive",
      });
    }
  };

  const fetchTags = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log("No session found, skipping tag fetch");
        return;
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      if (data) {
        setAvailableTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchMatches = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log("No session found, skipping match fetch");
        return;
      }

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          opponents (
            name
          ),
          tags!match_tags (
            id,
            name
          )
        `)
        .order("date", { ascending: false });

      if (matchesError) throw matchesError;

      const processedMatches: Match[] = matchesData?.map(match => ({
        ...match,
        opponent_name: match.opponents?.name || "Unknown Opponent",
        tags: match.tags
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

  const fetchPlayerNotes = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPlayerNotes(data || []);
    } catch (error) {
      console.error('Error fetching player notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch player notes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchTags();
    fetchImprovementPoints();
    fetchPlayerNotes();

    const subscription = supabase
      .channel("matches_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    const improvementSubscription = supabase
      .channel("improvement_points_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "improvement_points",
        },
        () => {
          fetchImprovementPoints();
        }
      )
      .subscribe();

    const notesSubscription = supabase
      .channel("player_notes_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_notes",
        },
        () => {
          fetchPlayerNotes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      improvementSubscription.unsubscribe();
      notesSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.opponent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((match) =>
        selectedTags.every((tagId) =>
          match.tags?.some((tag) => tag.id === tagId)
        )
      );
    }

    setFilteredMatches(filtered);
  }, [searchTerm, selectedTags, matches]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <Header />
      <div className="mt-4 sm:mt-8">
        <StatsSection matches={matches} />
      </div>
      
      <div className="flex justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => setShowNotesDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Notes
        </Button>
      </div>
      
      {improvementPoints.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI-Generated Improvement Points</h2>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate('/improvement-notes')}
            >
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {improvementPoints.slice(0, 3).map((point) => (
              <div key={point.id} className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5"
                  onClick={() => toggleImprovementPoint(point.id, point.is_completed)}
                >
                  {point.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <p className={`flex-1 ${point.is_completed ? 'line-through text-gray-500' : ''}`}>
                  {point.point}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {playerNotes.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Player Notes</h2>
          </div>
          <div className="space-y-4">
            {playerNotes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{note.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6 sm:mt-8">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
        />
      </div>
      <div className="mt-4 sm:mt-6">
        <MatchList
          matches={filteredMatches}
          onMatchDelete={fetchMatches}
        />
      </div>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
      />
    </div>
  );
};

export default Index;
