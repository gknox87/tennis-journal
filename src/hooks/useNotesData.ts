
import { useState, useCallback, useRef, useEffect } from "react";
import { PlayerNote } from "@/types/notes";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useNotesData = () => {
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);
  const { fetchPlayerNotes } = useDataFetching();
  const { toast } = useToast();
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for ongoing fetches
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshNotes = useCallback(async () => {
    if (isFetchingRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    
    try {
      isFetchingRef.current = true;
      abortControllerRef.current = new AbortController();
      
      console.log('Refreshing notes data...');
      const notesData = await fetchPlayerNotes();
      console.log('Fetched notes:', notesData);
      setPlayerNotes(notesData);
    } finally {
      isFetchingRef.current = false;
      abortControllerRef.current = null;
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
        throw error;
      }

      // Optimistic update
      setPlayerNotes(currentNotes => 
        currentNotes.filter(note => note.id !== noteId)
      );

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    playerNotes,
    setPlayerNotes,
    refreshNotes,
    handleDeleteNote
  };
};
