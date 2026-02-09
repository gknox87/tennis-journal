import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanType = "free" | "pro" | "team";

interface SubscriptionData {
  plan: PlanType;
  isLoading: boolean;
  isFreePlan: boolean;
  isProPlan: boolean;
  isTeamPlan: boolean;
  matchesThisMonth: number;
  keyOpponentCount: number;
  canLogMatch: () => boolean;
  canAddKeyOpponent: () => boolean;
  canShareWithCoach: () => boolean;
  canUseAI: () => boolean;
  canExportData: () => boolean;
  matchLimit: number | null;
  keyOpponentLimit: number | null;
  refetch: () => Promise<void>;
}

const FREE_MATCH_LIMIT = 10;
const FREE_KEY_OPPONENT_LIMIT = 3;

export const useSubscription = (): SubscriptionData => {
  const [plan, setPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [matchesThisMonth, setMatchesThisMonth] = useState(0);
  const [keyOpponentCount, setKeyOpponentCount] = useState(0);

  const fetchAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch subscription, monthly matches, and key opponents in parallel
      const [subResult, matchResult, opponentResult] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle(),
        (() => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          return supabase
            .from("matches")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("date", startOfMonth);
        })(),
        supabase
          .from("opponents")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_key_opponent", true),
      ]);

      setPlan((subResult.data?.plan as PlanType) || "free");
      setMatchesThisMonth(matchResult.count || 0);
      setKeyOpponentCount(opponentResult.count || 0);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const isFreePlan = plan === "free";
  const isProPlan = plan === "pro";
  const isTeamPlan = plan === "team";

  const canLogMatch = () => !isFreePlan || matchesThisMonth < FREE_MATCH_LIMIT;
  const canAddKeyOpponent = () => !isFreePlan || keyOpponentCount < FREE_KEY_OPPONENT_LIMIT;
  const canShareWithCoach = () => !isFreePlan;
  const canUseAI = () => !isFreePlan;
  const canExportData = () => !isFreePlan;

  return {
    plan,
    isLoading,
    isFreePlan,
    isProPlan,
    isTeamPlan,
    matchesThisMonth,
    keyOpponentCount,
    canLogMatch,
    canAddKeyOpponent,
    canShareWithCoach,
    canUseAI,
    canExportData,
    matchLimit: isFreePlan ? FREE_MATCH_LIMIT : null,
    keyOpponentLimit: isFreePlan ? FREE_KEY_OPPONENT_LIMIT : null,
    refetch: fetchAll,
  };
};
