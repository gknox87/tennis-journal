
import { useState, useCallback, useRef } from "react";
import { PlayerNote } from "@/types/notes";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useNotesData = () => {
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);
  const { fetchPlayerNotes } = useDataFetching();
  const { toast } = useToast();
  const isFetchingRef = useRef(false);

  const refreshNotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      console.log('Refreshing notes data...');
      const notesData = await fetchPlayerNotes();
      console.log('Fetched notes:', notesData);
      setPlayerNotes(notesData);
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchPlayerNotes]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      console.log('Deleting note:', noteId);
      const { error } = await supabase
        .from("player_notes")
        .delete()
        .eq("id", noteId);

      if (error) {
        console.error("Supabase error deleting note:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      
      await refreshNotes(); // Refresh notes after successful deletion
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  }, [toast, refreshNotes]);

  return {
    playerNotes,
    setPlayerNotes,
    refreshNotes,
    handleDeleteNote
  };
};
