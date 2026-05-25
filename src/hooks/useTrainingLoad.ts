
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useToast } from "@/hooks/use-toast";
import { TrainingSession, ActivityType } from "@/types/trainingLoad";
import { calculateWeeklyMetrics, calculateTrainingLoad } from "@/utils/trainingLoadCalc";
import { subDays, format } from "date-fns";

interface LogSessionInput {
  rpe: number;
  duration_minutes: number;
  activity_type: ActivityType;
  sport_specific?: string;
  session_date?: string;
  notes?: string;
  training_note_id?: string;
  planned_duration?: number;
}

export function useTrainingLoad() {
  const { sport } = useSport();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) { setSessions([]); return; }

      const since = format(subDays(new Date(), 56), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("sport_id", sport.id)
        .gte("session_date", since)
        .order("session_date", { ascending: true });

      if (error) throw error;
      setSessions((data as TrainingSession[]) || []);
    } catch (error: unknown) {
      console.error("Error fetching training sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sport.id]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const logSession = useCallback(async (input: LogSessionInput) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) throw new Error("Not authenticated");

      const training_load = calculateTrainingLoad(input.rpe, input.duration_minutes);

      const { error } = await supabase.from("training_sessions").insert({
        user_id: user.id,
        sport_id: sport.id,
        rpe: input.rpe,
        duration_minutes: input.duration_minutes,
        training_load,
        activity_type: input.activity_type,
        sport_specific: input.sport_specific || null,
        session_date: input.session_date || format(new Date(), "yyyy-MM-dd"),
        notes: input.notes || null,
        training_note_id: input.training_note_id || null,
        planned_duration: input.planned_duration || null,
      });

      if (error) throw error;
      toast({ title: "Session logged", description: `Training load: ${training_load}` });
      await fetchSessions();
    } catch (error: unknown) {
      console.error("Error logging session:", error);
      const message = error instanceof Error ? error.message : "Failed to log session";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  }, [sport.id, fetchSessions, toast]);

  const deleteSession = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("training_sessions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Session deleted" });
      await fetchSessions();
    } catch (error: unknown) {
      console.error("Error deleting session:", error);
      toast({ title: "Error", description: "Failed to delete session", variant: "destructive" });
    }
  }, [fetchSessions, toast]);

  const metrics = useMemo(() => calculateWeeklyMetrics(sessions), [sessions]);

  return { sessions, isLoading, logSession, deleteSession, metrics, refetch: fetchSessions };
}
