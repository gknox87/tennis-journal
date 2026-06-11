import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateStreak, calculateWeeklyConsistency, StreakData, normalizeDate } from '@/utils/streakCalculations';

export interface JournalingStreakData extends StreakData {
  weeklyConsistency: number;
  isLoading: boolean;
  error: string | null;
}

export interface UseJournalingStreakReturn {
  streakData: JournalingStreakData;
  refreshStreak: () => Promise<void>;
  journaledDates: Set<string>;
}

/**
 * Hook to fetch and manage journaling streak data
 * Fetches journaling dates from matches, training notes, and player notes
 */
export function useJournalingStreak(): UseJournalingStreakReturn {
  const [streakData, setStreakData] = useState<JournalingStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalJournalDays: 0,
    lastJournaledAt: null,
    journaledDates: new Set(),
    weeklyConsistency: 0,
    isLoading: true,
    error: null,
  });

  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshStreakRef = useRef<() => Promise<void>>(async () => undefined);
  const channelNameRef = useRef(`streak_changes_${crypto.randomUUID()}`);

  const fetchJournalingDates = useCallback(async (): Promise<Date[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return [];
    }

    const userId = session.user.id;
    const dates: Date[] = [];

    try {
      // Fetch dates from matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('date')
        .eq('user_id', userId);

      if (matchesError) throw matchesError;
      if (matches) {
        matches.forEach(match => {
          if (match.date) {
            dates.push(new Date(match.date));
          }
        });
      }

      // Fetch dates from training notes
      const { data: trainingNotes, error: trainingError } = await supabase
        .from('training_notes')
        .select('training_date')
        .eq('user_id', userId);

      if (trainingError) throw trainingError;
      if (trainingNotes) {
        trainingNotes.forEach(note => {
          if (note.training_date) {
            dates.push(new Date(note.training_date));
          }
        });
      }

      // Fetch dates from player notes (using created_at)
      const { data: playerNotes, error: notesError } = await supabase
        .from('player_notes')
        .select('created_at')
        .eq('user_id', userId);

      if (notesError) throw notesError;
      if (playerNotes) {
        playerNotes.forEach(note => {
          if (note.created_at) {
            dates.push(new Date(note.created_at));
          }
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching journaling dates:', error);
      throw error;
    }

    return dates;
  }, []);

  const refreshStreak = useCallback(async () => {
    if (isFetchingRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    try {
      isFetchingRef.current = true;
      abortControllerRef.current = new AbortController();

      if (!hasLoadedRef.current) {
        setStreakData(prev => ({ ...prev, isLoading: true, error: null }));
      }

      const dates = await fetchJournalingDates();
      
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const calculated = calculateStreak(dates);
      const weeklyConsistency = calculateWeeklyConsistency(calculated.journaledDates);

      // Longest streak is calculated from journaling dates only

      hasLoadedRef.current = true;
      setStreakData({
        ...calculated,
        weeklyConsistency,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      console.error('Error refreshing streak:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        const message = error instanceof Error ? error.message : 'Failed to load streak data';
        setStreakData(prev => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    } finally {
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [fetchJournalingDates]);

  refreshStreakRef.current = refreshStreak;

  // Initial fetch
  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  // Set up realtime subscriptions to update streak when data changes
  useEffect(() => {
    const refreshSoon = () => {
      window.setTimeout(() => {
        void refreshStreakRef.current();
      }, 500);
    };

    const channel = supabase
      .channel(channelNameRef.current)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        refreshSoon
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'training_notes' },
        refreshSoon
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_notes' },
        refreshSoon
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    streakData,
    refreshStreak,
    journaledDates: streakData.journaledDates,
  };
}

