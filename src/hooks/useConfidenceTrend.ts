import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/match';
import { WellnessEntry } from '@/types/wellness';
import {
  buildConfidenceTimeline,
  ConfidenceDataPoint,
} from '@/utils/confidenceTrendCalc';

export function useConfidenceTrend() {
  const [data, setData] = useState<ConfidenceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setData([]);
        return;
      }

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const since = ninetyDaysAgo.toISOString().split('T')[0];

      const [wellnessResult, matchesResult] = await Promise.all([
        supabase
          .from('wellness_entries')
          .select('entry_date, performance_confidence')
          .eq('user_id', session.user.id)
          .gte('entry_date', since)
          .order('entry_date', { ascending: true }),
        supabase
          .from('matches')
          .select('date, pre_confidence, is_win, opponent_name')
          .eq('user_id', session.user.id)
          .gte('date', since)
          .not('pre_confidence', 'is', null)
          .order('date', { ascending: true }),
      ]);

      const entries = (wellnessResult.data ?? []) as WellnessEntry[];
      const matches = (matchesResult.data ?? []) as Match[];

      setData(buildConfidenceTimeline(entries, matches));
    } catch (err) {
      console.error('Error loading confidence trend:', err);
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
