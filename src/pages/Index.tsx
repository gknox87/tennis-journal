import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Index = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);

  const fetchPlayerNotes = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched notes:', data);
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
      
      // No need to call fetchPlayerNotes here as the real-time subscription will handle it
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchTags();
    fetchPlayerNotes();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel('matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          console.log('Matches change detected:', payload);
          fetchMatches();
        }
      )
      .subscribe();

    // Subscribe to player notes changes
    const notesChannel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_notes',
        },
        (payload) => {
          console.log('Notes change detected:', payload);
          fetchPlayerNotes();
        }
      )
      .subscribe();

    // Subscribe to tags changes
    const tagsChannel = supabase
      .channel('tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags',
        },
        (payload) => {
          console.log('Tags change detected:', payload);
          fetchTags();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      matchesChannel.unsubscribe();
      notesChannel.unsubscribe();
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

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
      <Header />
      <DashboardContent
        matches={matches}
        filteredMatches={filteredMatches}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        playerNotes={playerNotes}
        onMatchDelete={fetchMatches}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};

export default Index;