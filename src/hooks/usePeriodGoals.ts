import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import type {
  PeriodGoal,
  GoalType,
  GoalProgress,
  GoalCadence,
  GoalMetadata,
  WeeklyAdherence,
} from "@/types/goals";
import {
  differenceInCalendarDays,
  isAfter,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { isGuidedReflection } from "@/utils/reflectionNotes";
import {
  allWeeklyTargetsMet,
  computeWeeklyAdherence,
  weeklyProgressPercentage,
  weeklyRemaining,
} from "@/utils/processGoalCalc";

interface UsePeriodGoalsReturn {
  goals: PeriodGoal[];
  activeGoals: PeriodGoal[];
  completedGoals: PeriodGoal[];
  expiredGoals: PeriodGoal[];
  isLoading: boolean;
  error: string | null;
  createGoal: (goal: CreateGoalInput) => Promise<void>;
  updateGoal: (id: string, updates: Partial<PeriodGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
  getGoalProgress: (goal: PeriodGoal) => GoalProgress;
  calculateCurrentValue: (goal: PeriodGoal) => Promise<number>;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value: number;
  unit: string;
  period_start: string;
  period_end: string;
  cadence?: GoalCadence;
  metadata?: GoalMetadata;
}

function normalizeGoal(row: Record<string, unknown>): PeriodGoal {
  const rawMetadata = row.metadata;
  const metadata: GoalMetadata =
    rawMetadata && typeof rawMetadata === "object" && !Array.isArray(rawMetadata)
      ? (rawMetadata as GoalMetadata)
      : {};

  return {
    ...(row as PeriodGoal),
    cadence: (row.cadence as GoalCadence) || "period_total",
    metadata,
  };
}

export function usePeriodGoals(): UsePeriodGoalsReturn {
  const { sport } = useSport();
  const [goals, setGoals] = useState<PeriodGoal[]>([]);
  const [weeklyAdherenceByGoalId, setWeeklyAdherenceByGoalId] = useState<
    Record<string, WeeklyAdherence>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const hasSyncedRef = useRef(false);

  const fetchGoals = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? hasLoadedRef.current;

    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setGoals([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("period_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const now = new Date();
      const updatedGoals = (data || []).map((goal) => {
        const normalized = normalizeGoal(goal as Record<string, unknown>);
        const goalEnd = parseISO(normalized.period_end);
        if (normalized.status === "active" && isAfter(now, endOfDay(goalEnd))) {
          return { ...normalized, status: "expired" as const };
        }
        return normalized;
      });

      setGoals(updatedGoals);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load goals";
      setError(message);
      console.error("Error fetching goals:", err);
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const fetchGoalActivityDates = async (
    goal: PeriodGoal,
    userId: string
  ): Promise<string[]> => {
    const periodStart = goal.period_start;
    const periodEnd = goal.period_end;

    switch (goal.goal_type) {
      case "wellness_checkins": {
        const { data, error } = await supabase
          .from("wellness_entries")
          .select("entry_date")
          .eq("user_id", userId)
          .gte("entry_date", periodStart)
          .lte("entry_date", periodEnd);

        if (error || !data) return [];
        return data.map((row) => row.entry_date);
      }

      case "journaled_sessions": {
        const { data, error } = await supabase
          .from("training_notes")
          .select("training_date")
          .eq("user_id", userId)
          .gte("training_date", periodStart)
          .lte("training_date", periodEnd);

        if (error || !data) return [];
        return data.map((row) => row.training_date);
      }

      case "activity_sessions": {
        let query = supabase
          .from("training_sessions")
          .select("session_date")
          .eq("user_id", userId)
          .gte("session_date", periodStart)
          .lte("session_date", periodEnd);

        if (goal.metadata?.activity_type) {
          query = query.eq("activity_type", goal.metadata.activity_type);
        }

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((row) => row.session_date);
      }

      case "match_reflections": {
        const { data, error } = await supabase
          .from("matches")
          .select("date, reflection_prompt_used, notes")
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !data) return [];
        return data
          .filter((match) => isGuidedReflection(match))
          .map((match) => match.date);
      }

      case "training_sessions": {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("session_date")
          .eq("user_id", userId)
          .gte("session_date", periodStart)
          .lte("session_date", periodEnd);

        if (error || !data) return [];
        return data.map((row) => row.session_date);
      }

      case "matches_played":
      case "matches_logged": {
        const { data, error } = await supabase
          .from("matches")
          .select("date")
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !data) return [];
        return data.map((row) => row.date);
      }

      case "matches_won": {
        const { data, error } = await supabase
          .from("matches")
          .select("date")
          .eq("user_id", userId)
          .eq("is_win", true)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !data) return [];
        return data.map((row) => row.date);
      }

      default:
        return [];
    }
  };

  const calculateCurrentValueInternal = async (
    goal: PeriodGoal,
    userId: string
  ): Promise<number> => {
    if (goal.cadence === "weekly") {
      const dates = await fetchGoalActivityDates(goal, userId);
      const adherence = computeWeeklyAdherence(
        dates,
        goal.period_start,
        goal.period_end,
        goal.target_value
      );
      return adherence.currentWeekCount;
    }

    const periodStart = goal.period_start;
    const periodEnd = goal.period_end;

    switch (goal.goal_type) {
      case "win_rate": {
        const { data: matches, error } = await supabase
          .from("matches")
          .select("is_win")
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !matches || matches.length === 0) return 0;
        const wins = matches.filter((m) => m.is_win).length;
        return Math.round((wins / matches.length) * 100);
      }

      case "matches_played":
      case "matches_logged": {
        const { count, error } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error) return 0;
        return count || 0;
      }

      case "matches_won": {
        const { count, error } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_win", true)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error) return 0;
        return count || 0;
      }

      case "training_sessions": {
        const { count, error } = await supabase
          .from("training_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("session_date", periodStart)
          .lte("session_date", periodEnd);

        if (error) return 0;
        return count || 0;
      }

      case "wellness_checkins": {
        const { count, error } = await supabase
          .from("wellness_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("entry_date", periodStart)
          .lte("entry_date", periodEnd);

        if (error) return 0;
        return count || 0;
      }

      case "journaled_sessions": {
        const { count, error } = await supabase
          .from("training_notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("training_date", periodStart)
          .lte("training_date", periodEnd);

        if (error) return 0;
        return count || 0;
      }

      case "activity_sessions": {
        let query = supabase
          .from("training_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("session_date", periodStart)
          .lte("session_date", periodEnd);

        if (goal.metadata?.activity_type) {
          query = query.eq("activity_type", goal.metadata.activity_type);
        }

        const { count, error } = await query;
        if (error) return 0;
        return count || 0;
      }

      case "match_reflections": {
        const { data, error } = await supabase
          .from("matches")
          .select("reflection_prompt_used, notes")
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !data) return 0;
        return data.filter((match) => isGuidedReflection(match)).length;
      }

      case "streak_days": {
        const { data: matches } = await supabase
          .from("matches")
          .select("date")
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        const { data: trainingNotes } = await supabase
          .from("training_notes")
          .select("training_date")
          .eq("user_id", userId)
          .gte("training_date", periodStart)
          .lte("training_date", periodEnd);

        const { data: playerNotes } = await supabase
          .from("player_notes")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", periodStart + "T00:00:00")
          .lte("created_at", periodEnd + "T23:59:59");

        const dates = new Set<string>();
        matches?.forEach((m) => dates.add(m.date));
        trainingNotes?.forEach((t) => dates.add(t.training_date));
        playerNotes?.forEach((p) => p.created_at && dates.add(p.created_at.split("T")[0]));

        if (dates.size === 0) return 0;

        const sortedDates = Array.from(dates).sort();
        let maxStreak = 0;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
          const prev = parseISO(sortedDates[i - 1]);
          const curr = parseISO(sortedDates[i]);
          if (differenceInCalendarDays(curr, prev) === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);

        return maxStreak;
      }

      case "personal_best": {
        const { count, error } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("date", periodStart)
          .lte("date", periodEnd);

        if (error || !count) return 0;
        return count > 0 ? 1 : 0;
      }

      default:
        return goal.current_value;
    }
  };

  const computeWeeklyAdherenceForGoals = useCallback(
    async (goalList: PeriodGoal[]) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const weeklyGoals = goalList.filter((g) => g.cadence === "weekly");
      if (weeklyGoals.length === 0) return;

      const adherenceUpdates: Record<string, WeeklyAdherence> = {};
      for (const goal of weeklyGoals) {
        const dates = await fetchGoalActivityDates(goal, user.id);
        adherenceUpdates[goal.id] = computeWeeklyAdherence(
          dates,
          goal.period_start,
          goal.period_end,
          goal.target_value
        );
      }
      setWeeklyAdherenceByGoalId(adherenceUpdates);
    },
    []
  );

  const syncGoalProgress = useCallback(async (goalList: PeriodGoal[]) => {
    if (goalList.length === 0) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    const now = new Date();
    const activeGoals = goalList.filter((g) => g.status === "active" && !g.is_completed);
    const adherenceUpdates: Record<string, WeeklyAdherence> = {};

    for (const goal of activeGoals) {
      let adherence: WeeklyAdherence | undefined;

      if (goal.cadence === "weekly") {
        const dates = await fetchGoalActivityDates(goal, user.id);
        adherence = computeWeeklyAdherence(
          dates,
          goal.period_start,
          goal.period_end,
          goal.target_value
        );
        adherenceUpdates[goal.id] = adherence;
      }

      const newValue = await calculateCurrentValueInternal(goal, user.id);
      const periodEnded = isAfter(now, endOfDay(parseISO(goal.period_end)));

      const updates: Partial<PeriodGoal> = {};
      let shouldUpdate = newValue !== goal.current_value;

      if (newValue !== goal.current_value) {
        updates.current_value = newValue;
        updates.updated_at = new Date().toISOString();
      }

      if (goal.cadence === "weekly" && adherence && periodEnded) {
        const allMet = allWeeklyTargetsMet(adherence);
        if (allMet) {
          updates.is_completed = true;
          updates.status = "completed";
          updates.completed_at = new Date().toISOString();
          shouldUpdate = true;
        } else if (goal.status === "active") {
          updates.status = "expired";
          shouldUpdate = true;
        }
      } else if (
        goal.cadence !== "weekly" &&
        newValue >= goal.target_value &&
        !goal.is_completed
      ) {
        updates.is_completed = true;
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
        shouldUpdate = true;
      } else if (periodEnded && goal.status === "active" && !goal.is_completed) {
        updates.status = "expired";
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await supabase.from("period_goals").update(updates).eq("id", goal.id);
      }
    }

    if (Object.keys(adherenceUpdates).length > 0) {
      setWeeklyAdherenceByGoalId((prev) => ({ ...prev, ...adherenceUpdates }));
    }
  }, []);

  useEffect(() => {
    if (isLoading || hasSyncedRef.current || goals.length === 0) return;

    hasSyncedRef.current = true;

    const runSync = async () => {
      await syncGoalProgress(goals);
      await fetchGoals({ silent: true });
    };

    void runSync();
  }, [isLoading, goals, syncGoalProgress, fetchGoals]);

  useEffect(() => {
    if (!isLoading && goals.length > 0) {
      computeWeeklyAdherenceForGoals(goals);
    }
  }, [goals, isLoading, computeWeeklyAdherenceForGoals]);

  const getGoalProgress = useCallback(
    (goal: PeriodGoal): GoalProgress => {
      const periodStart = startOfDay(parseISO(goal.period_start));
      const periodEnd = endOfDay(parseISO(goal.period_end));
      const now = startOfDay(new Date());

      const daysTotal = differenceInCalendarDays(periodEnd, periodStart) + 1;
      const daysElapsed = Math.min(
        differenceInCalendarDays(now, periodStart) + 1,
        daysTotal
      );
      const daysRemaining = Math.max(0, daysTotal - daysElapsed);

      const weekly = weeklyAdherenceByGoalId[goal.id];

      if (goal.cadence === "weekly" && weekly) {
        const percentage = weeklyProgressPercentage(
          weekly.currentWeekCount,
          goal.target_value
        );
        const currentWeekMet = weekly.currentWeekCount >= goal.target_value;
        const expectedMetByNow = Math.max(
          1,
          Math.ceil((weekly.weeksElapsed / Math.max(weekly.weeksTotal, 1)) * weekly.weeksTotal)
        );
        const isOnTrack =
          currentWeekMet || weekly.weeksMet >= expectedMetByNow - 1;

        return {
          percentage,
          remaining: weeklyRemaining(weekly.currentWeekCount, goal.target_value),
          isOnTrack,
          daysElapsed,
          daysTotal,
          daysRemaining,
          projectedValue: weekly.weeksMet,
          weekly,
        };
      }

      const percentage =
        goal.target_value > 0
          ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
          : 0;

      const expectedProgress =
        daysTotal > 0 ? (daysElapsed / daysTotal) * goal.target_value : 0;
      const isOnTrack = goal.current_value >= expectedProgress;

      const dailyRate = daysElapsed > 0 ? goal.current_value / daysElapsed : 0;
      const projectedValue = Math.round(dailyRate * daysTotal);

      return {
        percentage,
        remaining: Math.max(0, goal.target_value - goal.current_value),
        isOnTrack,
        daysElapsed,
        daysTotal,
        daysRemaining,
        projectedValue,
      };
    },
    [weeklyAdherenceByGoalId]
  );

  const calculateCurrentValue = useCallback(
    async (goal: PeriodGoal): Promise<number> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return 0;
      return calculateCurrentValueInternal(goal, user.id);
    },
    []
  );

  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("period_goals").insert({
          user_id: user.id,
          sport_id: sport.id,
          title: input.title,
          description: input.description || null,
          goal_type: input.goal_type,
          target_value: input.target_value,
          current_value: 0,
          unit: input.unit,
          period_start: input.period_start,
          period_end: input.period_end,
          cadence: input.cadence || "period_total",
          metadata: input.metadata || {},
        });

        if (error) throw error;
        await fetchGoals();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create goal";
        console.error("Error creating goal:", err);
        throw new Error(message);
      }
    },
    [sport.id, fetchGoals]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<PeriodGoal>) => {
      try {
        const { error } = await supabase
          .from("period_goals")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
        await fetchGoals();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update goal";
        console.error("Error updating goal:", err);
        throw new Error(message);
      }
    },
    [fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("period_goals").delete().eq("id", id);

        if (error) throw error;
        setWeeklyAdherenceByGoalId((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await fetchGoals();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete goal";
        console.error("Error deleting goal:", err);
        throw new Error(message);
      }
    },
    [fetchGoals]
  );

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals]
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed"),
    [goals]
  );
  const expiredGoals = useMemo(
    () => goals.filter((g) => g.status === "expired"),
    [goals]
  );

  return {
    goals,
    activeGoals,
    completedGoals,
    expiredGoals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: fetchGoals,
    getGoalProgress,
    calculateCurrentValue,
  };
}
