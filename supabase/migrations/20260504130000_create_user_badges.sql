-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  tier smallint NOT NULL DEFAULT 1 CHECK (tier >= 1 AND tier <= 5),
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id, tier)
);

-- Index for efficient user badge queries
CREATE INDEX idx_user_badges_user ON public.user_badges (user_id);
CREATE INDEX idx_user_badges_badge ON public.user_badges (user_id, badge_id);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own badges (earned by the app logic)
CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own badges (reset)
CREATE POLICY "Users can delete their own badges"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);
