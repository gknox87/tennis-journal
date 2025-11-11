-- Migration: Add reflection prompts support
-- This migration adds columns to support structured reflection prompts for match journaling

-- Step 1: Add journaling_preferences JSONB column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS journaling_preferences JSONB DEFAULT '{}'::jsonb;

-- Step 2: Add reflection prompt metadata columns to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS reflection_prompt_used TEXT,
ADD COLUMN IF NOT EXISTS reflection_prompt_level TEXT;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.profiles.journaling_preferences IS 'User preferences for journaling features, including prompt_level (quick/standard/deep)';
COMMENT ON COLUMN public.matches.reflection_prompt_used IS 'Identifier for which prompt set was used (e.g., post_match_win_standard)';
COMMENT ON COLUMN public.matches.reflection_prompt_level IS 'The prompt level used: quick, standard, or deep';

