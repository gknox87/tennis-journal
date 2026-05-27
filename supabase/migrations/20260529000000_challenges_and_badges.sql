-- Challenges and Streaks Engine Migration
-- Creates challenges, user_challenge_progress, badges, and user_badges tables

-- ============================================
-- CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'community')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_type VARCHAR(50) NOT NULL, -- 'matches', 'win_rate', 'journaling_streak', 'training', 'wellness', 'notes'
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 10,
  sport_id VARCHAR(50), -- NULL means all sports
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for challenge queries
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active, start_date, end_date);

-- ============================================
-- USER CHALLENGE PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- Index for user challenge queries
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge ON public.user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON public.user_challenge_progress(user_id, completed);

-- ============================================
-- BADGES TABLE (definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) NOT NULL, -- emoji
  criteria_type VARCHAR(50) NOT NULL, -- 'streak', 'matches', 'win_rate', 'journaling_days', 'training', 'wellness', 'consistency'
  criteria_value INTEGER NOT NULL,
  tier SMALLINT NOT NULL DEFAULT 1 CHECK (tier >= 1 AND tier <= 5),
  tier_label VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  tier_color VARCHAR(7), -- hex color
  category VARCHAR(30) NOT NULL, -- 'streak', 'milestone', 'achievement', 'dedication', 'versatility', 'goals'
  sport_id VARCHAR(50), -- NULL means all sports
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (criteria_type, criteria_value, tier)
);

-- Index for badge queries
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_criteria ON public.badges(criteria_type);

-- ============================================
-- USER BADGES TABLE (earned badges)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- Index for user badge queries
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Challenges: anyone can view active challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

-- User challenge progress: users can view and manage their own
CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Badges: anyone can view all badge definitions
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- User badges: users can view their own
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA: CHALLENGES
-- ============================================

-- Daily Challenges (reset at midnight)
INSERT INTO public.challenges (type, title, description, target_type, target_value, reward_points, sport_id, start_date, is_active) VALUES
  ('daily', 'Daily Journaler', 'Log any journal entry today', 'journaling_days', 1, 10, NULL, CURRENT_DATE, true),
  ('daily', 'Match Maker', 'Log a match today', 'matches', 1, 15, NULL, CURRENT_DATE, true),
  ('daily', 'Surface Explorer', 'Play on a different surface than usual', 'surface_variety', 1, 20, NULL, CURRENT_DATE, true),
  ('daily', 'Reflection Time', 'Complete reflection prompts for a match', 'notes', 1, 10, NULL, CURRENT_DATE, true),
  ('daily', 'Training Day', 'Log a training session', 'training', 1, 15, NULL, CURRENT_DATE, true)
ON CONFLICT DO NOTHING;

