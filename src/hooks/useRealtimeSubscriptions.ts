import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

type RealtimeCallbacks = {
  onMatchesUpdate: () => void;
  onNotesUpdate: () => void;
};

export const useRealtimeSubscriptions = (callbacks: RealtimeCallbacks) => {
  // Keep a ref to the latest callbacks so the effect doesn't re-subscribe
  // every time the parent creates a new object reference.
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
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
          callbacksRef.current.onMatchesUpdate();
        }
      )
      .subscribe();

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
          callbacksRef.current.onNotesUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(notesChannel);
    };
    // Empty deps: subscribe once on mount, cleanup on unmount.
  }, []);
};
