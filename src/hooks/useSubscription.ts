import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'coach';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsageLimit {
  limit_type: string;
  current_count: number;
  limit: number;
  reset_date: string;
}

export const useSubscription = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" - that's okay, user gets free tier
        console.error('Error fetching subscription:', error);
      }

      return data || null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const tier: SubscriptionTier = subscription?.tier || 'free';
  const isPro = tier === 'pro' || tier === 'coach';
  const isCoach = tier === 'coach';
  const isActive = subscription?.status === 'active';

  const canAccessFeature = (feature: string): boolean => {
    if (!isActive) return false;

    switch (feature) {
      case 'video_analysis':
      case 'advanced_analytics':
      case 'multi_sport':
      case 'export':
        return isPro;
      case 'coach_tools':
        return isCoach;
      default:
        return true;
    }
  };

  const getUsageLimit = async (limitType: string): Promise<number> => {
    if (!userId) return 0;

    const { data, error } = await supabase.rpc('get_usage_limit', {
      p_user_id: userId,
      p_limit_type: limitType,
    });

    if (error) {
      console.error('Error getting usage limit:', error);
      return tier === 'free' ? 0 : 999999;
    }

    return data || 0;
  };

  const getCurrentUsage = async (limitType: string): Promise<number> => {
    if (!userId) return 0;

    const { data, error } = await supabase.rpc('get_current_usage', {
      p_user_id: userId,
      p_limit_type: limitType,
    });

    if (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }

    return data || 0;
  };

  const checkUsageLimit = async (limitType: string): Promise<boolean> => {
    if (isPro) return true; // Pro and Coach have unlimited access

    const limit = await getUsageLimit(limitType);
    const current = await getCurrentUsage(limitType);

    return current < limit;
  };

  const incrementUsage = async (limitType: string): Promise<boolean> => {
    if (!userId) return false;

    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_limit_type: limitType,
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    return data || false;
  };

  return {
    subscription,
    tier,
    isPro,
    isCoach,
    isActive,
    isLoading,
    canAccessFeature,
    getUsageLimit,
    getCurrentUsage,
    checkUsageLimit,
    incrementUsage,
  };
};