-- Weekly Challenges (reset Monday)
INSERT INTO public.challenges (type, title, description, target_type, target_value, reward_points, sport_id, start_date, end_date, is_active) VALUES
  ('weekly', 'Weekly Warrior', 'Log journal entries 5 days this week', 'journaling_days', 5, 50, NULL, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
  ('weekly', 'Match Master', 'Log 3 matches this week', 'matches', 3, 45, NULL, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
  ('weekly', 'Streak Builder', 'Maintain a 7-day journaling streak', 'journaling_streak', 7, 100, NULL, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true)
ON CONFLICT DO NOTHING;

-- Community Challenges (shared with other users)
INSERT INTO public.challenges (type, title, description, target_type, target_value, reward_points, sport_id, start_date, is_active) VALUES
  ('community', 'Community Goal', 'Log 100 total matches as a community this month', 'matches', 100, 200, NULL, CURRENT_DATE, true),
  ('community', 'Streak Together', 'Combined community journaling streak reaches 1000 days', 'journaling_streak', 1000, 300, NULL, CURRENT_DATE, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: BADGES
-- ============================================

-- Streak Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Consistent', 'Journaling Streak', '🔥', 'streak', 7, 1, 'bronze', '#cd7f32', 'streak'),
  ('Consistent', 'Journaling Streak', '🔥', 'streak', 30, 2, 'silver', '#a8a8a8', 'streak'),
  ('Consistent', 'Journaling Streak', '🔥', 'streak', 90, 3, 'gold', '#d4af37', 'streak'),
  ('Consistent', 'Journaling Streak', '🔥', 'streak', 180, 4, 'platinum', '#e5e4e2', 'streak'),
  ('Consistent', 'Journaling Streak', '🔥', 'streak', 365, 5, 'diamond', '#b9f2ff', 'streak')
ON CONFLICT DO NOTHING;

-- Match Milestone Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Match Logger', 'Log Matches', '📝', 'matches', 5, 1, 'bronze', '#cd7f32', 'milestone'),
  ('Match Logger', 'Log Matches', '📝', 'matches', 25, 2, 'silver', '#a8a8a8', 'milestone'),
  ('Match Logger', 'Log Matches', '📝', 'matches', 50, 3, 'gold', '#d4af37', 'milestone'),
  ('Match Logger', 'Log Matches', '📝', 'matches', 100, 4, 'platinum', '#e5e4e2', 'milestone'),
  ('Match Logger', 'Log Matches', '📝', 'matches', 250, 5, 'diamond', '#b9f2ff', 'milestone')
ON CONFLICT DO NOTHING;

-- Win Rate Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Elite Performance', 'High Win Rate', '📈', 'win_rate', 50, 1, 'bronze', '#cd7f32', 'achievement'),
  ('Elite Performance', 'High Win Rate', '📈', 'win_rate', 60, 2, 'silver', '#a8a8a8', 'achievement'),
  ('Elite Performance', 'High Win Rate', '📈', 'win_rate', 70, 3, 'gold', '#d4af37', 'achievement'),
  ('Elite Performance', 'High Win Rate', '📈', 'win_rate', 80, 4, 'platinum', '#e5e4e2', 'achievement'),
  ('Elite Performance', 'High Win Rate', '📈', 'win_rate', 90, 5, 'diamond', '#b9f2ff', 'achievement')
ON CONFLICT DO NOTHING;

-- Surface Master Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Surface Master', 'Court Versatility', '🗺️', 'surface_variety', 2, 1, 'bronze', '#cd7f32', 'versatility'),
  ('Surface Master', 'Court Versatility', '🗺️', 'surface_variety', 3, 2, 'silver', '#a8a8a8', 'versatility'),
  ('Surface Master', 'Court Versatility', '🗺️', 'surface_variety', 4, 3, 'gold', '#d4af37', 'versatility')
ON CONFLICT DO NOTHING;

-- Training Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Training Beast', 'Log Training Sessions', '💪', 'training', 10, 1, 'bronze', '#cd7f32', 'dedication'),
  ('Training Beast', 'Log Training Sessions', '💪', 'training', 50, 2, 'silver', '#a8a8a8', 'dedication'),
  ('Training Beast', 'Log Training Sessions', '💪', 'training', 100, 3, 'gold', '#d4af37', 'dedication'),
  ('Training Beast', 'Log Training Sessions', '💪', 'training', 250, 4, 'platinum', '#e5e4e2', 'dedication')
ON CONFLICT DO NOTHING;

-- Wellness Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Wellness Champion', 'Wellness Check-ins', '❤️', 'wellness', 7, 1, 'bronze', '#cd7f32', 'dedication'),
  ('Wellness Champion', 'Wellness Check-ins', '❤️', 'wellness', 30, 2, 'silver', '#a8a8a8', 'dedication'),
  ('Wellness Champion', 'Wellness Check-ins', '❤️', 'wellness', 90, 3, 'gold', '#d4af37', 'dedication'),
  ('Wellness Champion', 'Wellness Check-ins', '❤️', 'wellness', 180, 4, 'platinum', '#e5e4e2', 'dedication')
ON CONFLICT DO NOTHING;

-- Consistency Badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Streak Keeper', 'Weekly Consistency', '📅', 'consistency', 4, 1, 'bronze', '#cd7f32', 'streak'),
  ('Streak Keeper', 'Weekly Consistency', '📅', 'consistency', 12, 2, 'silver', '#a8a8a8', 'streak'),
  ('Streak Keeper', 'Weekly Consistency', '📅', 'consistency', 26, 3, 'gold', '#d4af37', 'streak'),
  ('Streak Keeper', 'Weekly Consistency', '📅', 'consistency', 52, 4, 'platinum', '#e5e4e2', 'streak')
ON CONFLICT DO NOTHING;

-- Century Club Badge
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value, tier, tier_label, tier_color, category) VALUES
  ('Century Club', 'Total Journal Entries', '💯', 'journaling_days', 100, 1, 'gold', '#d4af37', 'milestone'),
  ('Century Club', 'Total Journal Entries', '💯', 'journaling_days', 500, 2, 'diamond', '#b9f2ff', 'milestone')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.challenges IS 'Challenge definitions for daily, weekly, and community challenges';
COMMENT ON TABLE public.user_challenge_progress IS 'Tracks user progress on challenges';
COMMENT ON TABLE public.badges IS 'Badge definitions with tier and criteria';
COMMENT ON TABLE public.user_badges IS 'Earned badges by users';
