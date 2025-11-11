-- Migration: Add journaling streak tracking to profiles table
-- This migration adds columns to track journaling consistency and streaks

-- Step 1: Add streak tracking columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS journaling_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_journaled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_journal_days INTEGER DEFAULT 0;

-- Step 2: Create index on last_journaled_at for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_journaled_at ON public.profiles(last_journaled_at);

-- Step 3: Create function to calculate journaling dates from all sources
CREATE OR REPLACE FUNCTION public.get_user_journaling_dates(p_user_id UUID)
RETURNS TABLE (journal_date DATE) AS $$
BEGIN
  RETURN QUERY
  -- Get dates from matches
  SELECT DISTINCT DATE(m.date) as journal_date
  FROM public.matches m
  WHERE m.user_id = p_user_id
  
  UNION
  
  -- Get dates from training notes
  SELECT DISTINCT DATE(tn.training_date) as journal_date
  FROM public.training_notes tn
  WHERE tn.user_id = p_user_id
  
  UNION
  
  -- Get dates from player notes (using created_at)
  SELECT DISTINCT DATE(pn.created_at) as journal_date
  FROM public.player_notes pn
  WHERE pn.user_id = p_user_id
  
  ORDER BY journal_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 4: Create function to calculate and update streak
CREATE OR REPLACE FUNCTION public.calculate_journaling_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  total_days INTEGER,
  last_journaled DATE
) AS $$
DECLARE
  v_journal_dates DATE[];
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_prev_date DATE;
  v_current_date DATE;
  v_last_journaled DATE;
  v_total_days INTEGER;
  v_date DATE;
BEGIN
  -- Get all journaling dates for the user
  SELECT ARRAY_AGG(journal_date ORDER BY journal_date DESC)
  INTO v_journal_dates
  FROM public.get_user_journaling_dates(p_user_id);
  
  -- If no journaling dates, return zeros
  IF v_journal_dates IS NULL OR array_length(v_journal_dates, 1) IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, NULL::DATE;
    RETURN;
  END IF;
  
  v_total_days := array_length(v_journal_dates, 1);
  v_last_journaled := v_journal_dates[1];
  
  -- Calculate current streak (consecutive days from today backwards)
  v_current_date := CURRENT_DATE;
  v_temp_streak := 0;
  
  -- Check if user journaled today or yesterday (allow for timezone differences)
  IF v_last_journaled >= v_current_date - INTERVAL '1 day' THEN
    v_temp_streak := 1;
    v_prev_date := v_last_journaled;
    
    -- Count backwards for consecutive days
    FOREACH v_date IN ARRAY v_journal_dates LOOP
      IF v_date = v_prev_date - INTERVAL '1 day' THEN
        v_temp_streak := v_temp_streak + 1;
        v_prev_date := v_date;
      ELSIF v_date < v_prev_date - INTERVAL '1 day' THEN
        EXIT; -- Streak broken
      END IF;
    END LOOP;
  END IF;
  
  v_current_streak := v_temp_streak;
  
  -- Calculate longest streak across all time
  v_temp_streak := 1;
  v_longest_streak := 1;
  v_prev_date := NULL;
  
  FOREACH v_date IN ARRAY (SELECT ARRAY_AGG(journal_date ORDER BY journal_date ASC) FROM unnest(v_journal_dates) AS journal_date) LOOP
    IF v_prev_date IS NOT NULL THEN
      IF v_date = v_prev_date + INTERVAL '1 day' THEN
        v_temp_streak := v_temp_streak + 1;
        IF v_temp_streak > v_longest_streak THEN
          v_longest_streak := v_temp_streak;
        END IF;
      ELSE
        v_temp_streak := 1;
      END IF;
    END IF;
    v_prev_date := v_date;
  END LOOP;
  
  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_total_days, v_last_journaled;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 5: Create function to update user's streak in profile
CREATE OR REPLACE FUNCTION public.update_user_journaling_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_streak_data RECORD;
  v_existing_longest INTEGER;
BEGIN
  -- Calculate streak
  SELECT * INTO v_streak_data
  FROM public.calculate_journaling_streak(p_user_id);
  
  -- Get existing longest streak to preserve it if new calculation is lower
  SELECT longest_streak INTO v_existing_longest
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Update profile with new streak data
  UPDATE public.profiles
  SET 
    journaling_streak = v_streak_data.current_streak,
    longest_streak = GREATEST(COALESCE(v_existing_longest, 0), v_streak_data.longest_streak),
    last_journaled_at = v_streak_data.last_journaled,
    total_journal_days = v_streak_data.total_days
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger function to update streak when journaling activity occurs
CREATE OR REPLACE FUNCTION public.trigger_update_journaling_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Update streak for the user who created/modified the journal entry
  PERFORM public.update_user_journaling_streak(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create triggers on matches, training_notes, and player_notes
DROP TRIGGER IF EXISTS update_streak_on_match ON public.matches;
CREATE TRIGGER update_streak_on_match
  AFTER INSERT OR UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_journaling_streak();

DROP TRIGGER IF EXISTS update_streak_on_training_note ON public.training_notes;
CREATE TRIGGER update_streak_on_training_note
  AFTER INSERT OR UPDATE ON public.training_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_journaling_streak();

DROP TRIGGER IF EXISTS update_streak_on_player_note ON public.player_notes;
CREATE TRIGGER update_streak_on_player_note
  AFTER INSERT OR UPDATE ON public.player_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_journaling_streak();

-- Step 8: Add comment for documentation
COMMENT ON FUNCTION public.get_user_journaling_dates(UUID) IS 'Returns all unique dates when a user has journaled (matches, training notes, or player notes)';
COMMENT ON FUNCTION public.calculate_journaling_streak(UUID) IS 'Calculates current streak, longest streak, total journal days, and last journaled date for a user';
COMMENT ON FUNCTION public.update_user_journaling_streak(UUID) IS 'Updates the user profile with calculated streak data';

