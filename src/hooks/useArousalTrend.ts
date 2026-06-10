import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/match';
import { TrainingNote } from '@/types/training';
import { buildArousalDataPoints, ArousalDataPoint } from '@/utils/arousalTrendCalc';

export function useArousalTrend() {
  const [data, setData] = useState<ArousalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setData([]);
        return;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);
      const since = thirtyDaysAgo.toISOString().split('T')[0];

      const [matchesResult, notesResult] = await Promise.all([
        supabase
          .from('matches')
          .select('date, pre_arousal, pre_nerves, pre_emotion_tags, post_emotion_tags, is_win')
          .eq('user_id', session.user.id)
          .gte('date', since)
          .order('date', { ascending: true }),
        supabase
          .from('training_notes')
          .select('training_date, session_arousal, session_feel, emotion_tags')
          .eq('user_id', session.user.id)
          .gte('training_date', since)
          .order('training_date', { ascending: true }),
      ]);

      const matches = (matchesResult.data ?? []) as Match[];
      const notes = (notesResult.data ?? []) as TrainingNote[];

      setData(buildArousalDataPoints(matches, notes));
    } catch (err) {
      console.error('Error loading arousal trend:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
