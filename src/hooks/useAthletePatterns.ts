
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Match } from "@/types/match";
import { WellnessEntry } from "@/types/wellness";
import { TrainingSession } from "@/types/trainingLoad";
import {
  AthletePattern,
  PatternEvidence,
  PATTERN_EXPIRY_DAYS,
  PATTERN_REFRESH_COOLDOWN_MS,
  MIN_MATCHES_FOR_PATTERNS,
} from "@/types/athletePattern";
import { detectPatterns, getPatternUnlockProgress } from "@/utils/patternDetection";
import { addDays, format, subDays } from "date-fns";
import { analytics } from "@/lib/analytics";

interface UseAthletePatternsOptions {
  /** Auto-refresh stale patterns on mount (Improvement Notes page) */
  autoRefresh?: boolean;
  matchCount?: number;
}

export function useAthletePatterns(options: UseAthletePatternsOptions = {}) {
  const { autoRefresh = false, matchCount = 0 } = options;
  const { sport } = useSport();
  const { canAccessPatternInsights } = useSubscription();

  const [patterns, setPatterns] = useState<AthletePattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);

  const unlockProgress = useMemo(
    () => getPatternUnlockProgress(matchCount),
    [matchCount]
  );

  const fetchPatterns = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setPatterns([]);
        return;
      }

      const { data, error } = await supabase
        .from("athlete_patterns")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const active = (data ?? []).filter(
        (p) => !p.expires_at || new Date(p.expires_at) > now
      ) as AthletePattern[];

      setPatterns(active);

      if (data && data.length > 0) {
        const latest = data.reduce((a, b) =>
          a.generated_at > b.generated_at ? a : b
        );
        setLastRefreshAt(latest.generated_at);
      }
    } catch (error) {
      console.error("Error fetching athlete patterns:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDetectionData = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return null;

    const sinceLoad = format(subDays(new Date(), 56), "yyyy-MM-dd");
    const sinceWellness = format(subDays(new Date(), 30), "yyyy-MM-dd");

    const [matchesResult, wellnessResult, sessionsResult] = await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .eq("user_id", user.id)
        .eq("sport_id", sport.id)
        .order("date", { ascending: false }),
      supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("sport_id", sport.id)
        .gte("entry_date", sinceWellness)
        .order("entry_date", { ascending: true }),
      supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("sport_id", sport.id)
        .gte("session_date", sinceLoad)
        .order("session_date", { ascending: true }),
    ]);

    if (matchesResult.error) throw matchesResult.error;

    return {
      userId: user.id,
      matches: (matchesResult.data ?? []) as Match[],
      wellnessEntries: (wellnessResult.data ?? []) as WellnessEntry[],
      trainingSessions: (sessionsResult.data ?? []) as TrainingSession[],
    };
  }, [sport.id]);

  const canRefreshNow = useCallback(() => {
    if (!lastRefreshAt) return true;
    const elapsed = Date.now() - new Date(lastRefreshAt).getTime();
    return elapsed >= PATTERN_REFRESH_COOLDOWN_MS;
  }, [lastRefreshAt]);

  const refreshPatterns = useCallback(
    async (force = false) => {
      if (!canAccessPatternInsights()) return;
      if (!unlockProgress.unlocked) return;
      if (!force && !canRefreshNow()) return;

      setIsRefreshing(true);
      analytics.patternRefreshRequested();

      try {
        const data = await fetchDetectionData();
        if (!data || data.matches.length < MIN_MATCHES_FOR_PATTERNS) return;

        const raw = detectPatterns({
          matches: data.matches,
          wellnessEntries: data.wellnessEntries,
          trainingSessions: data.trainingSessions,
        });

        if (raw.length === 0) return;

        const { data: aiResponse, error: aiError } =
          await supabase.functions.invoke("detect-athlete-patterns", {
            body: {
              user_id: data.userId,
              sport_id: sport.id,
              patterns: raw,
            },
          });

        if (aiError) throw aiError;

        const narrated = aiResponse?.patterns ?? [];
        const expiresAt = addDays(new Date(), PATTERN_EXPIRY_DAYS).toISOString();

        for (const item of narrated) {
          const { error: upsertError } = await supabase
            .from("athlete_patterns")
            .upsert(
              {
                user_id: data.userId,
                sport_id: sport.id,
                pattern_key: item.pattern_key,
                category: item.category,
                headline: item.headline,
                message: item.message,
                action: item.action ?? null,
                evidence: item.evidence as PatternEvidence,
                severity: item.severity ?? "info",
                is_dismissed: false,
                generated_at: new Date().toISOString(),
                expires_at: expiresAt,
              },
              { onConflict: "user_id,pattern_key" }
            );

          if (upsertError) {
            console.error("Error upserting pattern", item.pattern_key, upsertError);
          }
        }

        await fetchPatterns();
      } catch (error) {
        console.error("Error refreshing patterns:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [
      canAccessPatternInsights,
      unlockProgress.unlocked,
      canRefreshNow,
      fetchDetectionData,
      sport.id,
      fetchPatterns,
    ]
  );

  const dismissPattern = useCallback(
    async (id: string, patternKey: string) => {
      try {
        const { error } = await supabase
          .from("athlete_patterns")
          .update({ is_dismissed: true })
          .eq("id", id);

        if (error) throw error;

        analytics.patternDismissed(patternKey);
        setPatterns((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error dismissing pattern:", error);
      }
    },
    []
  );

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  useEffect(() => {
    if (!autoRefresh || !canAccessPatternInsights() || isLoading) return;
    if (!unlockProgress.unlocked) return;

    const isStale =
      patterns.length === 0 ||
      patterns.every(
        (p) => p.expires_at && new Date(p.expires_at) <= new Date()
      );

    if (isStale && canRefreshNow()) {
      refreshPatterns();
    }
  }, [
    autoRefresh,
    canAccessPatternInsights,
    isLoading,
    unlockProgress.unlocked,
    patterns,
    canRefreshNow,
    refreshPatterns,
  ]);

  return {
    patterns,
    isLoading,
    isRefreshing,
    unlockProgress,
    canAccessPatternInsights: canAccessPatternInsights(),
    canRefreshNow: canRefreshNow(),
    refreshPatterns,
    dismissPattern,
    refetch: fetchPatterns,
  };
}
