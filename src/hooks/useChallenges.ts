import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BADGES } from '@/constants/badges';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================
// TYPES
// ============================================

export type ChallengeType = 'daily' | 'weekly' | 'community';
export type ChallengeTargetType = 'matches' | 'win_rate' | 'journaling_days' | 'training' | 'wellness' | 'notes' | 'surface_variety' | 'journaling_streak';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string | null;
  target_type: ChallengeTargetType;
  target_value: number;
  reward_points: number;
  sport_id: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeWithProgress extends Challenge {
  user_progress: UserChallengeProgress | null;
  progress_percentage: number;
  state: 'available' | 'in_progress' | 'completed' | 'expired';
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  tier: number;
  tier_label: string | null;
  tier_color: string | null;
  category: string;
  sport_id: string | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  tier?: number;
  earned_at: string;
  badge?: Badge;
}

export interface BadgeWithDefinition extends UserBadge {
  badge: Badge;
}

// ============================================
// HOOK RETURN TYPE
// ============================================

export interface UseChallengesReturn {
  activeChallenges: ChallengeWithProgress[];
  dailyChallenges: ChallengeWithProgress[];
  weeklyChallenges: ChallengeWithProgress[];
  communityChallenges: ChallengeWithProgress[];
  userBadges: BadgeWithDefinition[];
  isLoading: boolean;
  error: string | null;
  claimChallengeReward: (challengeId: string) => Promise<{ success: boolean; error?: string }>;
  refreshChallenges: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useChallenges(): UseChallengesReturn {
  const [activeChallenges, setActiveChallenges] = useState<ChallengeWithProgress[]>([]);
  const [userBadges, setUserBadges] = useState<BadgeWithDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveChallenges = useCallback(async (): Promise<ChallengeWithProgress[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const userId = session.user.id;

    // Fetch active challenges
    const today = new Date().toISOString().split('T')[0];
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('type', { ascending: true })
      .order('reward_points', { ascending: false });

    if (challengesError) throw challengesError;

    // Fetch user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const progressMap = new Map(
      (progress || []).map(p => [p.challenge_id, p])
    );

    // Enrich challenges with progress
    const now = new Date();
    const challengesWithProgress: ChallengeWithProgress[] = (challenges || []).map(challenge => {
      const userProgress = progressMap.get(challenge.id) || null;
      const progress = userProgress?.progress || 0;
      const progressPercentage = Math.min(100, Math.round((progress / challenge.target_value) * 100));

      let state: ChallengeWithProgress['state'] = 'available';
      if (userProgress?.claimed_at) {
        state = 'completed';
      } else if (userProgress?.completed || progress >= challenge.target_value) {
        state = 'completed';
      } else if (userProgress && progress > 0) {
        state = 'in_progress';
      }

      // Check if expired (end_date passed)
      if (challenge.end_date) {
        const endDate = new Date(challenge.end_date);
        if (endDate < now) {
          state = 'expired';
        }
      }

      return {
        ...challenge,
        user_progress: userProgress,
        progress_percentage: progressPercentage,
        state,
      };
    });

    return challengesWithProgress;
  }, []);

  const resolveBadgeDefinition = useCallback((badgeId: string, tier: number): Badge => {
    const constantDef = BADGES.find((b) => b.id === badgeId);
    const tierDef = constantDef?.tiers.find((t) => t.tier === tier) ?? constantDef?.tiers[0];

    return {
      id: badgeId,
      name: constantDef?.name ?? 'Achievement',
      description: constantDef?.description ?? null,
      icon: tierDef?.icon ?? constantDef?.icon ?? '🏅',
      criteria_type: constantDef?.category ?? 'achievement',
      criteria_value: tierDef?.requirement ?? 0,
      tier,
      tier_label: tierDef?.label ?? null,
      tier_color: tierDef?.color ?? null,
      category: constantDef?.category ?? 'achievement',
      sport_id: null,
      created_at: new Date().toISOString(),
    };
  }, []);

  const fetchUserBadges = useCallback(async (): Promise<BadgeWithDefinition[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const userId = session.user.id;

    const { data: earnedBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('id, user_id, badge_id, tier, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (badgesError) throw badgesError;
    if (!earnedBadges?.length) return [];

    const uuidBadgeIds = earnedBadges
      .map((ub) => ub.badge_id)
      .filter((id) => UUID_REGEX.test(id));

    const dbBadgeMap = new Map<string, Badge>();
    if (uuidBadgeIds.length > 0) {
      const { data: dbBadges, error: dbBadgesError } = await supabase
        .from('badges')
        .select('*')
        .in('id', uuidBadgeIds);

      if (dbBadgesError) throw dbBadgesError;
      for (const badge of dbBadges || []) {
        dbBadgeMap.set(badge.id, badge as Badge);
      }
    }

    return earnedBadges.map((ub) => {
      const tier = ub.tier ?? 1;
      const badge =
        UUID_REGEX.test(ub.badge_id) && dbBadgeMap.has(ub.badge_id)
          ? dbBadgeMap.get(ub.badge_id)!
          : resolveBadgeDefinition(ub.badge_id, tier);

      return {
        ...ub,
        tier,
        badge,
      };
    });
  }, [resolveBadgeDefinition]);

  const refreshChallenges = useCallback(async () => {
    try {
      setError(null);
      const challenges = await fetchActiveChallenges();
      setActiveChallenges(challenges);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load challenges';
      setError(message);
      console.error('Error fetching challenges:', err);
    }
  }, [fetchActiveChallenges]);

  const refreshBadges = useCallback(async () => {
    try {
      const badges = await fetchUserBadges();
      setUserBadges(badges);
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  }, [fetchUserBadges]);

  const claimChallengeReward = useCallback(async (challengeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Not authenticated' };
      }

      const userId = session.user.id;

      // Get challenge to verify completion
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        return { success: false, error: 'Challenge not found' };
      }

      // Get or create progress record
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        return { success: false, error: 'Failed to fetch progress' };
      }

      if (!existingProgress || existingProgress.progress < challenge.target_value) {
        return { success: false, error: 'Challenge not completed yet' };
      }

      if (existingProgress.claimed_at) {
        return { success: false, error: 'Reward already claimed' };
      }

      // Mark as claimed
      const { error: updateError } = await supabase
        .from('user_challenge_progress')
        .update({
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (updateError) {
        return { success: false, error: 'Failed to claim reward' };
      }

      // Refresh challenges
      await refreshChallenges();
      return { success: true };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim reward';
      return { success: false, error: message };
    }
  }, [refreshChallenges]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([refreshChallenges(), refreshBadges()]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [refreshChallenges, refreshBadges]);

  // Subscribe to progress changes
  useEffect(() => {
    const channel = supabase
      .channel('challenges_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_challenge_progress' },
        () => { void refreshChallenges(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_badges' },
        () => { void refreshBadges(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshChallenges, refreshBadges]);

  // Categorize challenges
  const dailyChallenges = activeChallenges.filter(c => c.type === 'daily');
  const weeklyChallenges = activeChallenges.filter(c => c.type === 'weekly');
  const communityChallenges = activeChallenges.filter(c => c.type === 'community');

  return {
    activeChallenges,
    dailyChallenges,
    weeklyChallenges,
    communityChallenges,
    userBadges,
    isLoading,
    error,
    claimChallengeReward,
    refreshChallenges,
    refreshBadges,
  };
}
