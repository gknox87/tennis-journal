-- Migration: Create coaches table for storing coach names per user
-- This allows users to save coach names and autocomplete them when creating training notes

-- Create coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport_id TEXT REFERENCES public.sports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure each user can't have duplicate coach names (case-insensitive)
  UNIQUE(user_id, LOWER(TRIM(name)))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_sport_id ON public.coaches(sport_id);
CREATE INDEX IF NOT EXISTS idx_coaches_name ON public.coaches(name);

-- Enable RLS
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own coaches
CREATE POLICY "Users can view their own coaches"
  ON public.coaches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own coaches
CREATE POLICY "Users can insert their own coaches"
  ON public.coaches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own coaches
CREATE POLICY "Users can update their own coaches"
  ON public.coaches
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own coaches
CREATE POLICY "Users can delete their own coaches"
  ON public.coaches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coaches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on coach updates
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION update_coaches_updated_at();

-- Function to get or create a coach (similar to get_or_create_opponent)
CREATE OR REPLACE FUNCTION get_or_create_coach(
  p_name TEXT,
  p_user_id UUID,
  p_sport_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_coach_id UUID;
BEGIN
  -- Try to find existing coach (case-insensitive)
  SELECT id INTO v_coach_id
  FROM public.coaches
  WHERE user_id = p_user_id
    AND LOWER(TRIM(name)) = LOWER(TRIM(p_name))
  LIMIT 1;

  -- If coach doesn't exist, create it
  IF v_coach_id IS NULL THEN
    INSERT INTO public.coaches (user_id, name, sport_id)
    VALUES (p_user_id, TRIM(p_name), p_sport_id)
    ON CONFLICT (user_id, LOWER(TRIM(name))) DO NOTHING
    RETURNING id INTO v_coach_id;
    
    -- If insert was skipped due to conflict, fetch the existing ID
    IF v_coach_id IS NULL THEN
      SELECT id INTO v_coach_id
      FROM public.coaches
      WHERE user_id = p_user_id
        AND LOWER(TRIM(name)) = LOWER(TRIM(p_name))
      LIMIT 1;
    END IF;
  END IF;

  RETURN v_coach_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill coaches from existing training_notes
-- This will extract unique coach names from training_notes and create coach records
INSERT INTO public.coaches (user_id, name, sport_id, created_at)
SELECT DISTINCT
  tn.user_id,
  tn.coach_name,
  tn.sport_id,
  MIN(tn.created_at) as created_at
FROM public.training_notes tn
WHERE tn.coach_name IS NOT NULL
  AND TRIM(tn.coach_name) != ''
  AND tn.user_id IS NOT NULL
GROUP BY tn.user_id, tn.coach_name, tn.sport_id
ON CONFLICT (user_id, LOWER(TRIM(name))) DO NOTHING;

