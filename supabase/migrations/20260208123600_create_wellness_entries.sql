
-- Create wellness_entries table for daily Hooper Index wellness check-ins
CREATE TABLE public.wellness_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sport_id text REFERENCES public.sports(id),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality smallint NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_duration_hours numeric(3,1),
  fatigue smallint NOT NULL CHECK (fatigue >= 1 AND fatigue <= 5),
  muscle_soreness smallint NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 5),
  stress_level smallint NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
  mood smallint NOT NULL CHECK (mood >= 1 AND mood <= 5),
  total_wellness_score smallint NOT NULL,
  motivation smallint CHECK (motivation >= 1 AND motivation <= 5),
  energy smallint CHECK (energy >= 1 AND energy <= 5),
  appetite smallint CHECK (appetite >= 1 AND appetite <= 5),
  notes text,
  menstrual_cycle_day smallint CHECK (menstrual_cycle_day >= 1 AND menstrual_cycle_day <= 60),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_entry_date UNIQUE (user_id, entry_date)
);

-- Index for efficient user + date queries
CREATE INDEX idx_wellness_entries_user_date ON public.wellness_entries (user_id, entry_date);

-- Enable RLS
ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own entries
CREATE POLICY "Users can view their own wellness entries"
  ON public.wellness_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness entries"
  ON public.wellness_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness entries"
  ON public.wellness_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness entries"
  ON public.wellness_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Linked coaches can view player wellness ONLY if player has shared wellness data
CREATE POLICY "Linked coaches can view player wellness entries"
  ON public.wellness_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_player_links cpl
      WHERE cpl.coach_id = auth.uid()
        AND cpl.player_id = wellness_entries.user_id
        AND cpl.status = 'approved'
        AND (cpl.shared_data->>'wellness')::boolean = true
    )
  );

-- Guardians can view their player's wellness entries
CREATE POLICY "Guardians can view player wellness entries"
  ON public.wellness_entries FOR SELECT
  USING (is_guardian_of(auth.uid(), user_id));

-- Add show_menstrual_tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_menstrual_tracking boolean DEFAULT false;

-- Update coach_player_links default shared_data to include wellness key
ALTER TABLE public.coach_player_links
  ALTER COLUMN shared_data SET DEFAULT '{"matches": false, "training": false, "notes": false, "wellness": false}'::jsonb;
