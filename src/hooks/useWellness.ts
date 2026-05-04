
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useToast } from "@/hooks/use-toast";
import { WellnessEntry } from "@/types/wellness";
import {
  calculateHooperIndex,
  getWellnessZone,
  checkWellnessAlerts,
  calculateWellnessTrend,
  calculateWellnessAverage,
  calculateWellnessStreak,
  WellnessAlert,
  WellnessTrendPoint,
} from "@/utils/wellnessCalc";
import { subDays, format } from "date-fns";

export interface WellnessSubmitInput {
  sleep_quality: number;
  sleep_duration_hours?: number | null;
  fatigue: number;
  muscle_soreness: number;
  stress_level: number;
  mood: number;
  motivation?: number | null;
  energy?: number | null;
  appetite?: number | null;
  notes?: string | null;
  menstrual_cycle_day?: number | null;
  entry_date?: string;
}

export interface WellnessMetrics {
  weeklyAverage: number;
  todayScore: number | null;
  todayZone: ReturnType<typeof getWellnessZone> | null;
  streak: number;
  alerts: WellnessAlert[];
  trend: WellnessTrendPoint[];
}

export function useWellness() {
  const { sport } = useSport();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setEntries([]);
        return;
      }

      const since = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("wellness_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("sport_id", sport.id)
        .gte("entry_date", since)
        .order("entry_date", { ascending: true });

      if (error) throw error;
      setEntries((data as WellnessEntry[]) || []);
    } catch (error) {
      console.error("Error fetching wellness entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sport.id]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const submitEntry = useCallback(
    async (input: WellnessSubmitInput) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Not authenticated");

        const totalScore = calculateHooperIndex(input);
        const entryDate = input.entry_date || format(new Date(), "yyyy-MM-dd");

        const { error } = await supabase.from("wellness_entries").upsert(
          {
            user_id: user.id,
            sport_id: sport.id,
            entry_date: entryDate,
            sleep_quality: input.sleep_quality,
            sleep_duration_hours: input.sleep_duration_hours || null,
            fatigue: input.fatigue,
            muscle_soreness: input.muscle_soreness,
            stress_level: input.stress_level,
            mood: input.mood,
            total_wellness_score: totalScore,
            motivation: input.motivation || null,
            energy: input.energy || null,
            appetite: input.appetite || null,
            notes: input.notes || null,
            menstrual_cycle_day: input.menstrual_cycle_day || null,
          },
          { onConflict: "user_id,entry_date" }
        );

        if (error) throw error;

        await fetchEntries();
      } catch (error: unknown) {
        console.error("Error submitting wellness entry:", error);
        const message = error instanceof Error ? error.message : "Failed to save wellness check-in";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
    [sport.id, fetchEntries, toast]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("wellness_entries")
          .delete()
          .eq("id", id);
        if (error) throw error;
        toast({ title: "Entry deleted" });
        await fetchEntries();
      } catch (error: unknown) {
        console.error("Error deleting wellness entry:", error);
        toast({
          title: "Error",
          description: "Failed to delete entry",
          variant: "destructive",
        });
      }
    },
    [fetchEntries, toast]
  );

  const todayEntry = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.find((e) => e.entry_date === today) || null;
  }, [entries]);

  const metrics: WellnessMetrics = useMemo(() => {
    const last7 = entries.slice(-7);
    const weeklyAverage = calculateWellnessAverage(last7);
    const streak = calculateWellnessStreak(entries);
    const trend = calculateWellnessTrend(entries);
    const alerts = todayEntry ? checkWellnessAlerts(todayEntry, entries) : [];
    const todayScore = todayEntry?.total_wellness_score ?? null;
    const todayZone = todayScore !== null ? getWellnessZone(todayScore) : null;

    return { weeklyAverage, todayScore, todayZone, streak, alerts, trend };
  }, [entries, todayEntry]);

  return {
    entries,
    isLoading,
    submitEntry,
    deleteEntry,
    todayEntry,
    metrics,
    refetch: fetchEntries,
  };
}
