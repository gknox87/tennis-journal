-- Migration: Fix sports scoring formats that are out of sync with frontend constants
-- Fixes: 100m should use numeric seconds (not mm:ss), 400m same, padel match tiebreak

-- Fix 100m sprint: should be numeric seconds, not mm:ss
UPDATE public.sports
SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
WHERE id = 'running_100m';

-- Fix 400m: should be numeric seconds (45-60s range), not mm:ss
UPDATE public.sports
SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
WHERE id = 'running_400m';

-- Fix padel: add matchTiebreak flag for 10-point 3rd set
UPDATE public.sports
SET scoring_format = '{"type":"sets","maxSets":3,"pointsPerGame":4,"tiebreaks":true,"matchTiebreak":true}'::jsonb
WHERE id = 'padel';

-- Update padel icon from generic shuttlecock to something more padel-specific
UPDATE public.sports
SET icon_url = '🎾'
WHERE id = 'padel';

-- Update pickleball icon from generic to pickleball
UPDATE public.sports
SET icon_url = '🥒'
WHERE id = 'pickleball';
