
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useToast } from "@/hooks/use-toast";
import {
  InjuryReport,
  BodyRegion,
  PainType,
  OnsetType,
  ImpactLevel,
  InjuryTrend,
  InjuryDuration,
} from "@/types/injury";

export interface CreateInjuryInput {
  body_region: BodyRegion;
  body_part: string;
  coordinates?: { x: number; y: number };
  pain_level: number;
  impact_on_training: ImpactLevel;
  pain_types: PainType[];
  onset_type: OnsetType;
  duration: InjuryDuration;
  trend: InjuryTrend;
  previous_report_id?: string;
  treatment_notes?: string;
  sought_medical_attention: boolean;
  restricted_from_training: boolean;
  shared_with_coach: boolean;
}

export interface UpdateInjuryInput {
  pain_level?: number;
  impact_on_training?: ImpactLevel;
  pain_types?: PainType[];
  trend?: InjuryTrend;
  treatment_notes?: string;
  sought_medical_attention?: boolean;
  restricted_from_training?: boolean;
  shared_with_coach?: boolean;
}

export function useInjuryReports() {
  const { sport } = useSport();
  const { toast } = useToast();
  const [reports, setReports] = useState<InjuryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from("injury_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as unknown as InjuryReport[]) || []);
    } catch (error: unknown) {
      console.error("Error fetching injury reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const createReport = useCallback(
    async (input: CreateInjuryInput) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("injury_reports").insert({
          user_id: user.id,
          sport_id: sport.id,
          body_region: input.body_region,
          body_part: input.body_part,
          coordinates: input.coordinates
            ? { x: input.coordinates.x, y: input.coordinates.y }
            : null,
          pain_level: input.pain_level,
          impact_on_training: input.impact_on_training,
          pain_types: input.pain_types,
          onset_type: input.onset_type,
          duration: input.duration,
          trend: input.trend,
          previous_report_id: input.previous_report_id || null,
          treatment_notes: input.treatment_notes || null,
          sought_medical_attention: input.sought_medical_attention,
          restricted_from_training: input.restricted_from_training,
          shared_with_coach: input.shared_with_coach,
          coach_notified: false,
        });

        if (error) throw error;
        toast({
          title: "Injury reported",
          description: `${input.body_part} — Pain level ${input.pain_level}/10`,
        });
        await fetchReports();
      } catch (error: unknown) {
        console.error("Error creating injury report:", error);
        const message = error instanceof Error ? error.message : "Failed to save injury report";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
    [sport.id, fetchReports, toast]
  );

  const updateReport = useCallback(
    async (id: string, input: UpdateInjuryInput) => {
      try {
        const { error } = await supabase
          .from("injury_reports")
          .update(input)
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Injury updated" });
        await fetchReports();
      } catch (error: unknown) {
        console.error("Error updating injury report:", error);
        toast({
          title: "Error",
          description: "Failed to update injury report",
          variant: "destructive",
        });
      }
    },
    [fetchReports, toast]
  );

  const deleteReport = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("injury_reports")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Injury report deleted" });
        await fetchReports();
      } catch (error: unknown) {
        console.error("Error deleting injury report:", error);
        toast({
          title: "Error",
          description: "Failed to delete injury report",
          variant: "destructive",
        });
      }
    },
    [fetchReports, toast]
  );

  const activeInjuries = useMemo(() => {
    return reports.filter(
      (r) => r.trend !== "improving" || r.pain_level > 0
    );
  }, [reports]);

  const frequentRegions = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.body_region] = (counts[r.body_region] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([region, count]) => ({ region: region as BodyRegion, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
    activeInjuries,
    frequentRegions,
    refetch: fetchReports,
  };
}
