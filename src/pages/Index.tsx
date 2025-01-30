import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MatchList } from "@/components/MatchList";
import { Header } from "@/components/Header";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Match } from "@/types/match";
import { CheckCircle2, Circle, ArrowRight, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotesDialog } from "@/components/NotesDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null);

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
        .eq('user_id', session.session.user.id)
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

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel("matches_changes")
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

    // Subscribe to player notes changes with specific user filter
    const notesChannel = supabase
      .channel("notes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_notes",
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('Notes change detected:', payload);
          fetchPlayerNotes();
        }
      )
      .subscribe();

    // Subscribe to improvement points changes
    const pointsChannel = supabase
      .channel("points_changes")
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

    // Subscribe to tags changes
    const tagsChannel = supabase
      .channel("tags_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tags",
        },
        () => {
          fetchTags();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      matchesChannel.unsubscribe();
      notesChannel.unsubscribe();
      pointsChannel.unsubscribe();
      tagsChannel.unsubscribe();
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

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("player_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      fetchPlayerNotes(); // Refresh notes after deletion
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
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
          onClick={() => {
            setEditingNote(null);
            setShowNotesDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Notes
        </Button>
      </div>

      {playerNotes.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">My Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playerNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className="match-card cursor-pointer hover:bg-accent"
                  onClick={() => handleEditNote(note)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg font-medium line-clamp-1">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this note? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {stripHtmlTags(note.content)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
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
        editingNote={editingNote}
      />
    </div>
  );
};

export default Index;