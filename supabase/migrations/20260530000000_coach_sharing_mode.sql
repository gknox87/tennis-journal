-- Migration: Create drills table for pre-built drill library
CREATE TABLE IF NOT EXISTS public.drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drills_sport_id ON public.drills(sport_id);
CREATE INDEX IF NOT EXISTS idx_drills_category ON public.drills(category);
CREATE INDEX IF NOT EXISTS idx_drills_difficulty ON public.drills(difficulty);

-- Enable RLS
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

-- RLS Policies - drills are viewable by all authenticated users
-- Coaches can manage their own drill prescriptions (separate table)
CREATE POLICY "Authenticated users can view drills"
  ON public.drills
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Migration: Create coach_drill_prescriptions table
CREATE TABLE IF NOT EXISTS public.coach_drill_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  drill_id UUID NOT NULL REFERENCES public.drills(id) ON DELETE RESTRICT,
  notes TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cdp_coach_id ON public.coach_drill_prescriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_cdp_player_id ON public.coach_drill_prescriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_cdp_match_id ON public.coach_drill_prescriptions(match_id);
CREATE INDEX IF NOT EXISTS idx_cdp_drill_id ON public.coach_drill_prescriptions(drill_id);
CREATE INDEX IF NOT EXISTS idx_cdp_completed ON public.coach_drill_prescriptions(completed);

-- Enable RLS
ALTER TABLE public.coach_drill_prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Coaches can view/manage their own prescriptions
CREATE POLICY "Coaches can view their own prescriptions"
  ON public.coach_drill_prescriptions
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert prescriptions"
  ON public.coach_drill_prescriptions
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own prescriptions"
  ON public.coach_drill_prescriptions
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own prescriptions"
  ON public.coach_drill_prescriptions
  FOR DELETE
  USING (auth.uid() = coach_id);

-- Players can view their own prescriptions
CREATE POLICY "Players can view their own prescriptions"
  ON public.coach_drill_prescriptions
  FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Players can update their own prescriptions"
  ON public.coach_drill_prescriptions
  FOR UPDATE
  USING (auth.uid() = player_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_cdp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cdp_updated_at
  BEFORE UPDATE ON public.coach_drill_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_cdp_updated_at();

-- Migration: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('drill_prescription', 'coach_note', 'match_shared', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND OLD.read = FALSE THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_notification_read
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_read();
