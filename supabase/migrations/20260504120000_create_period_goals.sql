-- Create period_goals table for monthly/quarterly/season goals
CREATE TABLE public.period_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id text REFERENCES public.sports(id),
  title text NOT NULL,
  description text,
  goal_type text NOT NULL CHECK (
    goal_type IN ('win_rate', 'matches_played', 'matches_won', 'matches_logged', 'training_sessions', 'personal_best', 'streak_days')
  ),
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL, -- e.g. 'percent', 'count', 'days', 'seconds'
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'abandoned')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient user + period queries
CREATE INDEX idx_period_goals_user_period ON public.period_goals (user_id, period_start, period_end);
CREATE INDEX idx_period_goals_user_status ON public.period_goals (user_id, status);
CREATE INDEX idx_period_goals_user_sport ON public.period_goals (user_id, sport_id);

-- Enable RLS
ALTER TABLE public.period_goals ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own goals
CREATE POLICY "Users can view their own period goals"
  ON public.period_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own period goals"
  ON public.period_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period goals"
  ON public.period_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period goals"
  ON public.period_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Add period_goals to coach_player_links shared_data enum
ALTER TABLE public.coach_player_links
  ALTER COLUMN shared_data SET DEFAULT '{"matches": false, "training": false, "notes": false, "wellness": false, "goals": false}'::jsonb;
