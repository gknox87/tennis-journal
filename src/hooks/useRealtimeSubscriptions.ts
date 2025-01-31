import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { Tag } from "@/types/match";

type RealtimeCallbacks = {
  onMatchesUpdate: () => void;
  onNotesUpdate: () => void;
  onTagsUpdate: () => void;
};

export const useRealtimeSubscriptions = (callbacks: RealtimeCallbacks) => {
  useEffect(() => {
    console.log('Setting up realtime subscriptions...');

    // Matches channel
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
          callbacks.onMatchesUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Matches subscription status:', status);
      });

    // Notes channel
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
          callbacks.onNotesUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Notes subscription status:', status);
      });

    // Tags channel
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
          callbacks.onTagsUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Tags subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscriptions...');
      matchesChannel.unsubscribe();
      notesChannel.unsubscribe();
      tagsChannel.unsubscribe();
    };
  }, [callbacks]);
};