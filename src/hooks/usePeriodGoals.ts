import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import type { PeriodGoal, GoalType, GoalProgress } from "@/types/goals";
import { differenceInDays, differenceInCalendarDays, isAfter, isBefore, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

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
}

export function usePeriodGoals(): UsePeriodGoalsReturn {
  const { sport } = useSport();
  const [goals, setGoals] = useState<PeriodGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
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

      // Auto-update status for expired goals
      const now = new Date();
      const updatedGoals = (data || []).map((goal) => {
        const goalEnd = parseISO(goal.period_end);
        if (goal.status === "active" && isAfter(now, endOfDay(goalEnd))) {
          return { ...goal, status: "expired" as const };
        }
        return goal as PeriodGoal;
      });

      setGoals(updatedGoals as PeriodGoal[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load goals";
      setError(message);
      console.error("Error fetching goals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Auto-sync goal progress when goals or matches change
  useEffect(() => {
    const syncProgress = async () => {
      if (goals.length === 0) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const now = new Date();
      const activeGoals = goals.filter(
        (g) => g.status === "active" && !g.is_completed
      );

      for (const goal of activeGoals) {
        const newValue = await calculateCurrentValueInternal(goal, user.id);

        if (newValue !== goal.current_value) {
          const updates: Partial<PeriodGoal> = {
            current_value: newValue,
            updated_at: new Date().toISOString(),
          };

          // Check if goal is completed
          if (newValue >= goal.target_value && !goal.is_completed) {
            updates.is_completed = true;
            updates.status = "completed";
            updates.completed_at = new Date().toISOString();
          }

          await supabase.from("period_goals").update(updates).eq("id", goal.id);
        }
      }

      // Refresh after sync
      await fetchGoals();
    };

    syncProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateCurrentValueInternal = async (
    goal: PeriodGoal,
    userId: string
  ): Promise<number> => {
    const periodStart = startOfDay(parseISO(goal.period_start));
    const periodEnd = endOfDay(parseISO(goal.period_end));

    switch (goal.goal_type) {
      case "win_rate": {
        const { data: matches, error } = await supabase
          .from("matches")
          .select("is_win")
          .eq("user_id", userId)
          .gte("date", goal.period_start)
          .lte("date", goal.period_end);

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
          .gte("date", goal.period_start)
          .lte("date", goal.period_end);

        if (error) return 0;
        return count || 0;
      }

      case "matches_won": {
        const { count, error } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_win", true)
          .gte("date", goal.period_start)
          .lte("date", goal.period_end);

        if (error) return 0;
        return count || 0;
      }

      case "training_sessions": {
        const { count, error } = await supabase
          .from("training_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("session_date", goal.period_start)
          .lte("session_date", goal.period_end);

        if (error) return 0;
        return count || 0;
      }

      case "streak_days": {
        // Calculate journaling streak within the period
        const { data: matches } = await supabase
          .from("matches")
          .select("date")
          .eq("user_id", userId)
          .gte("date", goal.period_start)
          .lte("date", goal.period_end);

        const { data: trainingNotes } = await supabase
          .from("training_notes")
          .select("training_date")
          .eq("user_id", userId)
          .gte("training_date", goal.period_start)
          .lte("training_date", goal.period_end);

        const { data: playerNotes } = await supabase
          .from("player_notes")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", goal.period_start + "T00:00:00")
          .lte("created_at", goal.period_end + "T23:59:59");

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
        // Check if any personal best was set in this period
        // This is sport-specific; for now, return 1 if any match was logged
        const { count, error } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("date", goal.period_start)
          .lte("date", goal.period_end);

        if (error || !count) return 0;
        return count > 0 ? 1 : 0;
      }

      default:
        return goal.current_value;
    }
  };

  const getGoalProgress = useCallback((goal: PeriodGoal): GoalProgress => {
    const periodStart = startOfDay(parseISO(goal.period_start));
    const periodEnd = endOfDay(parseISO(goal.period_end));
    const now = startOfDay(new Date());

    const daysTotal = differenceInCalendarDays(periodEnd, periodStart) + 1;
    const daysElapsed = Math.min(
      differenceInCalendarDays(now, periodStart) + 1,
      daysTotal
    );
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);

    const percentage =
      goal.target_value > 0
        ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
        : 0;

    const expectedProgress = daysTotal > 0 ? (daysElapsed / daysTotal) * goal.target_value : 0;
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
  }, []);

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
