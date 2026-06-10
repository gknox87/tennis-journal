-- Athlete pattern insights (Pro-gated cross-data AI patterns)
CREATE TABLE public.athlete_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id text,
  pattern_key text NOT NULL,
  category text NOT NULL CHECK (category IN ('match', 'wellness', 'reflection')),
  headline text NOT NULL,
  message text NOT NULL,
  action text,
  evidence jsonb,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'positive')),
  is_dismissed boolean NOT NULL DEFAULT false,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (user_id, pattern_key)
);

CREATE INDEX idx_athlete_patterns_user_active
  ON public.athlete_patterns (user_id, is_dismissed, generated_at DESC);

ALTER TABLE public.athlete_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own athlete patterns"
  ON public.athlete_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own athlete patterns"
  ON public.athlete_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own athlete patterns"
  ON public.athlete_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own athlete patterns"
  ON public.athlete_patterns FOR DELETE
  USING (auth.uid() = user_id);
