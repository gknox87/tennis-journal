import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanType = "free" | "pro" | "team" | "trial";

interface SubscriptionData {
  plan: PlanType;
  isLoading: boolean;
  isFreePlan: boolean;
  isProPlan: boolean;
  isTeamPlan: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
  aiUsageThisMonth: number;
  videoUsageThisMonth: number;
  keyOpponentCount: number;
  canAddKeyOpponent: () => boolean;
  canShareWithCoach: () => boolean;
  canUseAI: () => boolean;
  canUseVideo: () => boolean;
  canExportData: () => boolean;
  canUseCustomPrompts: () => boolean;
  canAccessAdvancedAnalytics: () => boolean;
  keyOpponentLimit: number | null;
  aiLimit: number | null;
  videoLimit: number | null;
  refetch: () => Promise<void>;
  startTrial: () => Promise<void>;
}

const FREE_OPPONENT_LIMIT = 3;
const FREE_AI_LIMIT = 3;
const FREE_VIDEO_LIMIT = 2;
const TRIAL_DAYS = 14;

export const useSubscription = (): SubscriptionData => {
  const [plan, setPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [aiUsageThisMonth, setAiUsageThisMonth] = useState(0);
  const [videoUsageThisMonth, setVideoUsageThisMonth] = useState(0);
  const [keyOpponentCount, setKeyOpponentCount] = useState(0);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);

  const calculateTrialDaysLeft = (end: string | null): number => {
    if (!end) return 0;
    const endDate = new Date(end);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  };

  const fetchAll = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;
      const monthStart = getMonthStart();

      // Check AI usage (matches with reflection_prompt_used)
      const { count: aiCount } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart)
        .not("reflection_prompt_used", "is", null);

      // Check video usage (training sessions with notes containing "video")
      // Simplified: count training sessions this month as proxy for video
      const { count: videoCount } = await supabase
        .from("training_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart);

      // Fetch subscription, opponents in parallel
      const [subResult, opponentResult] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("plan, trial_end")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("opponents")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_key_opponent", true),
      ]);

      const subData = subResult.data as any;
      const dbPlan = (subData?.plan as PlanType) || "free";
      const dbTrialEnd = subData?.trial_end || null;

      // Check if trial expired
      if (dbPlan === "trial" && dbTrialEnd) {
        const daysLeft = calculateTrialDaysLeft(dbTrialEnd);
        if (daysLeft <= 0) {
          // Trial expired — revert to free
          await supabase
            .from("subscriptions")
            .update({ plan: "free" })
            .eq("user_id", userId);
          setPlan("free");
          setTrialEnd(null);
        } else {
          setPlan("trial");
          setTrialEnd(dbTrialEnd);
        }
      } else {
        setPlan(dbPlan);
        setTrialEnd(dbPlan === "trial" ? dbTrialEnd : null);
      }

      setAiUsageThisMonth(aiCount || 0);
      setVideoUsageThisMonth(videoCount || 0);
      setKeyOpponentCount(opponentResult.count || 0);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isFreePlan = plan === "free";
  const isProPlan = plan === "pro" || plan === "trial";
  const isTeamPlan = plan === "team";
  const isTrial = plan === "trial";
  const trialDaysLeft = isTrial ? calculateTrialDaysLeft(trialEnd) : 0;

  // Feature gates
  // Free: unlimited matches, 3 opponents, AI 3/month, video 2/month
  const canAddKeyOpponent = () => !isFreePlan || keyOpponentCount < FREE_OPPONENT_LIMIT;
  const canUseAI = () => !isFreePlan || (isFreePlan && aiUsageThisMonth < FREE_AI_LIMIT);
  const canUseVideo = () => !isFreePlan || (isFreePlan && videoUsageThisMonth < FREE_VIDEO_LIMIT);
  const canShareWithCoach = () => !isFreePlan;
  const canExportData = () => !isFreePlan;
  const canUseCustomPrompts = () => !isFreePlan;
  const canAccessAdvancedAnalytics = () => !isFreePlan;

  const startTrial = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);
    const trialEndStr = trialEndDate.toISOString();

    await supabase
      .from("subscriptions")
      .upsert({
        user_id: session.user.id,
        plan: "trial",
        trial_end: trialEndStr,
        status: "active",
      } as any);

    setPlan("trial");
    setTrialEnd(trialEndStr);
  };

  return {
    plan,
    isLoading,
    isFreePlan,
    isProPlan,
    isTeamPlan,
    isTrial,
    trialDaysLeft,
    aiUsageThisMonth,
    videoUsageThisMonth,
    keyOpponentCount,
    canAddKeyOpponent,
    canShareWithCoach,
    canUseAI,
    canUseVideo,
    canExportData,
    canUseCustomPrompts,
    canAccessAdvancedAnalytics,
    keyOpponentLimit: isFreePlan ? FREE_OPPONENT_LIMIT : null,
    aiLimit: isFreePlan ? FREE_AI_LIMIT : null,
    videoLimit: isFreePlan ? FREE_VIDEO_LIMIT : null,
    refetch: fetchAll,
    startTrial,
  };
};
