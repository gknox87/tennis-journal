
-- Create enums for injury tracking
CREATE TYPE public.body_region AS ENUM (
  'head_neck',
  'shoulder_arm',
  'elbow_forearm',
  'wrist_hand',
  'chest_upper_back',
  'lower_back',
  'hip_groin',
  'thigh',
  'knee',
  'lower_leg',
  'ankle_foot'
);

CREATE TYPE public.pain_type AS ENUM (
  'sharp',
  'dull',
  'aching',
  'burning',
  'stabbing',
  'throbbing',
  'tingling',
  'stiffness'
);

CREATE TYPE public.onset_type AS ENUM (
  'sudden',
  'gradual',
  'unknown'
);

CREATE TYPE public.impact_level AS ENUM (
  'none',
  'minor',
  'moderate',
  'severe',
  'unable'
);

CREATE TYPE public.injury_trend AS ENUM (
  'improving',
  'stable',
  'worsening',
  'new'
);

-- Create injury_reports table
CREATE TABLE public.injury_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sport_id text REFERENCES public.sports(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Location
  body_region body_region NOT NULL,
  body_part text NOT NULL,
  coordinates jsonb,

  -- Severity
  pain_level smallint NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  impact_on_training impact_level NOT NULL DEFAULT 'none',

  -- Characterization
  pain_types text[] NOT NULL DEFAULT '{}',
  onset_type onset_type NOT NULL DEFAULT 'unknown',
  duration text NOT NULL DEFAULT 'acute',

  -- Trend tracking
  trend injury_trend NOT NULL DEFAULT 'new',
  previous_report_id uuid REFERENCES public.injury_reports(id) ON DELETE SET NULL,

  -- Actions
  treatment_notes text,
  sought_medical_attention boolean NOT NULL DEFAULT false,
  restricted_from_training boolean NOT NULL DEFAULT false,

  -- Attachments
  photo_urls text[] DEFAULT '{}',

  -- Coach visibility
  shared_with_coach boolean NOT NULL DEFAULT false,
  coach_notified boolean NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX idx_injury_reports_user_date ON public.injury_reports (user_id, created_at DESC);
CREATE INDEX idx_injury_reports_user_region ON public.injury_reports (user_id, body_region);

-- Enable RLS
ALTER TABLE public.injury_reports ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own reports
CREATE POLICY "Users can view their own injury reports"
  ON public.injury_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own injury reports"
  ON public.injury_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own injury reports"
  ON public.injury_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own injury reports"
  ON public.injury_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Linked coaches can view player injury reports when shared
CREATE POLICY "Linked coaches can view shared injury reports"
  ON public.injury_reports FOR SELECT
  USING (
    shared_with_coach = true
    AND is_linked_coach(auth.uid(), user_id)
  );

-- Guardians can view their player's injury reports
CREATE POLICY "Guardians can view player injury reports"
  ON public.injury_reports FOR SELECT
  USING (is_guardian_of(auth.uid(), user_id));

-- Updated_at trigger
CREATE TRIGGER update_injury_reports_updated_at
  BEFORE UPDATE ON public.injury_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
