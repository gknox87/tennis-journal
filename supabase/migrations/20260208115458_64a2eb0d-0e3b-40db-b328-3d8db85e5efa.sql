
-- Create training_sessions table for Session-RPE load monitoring
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sport_id text REFERENCES public.sports(id),
  rpe smallint NOT NULL CHECK (rpe >= 0 AND rpe <= 10),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  training_load integer NOT NULL,
  activity_type text NOT NULL DEFAULT 'other',
  sport_specific text,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  session_start_time timestamptz,
  session_end_time timestamptz,
  rpe_collected_at timestamptz DEFAULT now(),
  planned_duration integer,
  notes text,
  training_note_id uuid REFERENCES public.training_notes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient user + date queries
CREATE INDEX idx_training_sessions_user_date ON public.training_sessions (user_id, session_date);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own sessions
CREATE POLICY "Users can view their own training sessions"
  ON public.training_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training sessions"
  ON public.training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sessions"
  ON public.training_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sessions"
  ON public.training_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Linked coaches can view their players' sessions
CREATE POLICY "Linked coaches can view player training sessions"
  ON public.training_sessions FOR SELECT
  USING (is_linked_coach(auth.uid(), user_id));
