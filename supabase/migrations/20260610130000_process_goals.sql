-- Extend period_goals for process goals and weekly cadence tracking

ALTER TABLE public.period_goals
  DROP CONSTRAINT IF EXISTS period_goals_goal_type_check;

ALTER TABLE public.period_goals
  ADD CONSTRAINT period_goals_goal_type_check CHECK (
    goal_type IN (
      'win_rate',
      'matches_played',
      'matches_won',
      'matches_logged',
      'training_sessions',
      'personal_best',
      'streak_days',
      'wellness_checkins',
      'journaled_sessions',
      'match_reflections',
      'activity_sessions'
    )
  );

ALTER TABLE public.period_goals
  ADD COLUMN IF NOT EXISTS cadence text NOT NULL DEFAULT 'period_total'
    CHECK (cadence IN ('period_total', 'weekly'));

ALTER TABLE public.period_goals
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
