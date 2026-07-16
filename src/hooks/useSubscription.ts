import { useState, useCallback } from "react";

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
  canAccessWellnessLoadInsights: () => boolean;
  canAccessPatternInsights: () => boolean;
  keyOpponentLimit: number | null;
  aiLimit: number | null;
  videoLimit: number | null;
  refetch: () => Promise<void>;
  startTrial: () => Promise<void>;
}

export const useSubscription = (): SubscriptionData => {
  const [isLoading] = useState(false);

  const noop = useCallback(async () => {}, []);

  return {
    plan: "pro",
    isLoading,
    isFreePlan: false,
    isProPlan: true,
    isTeamPlan: false,
    isTrial: false,
    trialDaysLeft: 0,
    aiUsageThisMonth: 0,
    videoUsageThisMonth: 0,
    keyOpponentCount: 0,
    canAddKeyOpponent: () => true,
    canShareWithCoach: () => true,
    canUseAI: () => true,
    canUseVideo: () => true,
    canExportData: () => true,
    canUseCustomPrompts: () => true,
    canAccessAdvancedAnalytics: () => true,
    canAccessWellnessLoadInsights: () => true,
    canAccessPatternInsights: () => true,
    keyOpponentLimit: null,
    aiLimit: null,
    videoLimit: null,
    refetch: noop,
    startTrial: noop,
  };
};
