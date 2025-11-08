-- Migration: Fix Sprint Scoring Formats
-- This fixes the incorrect time format for 100m and 400m sprints
-- These events should use seconds with decimals, not mm:ss format

-- Fix 100m Sprint scoring (should be seconds, not minutes)
-- World record: 9.58s, typical times: 10-12s
UPDATE public.sports
SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
WHERE id = 'running_100m';

-- Fix 400m scoring (should be seconds, not minutes)
-- World record: 43.03s, typical times: 45-55s
UPDATE public.sports
SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
WHERE id = 'running_400m';

-- Verify the changes
DO $$
DECLARE
  sprint_100m_format jsonb;
  sprint_400m_format jsonb;
BEGIN
  SELECT scoring_format INTO sprint_100m_format FROM public.sports WHERE id = 'running_100m';
  SELECT scoring_format INTO sprint_400m_format FROM public.sports WHERE id = 'running_400m';

  IF sprint_100m_format->>'type' != 'numeric' THEN
    RAISE EXCEPTION '100m sprint scoring format not updated correctly';
  END IF;

  IF sprint_400m_format->>'type' != 'numeric' THEN
    RAISE EXCEPTION '400m scoring format not updated correctly';
  END IF;

  RAISE NOTICE 'Sprint scoring formats updated successfully';
  RAISE NOTICE '100m format: %', sprint_100m_format;
  RAISE NOTICE '400m format: %', sprint_400m_format;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.sports.scoring_format IS 'JSONB field containing scoring format configuration. For sprints under 60 seconds, use numeric type with seconds unit rather than time format.';
