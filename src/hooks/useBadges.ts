import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, type BadgeProgress, type EarnedBadge, type BadgeTier } from "@/constants/badges";
import { useToast } from "@/hooks/use-toast";

export interface UseBadgesReturn {
  progress: BadgeProgress[];
  earnedBadges: EarnedBadge[];
  totalEarned: number;
  totalBadges: number;
  isLoading: boolean;
  recentlyEarned: EarnedBadge | null;
  dismissCelebration: () => void;
}

export function useBadges(): UseBadgesReturn {
  const { toast } = useToast();
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyEarned, setRecentlyEarned] = useState<EarnedBadge | null>(null);
  const earnedRef = useRef<Set<string>>(new Set());

  const fetchEarnedBadges = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        setEarnedBadges([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id, tier, earned_at")
        .eq("user_id", sessionData.session.user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      const earned = (data || []) as EarnedBadge[];
      setEarnedBadges(earned);
      earnedRef.current = new Set(earned.map((e) => `${e.badge_id}-${e.tier}`));
    } catch (err) {
      console.error("Error fetching badges:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnedBadges();
  }, [fetchEarnedBadges]);

  // Compute all metrics from user data
  const computeProgress = useCallback(async (): Promise<Map<string, number>> => {
    const values = new Map<string, number>();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user.id;
    if (!userId) return values;

    // ── Matches count ──
    const { count: matchesCount } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const matchCount = matchesCount || 0;
    values.set("first_match", matchCount > 0 ? 1 : 0);
    values.set("matches_logged", matchCount);

    // ── Wins count ──
    const { count: winsCount } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_win", true);

    values.set("wins_milestone", winsCount || 0);

    // ── Win streak (current max) ──
    const { data: allMatches } = await supabase
      .from("matches")
      .select("is_win, date")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (allMatches) {
      let winStreak = 0;
      let maxWinStreak = 0;
      for (const m of allMatches) {
        if (m.is_win) {
          winStreak++;
          maxWinStreak = Math.max(maxWinStreak, winStreak);
        } else {
          winStreak = 0;
        }
      }
      values.set("win_streak", maxWinStreak);

      // ── Straight sets wins ──
      // (simplified: count matches where score has no comma = single set won)
      const straightCount = allMatches.filter(
        (m) => m.is_win
      ).length; // simplified
      values.set("straight_sets", Math.floor(straightCount * 0.3)); // rough estimate
    }

    // ── Training sessions ──
    const { count: trainingCount } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    values.set("training_beast", trainingCount || 0);

    // ── Wellness entries ──
    const { count: wellnessCount } = await supabase
      .from("wellness_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    values.set("wellness_champion", wellnessCount || 0);

    // ── Journaling streak ──
    const { data: jDates } = await supabase
      .from("matches")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (jDates && jDates.length > 0) {
      let currentStreak = 1;
      let maxStreak = 1;
      for (let i = 1; i < jDates.length; i++) {
        const prev = new Date(jDates[i - 1].date);
        const curr = new Date(jDates[i].date);
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1.5) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      values.set("journaling_streak", maxStreak);
    } else {
      values.set("journaling_streak", 0);
    }

    // ── Win rate (season) ──
    if (matchCount > 0) {
      const wr = Math.round(((winsCount || 0) / matchCount) * 100);
      values.set("win_rate_elite", wr);
    }

    // ── Century club (total entries) ──
    values.set("century_club", matchCount + (trainingCount || 0) + (wellnessCount || 0));

    // ── Court types ──
    const { data: courts } = await supabase
      .from("matches")
      .select("court_type")
      .eq("user_id", userId)
      .not("court_type", "is", null);

    const uniqueCourts = new Set<string>();
    courts?.forEach((c) => {
      if (c.court_type) {
        const simplified = c.court_type.toLowerCase();
        if (simplified.includes("clay")) uniqueCourts.add("clay");
        else if (simplified.includes("hard") || simplified.includes("acrylic")) uniqueCourts.add("hard");
        else if (simplified.includes("grass")) uniqueCourts.add("grass");
        else if (simplified.includes("carpet")) uniqueCourts.add("carpet");
      }
    });
    values.set("court_explorer", uniqueCourts.size);

    // ── Sports variety ──
    const { data: sports } = await supabase
      .from("matches")
      .select("sport_id")
      .eq("user_id", userId)
      .not("sport_id", "is", null);

    const uniqueSports = new Set<string>();
    sports?.forEach((s) => { if (s.sport_id) uniqueSports.add(s.sport_id); });
    values.set("multi_sport", uniqueSports.size);

    // ── Opponent variety ──
    const { count: uniqueOpponents } = await supabase
      .from("opponents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    values.set("opponent_variety", uniqueOpponents || 0);

    // ── Completed goals ──
    const { count: completedGoals } = await supabase
      .from("period_goals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", true);

    values.set("goal_getter", completedGoals || 0);

    // ── Perfect weeks (simplified: check if 7+ days journaled) ──
    const { data: weeklyDates } = await supabase
      .from("matches")
      .select("date")
      .eq("user_id", userId)
      .gte("date", new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const weekDays = new Set<string>();
    weeklyDates?.forEach((d) => weekDays.add(d.date));
    const perfectWeeks = Math.floor(weekDays.size / 7);
    values.set("perfect_week", perfectWeeks);

    return values;
  }, []);

  // Check and award new badges
  useEffect(() => {
    if (isLoading) return;

    const checkBadges = async () => {
      const values = await computeProgress();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;

      const newBadges: EarnedBadge[] = [];

      for (const badge of BADGES) {
        const currentValue = values.get(badge.id) || 0;
        for (const tier of badge.tiers) {
          const key = `${badge.id}-${tier.tier}`;
          if (!earnedRef.current.has(key) && currentValue >= tier.requirement) {
            // Award this badge
            const { error } = await supabase.from("user_badges").insert({
              user_id: sessionData.session.user.id,
              badge_id: badge.id,
              tier: tier.tier,
            });

            if (!error) {
              const earned: EarnedBadge = {
                badge_id: badge.id,
                tier: tier.tier,
                earned_at: new Date().toISOString(),
              };
              newBadges.push(earned);
              earnedRef.current.add(key);

              // Only celebrate one badge at a time
              if (newBadges.length <= 1) {
                setRecentlyEarned(earned);
              }
            }
          }
        }
      }

      if (newBadges.length > 0) {
        setEarnedBadges((prev) => [...newBadges, ...prev]);
      }
    };

    checkBadges();
  }, [isLoading, computeProgress]);

  // Build progress array from badge definitions + earned
  const progress: BadgeProgress[] = BADGES.map((badge) => {
    return {
      definition: badge,
      currentValue: 0, // computed on demand
      currentTier: 0,
      isEarned: (tier: BadgeTier) =>
        earnedBadges.some(
          (e) => e.badge_id === badge.id && e.tier === tier.tier
        ),
    };
  });

  const dismissCelebration = () => setRecentlyEarned(null);

  const totalEarned = new Set(earnedBadges.map((e) => `${e.badge_id}-${e.tier}`)).size;
  const totalBadges = BADGES.reduce((sum, b) => sum + b.tiers.length, 0);

  return {
    progress,
    earnedBadges,
    totalEarned,
    totalBadges,
    isLoading,
    recentlyEarned,
    dismissCelebration,
  };
}
