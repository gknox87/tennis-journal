import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ChallengeEvent {
  userId: string;
  eventType: 'match_logged' | 'journal_entry' | 'training_logged' | 'wellness_logged';
  metadata?: Record<string, unknown>;
}

interface BadgeCheck {
  badgeId: string;
  criteriaMet: boolean;
  previousValue: number;
  newValue: number;
}

serve(async (req) => {
  try {
    const { userId, eventType, metadata } = await req.json() as ChallengeEvent;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0];

    // Get current week boundaries (Monday to Sunday)
    const dayOfWeek = today.getDay();
    const mondayOffset = (dayOfWeek + 6) % 7;
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - mondayOffset);
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

    // ==========================================
    // FETCH USER STATS
    // ==========================================

    // Get match count today
    const { count: todayMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString());

    // Get match count this week
    const { count: weekMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', thisWeekStart.toISOString())
      .lt('date', thisWeekEnd.toISOString());

    // Get journal entries today (matches + training + notes)
    const { count: todayJournalEntries } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString());

    const { count: todayTraining } = await supabase
      .from('training_notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('training_date', todayStr)
      .lt('training_date', new Date(tomorrow).toISOString().split('T')[0]);

    const todayJournalCount = (todayJournalEntries || 0) + (todayTraining || 0);

    // Get week journal entries
    const { count: weekJournalEntries } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', thisWeekStart.toISOString())
      .lt('date', thisWeekEnd.toISOString());

    const { count: weekTraining } = await supabase
      .from('training_notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('training_date', thisWeekStart.toISOString().split('T')[0])
      .lt('training_date', thisWeekEnd.toISOString().split('T')[0]);

    const weekJournalCount = (weekJournalEntries || 0) + (weekTraining || 0);

    // Get current streak from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('journaling_streak, longest_streak')
      .eq('id', userId)
      .single();

    // ==========================================
    // FETCH ACTIVE CHALLENGES
    // ==========================================

    const { data: challenges } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', todayStr);

    if (!challenges || challenges.length === 0) {
      return new Response(JSON.stringify({ challengesUpdated: [], newBadges: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // UPDATE CHALLENGE PROGRESS
    // ==========================================

    const progressUpdates: Array<{
      challengeId: string;
      newProgress: number;
      completed: boolean;
    }> = [];

    for (const challenge of challenges) {
      let progress = 0;
      let targetMet = false;

      switch (challenge.target_type) {
        case 'matches':
          progress = challenge.type === 'daily' ? (todayMatches || 0) : (weekMatches || 0);
          break;
        case 'journaling_days':
        case 'journaling_streak':
          // For streak challenges, check if user has journaled today
          if (eventType === 'journal_entry' || eventType === 'match_logged') {
            progress = (profile?.journaling_streak || 0);
          }
          break;
        case 'notes':
          progress = todayJournalCount;
          break;
        case 'training':
          progress = challenge.type === 'daily' ? (todayTraining || 0) : (weekTraining || 0);
          break;
      }

      targetMet = progress >= challenge.target_value;

      // Check if we have existing progress
      const { data: existingProgress } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .single();

      if (existingProgress) {
        // Update existing progress
        if (progress > existingProgress.progress || (targetMet && !existingProgress.completed)) {
          const { error } = await supabase
            .from('user_challenge_progress')
            .update({
              progress,
              completed: targetMet || existingProgress.completed,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('challenge_id', challenge.id);

          if (!error) {
            progressUpdates.push({
              challengeId: challenge.id,
              newProgress: progress,
              completed: targetMet || existingProgress.completed,
            });
          }
        }
      } else {
        // Create new progress
        const { error } = await supabase
          .from('user_challenge_progress')
          .insert({
            user_id: userId,
            challenge_id: challenge.id,
            progress,
            completed: targetMet,
          });

        if (!error) {
          progressUpdates.push({
            challengeId: challenge.id,
            newProgress: progress,
            completed: targetMet,
          });
        }
      }
    }

    // ==========================================
    // CHECK FOR NEW BADGES
    // ==========================================

    const newBadges: string[] = [];

    // Get all badge definitions
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('criteria_value', { ascending: true });

    if (allBadges && allBadges.length > 0) {
      // Get user's existing badges
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      const existingBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || []);

      // Get user stats for badge checking
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: totalTraining } = await supabase
        .from('training_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: totalWellness } = await supabase
        .from('wellness_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: totalJournalDays } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const totalJournal = (totalMatches || 0) + (totalTraining || 0) + (totalWellness || 0);

      // Check each badge
      for (const badge of allBadges) {
        if (existingBadgeIds.has(badge.id)) continue;

        let earned = false;

        switch (badge.criteria_type) {
          case 'matches':
            earned = (totalMatches || 0) >= badge.criteria_value;
            break;
          case 'streak':
            earned = (profile?.journaling_streak || 0) >= badge.criteria_value;
            break;
          case 'journaling_days':
          case 'journaling_streak':
            earned = (profile?.journaling_streak || 0) >= badge.criteria_value;
            break;
          case 'training':
            earned = (totalTraining || 0) >= badge.criteria_value;
            break;
          case 'wellness':
            earned = (totalWellness || 0) >= badge.criteria_value;
            break;
          case 'consistency':
            // Check weekly consistency (simplified: weeks with 4+ journal days)
            earned = weekJournalCount >= badge.criteria_value;
            break;
        }

        if (earned) {
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id,
            });

          if (!error) {
            newBadges.push(badge.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      challengesUpdated: progressUpdates,
      newBadges,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-challenges:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
