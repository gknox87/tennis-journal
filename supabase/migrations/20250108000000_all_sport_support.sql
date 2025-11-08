-- Migration: Add comprehensive all-sport support
-- This migration extends the sports table with metadata fields and seeds the catalogue

-- Step 1: Add new columns to sports table
ALTER TABLE public.sports
ADD COLUMN IF NOT EXISTS is_individual BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS primary_colour TEXT DEFAULT '#1464c2',
ADD COLUMN IF NOT EXISTS accent_colour TEXT DEFAULT '#ffd447',
ADD COLUMN IF NOT EXISTS terminology JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_context JSONB DEFAULT '{}';

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sports_category ON public.sports(category);
CREATE INDEX IF NOT EXISTS idx_sports_published ON public.sports(is_published);
CREATE INDEX IF NOT EXISTS idx_sports_popularity ON public.sports(popularity DESC);

-- Step 3: Create view for published sports grouped by category
CREATE OR REPLACE VIEW public.sports_catalogue AS
SELECT
  id,
  name,
  short_name,
  slug,
  category,
  subcategory,
  is_individual,
  popularity,
  scoring_format,
  icon_url,
  primary_colour,
  accent_colour,
  terminology,
  ai_context
FROM public.sports
WHERE is_published = true
ORDER BY popularity DESC, name ASC;

-- Step 4: Create RPC function to get sports by category
CREATE OR REPLACE FUNCTION public.get_sports_by_category(p_category TEXT DEFAULT NULL)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  short_name TEXT,
  slug TEXT,
  category TEXT,
  subcategory TEXT,
  is_individual BOOLEAN,
  popularity INTEGER,
  scoring_format JSONB,
  icon_url TEXT,
  primary_colour TEXT,
  accent_colour TEXT,
  terminology JSONB,
  ai_context JSONB
) AS $$
BEGIN
  IF p_category IS NULL THEN
    RETURN QUERY
    SELECT
      s.id, s.name, s.short_name, s.slug, s.category, s.subcategory,
      s.is_individual, s.popularity, s.scoring_format, s.icon_url,
      s.primary_colour, s.accent_colour, s.terminology, s.ai_context
    FROM public.sports s
    WHERE s.is_published = true
    ORDER BY s.popularity DESC, s.name ASC;
  ELSE
    RETURN QUERY
    SELECT
      s.id, s.name, s.short_name, s.slug, s.category, s.subcategory,
      s.is_individual, s.popularity, s.scoring_format, s.icon_url,
      s.primary_colour, s.accent_colour, s.terminology, s.ai_context
    FROM public.sports s
    WHERE s.is_published = true AND s.category = p_category
    ORDER BY s.popularity DESC, s.name ASC;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 5: Create RPC function to get popular sports
CREATE OR REPLACE FUNCTION public.get_popular_sports(p_limit INTEGER DEFAULT 8)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  short_name TEXT,
  slug TEXT,
  category TEXT,
  icon_url TEXT,
  primary_colour TEXT,
  accent_colour TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.name, s.short_name, s.slug, s.category,
    s.icon_url, s.primary_colour, s.accent_colour
  FROM public.sports s
  WHERE s.is_published = true
  ORDER BY s.popularity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 6: Seed sports catalogue with comprehensive data
-- First, truncate existing sports if any
TRUNCATE TABLE public.sports RESTART IDENTITY CASCADE;

-- Racket Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('tennis', 'Tennis', 'Tennis', 'tennis', 'racket', true, true, 100,
 '{"type":"sets","maxSets":3,"pointsPerGame":4,"tiebreaks":true}'::jsonb,
 '🎾', '#1464c2', '#ffd447',
 '{"matchLabel":"Match","opponentLabel":"Opponent","trainingLabel":"Practice Session","highlightLabel":"Key Point"}'::jsonb,
 '{"stylePrompt":"high-performance tennis","focusAreas":["serve consistency","return depth","baseline aggression"]}'::jsonb),

('table_tennis', 'Table Tennis', 'Table Tennis', 'table-tennis', 'racket', true, true, 90,
 '{"type":"rally","pointsToWin":11,"winBy":2}'::jsonb,
 '🏓', '#ef5b00', '#252850',
 '{"matchLabel":"Match","opponentLabel":"Opponent","trainingLabel":"Drill Session","highlightLabel":"Rally Highlight"}'::jsonb,
 '{"stylePrompt":"elite table tennis","focusAreas":["serve variation","third-ball attack","footwork timing"]}'::jsonb),

('badminton', 'Badminton', 'Badminton', 'badminton', 'racket', true, true, 95,
 '{"type":"rally","pointsToWin":21,"winBy":2}'::jsonb,
 '🏸', '#00a896', '#028090',
 '{"matchLabel":"Match","opponentLabel":"Opponent","trainingLabel":"Training","highlightLabel":"Rally Insight"}'::jsonb,
 '{"stylePrompt":"elite badminton","focusAreas":["net play","rear-court clears","smash recovery"]}'::jsonb),

('padel', 'Padel', 'Padel', 'padel', 'racket', false, true, 85,
 '{"type":"sets","maxSets":3,"pointsPerGame":4,"tiebreaks":true}'::jsonb,
 '🏸', '#0a2239', '#f6c90e',
 '{"matchLabel":"Match","opponentLabel":"Opposing Pair","trainingLabel":"Practice","highlightLabel":"Winning Pattern"}'::jsonb,
 '{"stylePrompt":"professional padel","focusAreas":["net pressure","lob defence","court positioning"]}'::jsonb),

('pickleball', 'Pickleball', 'Pickleball', 'pickleball', 'racket', true, true, 80,
 '{"type":"rally","pointsToWin":11,"winBy":2}'::jsonb,
 '🥒', '#62a60a', '#f3f315',
 '{"matchLabel":"Game","opponentLabel":"Opposing Team","trainingLabel":"Drill","highlightLabel":"Key Rally"}'::jsonb,
 '{"stylePrompt":"competitive pickleball","focusAreas":["dink control","third-shot drop","transition positioning"]}'::jsonb),

('squash', 'Squash', 'Squash', 'squash', 'racket', true, true, 75,
 '{"type":"rally","pointsToWin":11,"winBy":2}'::jsonb,
 '⚫️', '#4b1d3f', '#f0a6ca',
 '{"matchLabel":"Match","opponentLabel":"Opponent","trainingLabel":"Session","highlightLabel":"Pressure Moment"}'::jsonb,
 '{"stylePrompt":"professional squash","focusAreas":["T-position control","length accuracy","pressure building"]}'::jsonb);

-- Athletics Sports
INSERT INTO public.sports (id, name, short_name, slug, category, subcategory, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('running_100m', '100m Sprint', '100m', '100m-sprint', 'athletics', 'sprint', true, true, 70,
 '{"type":"time","format":"mm:ss","lowerIsBetter":true}'::jsonb,
 '🏃', '#e63946', '#f1faee',
 '{"matchLabel":"Race","opponentLabel":"Competitor","trainingLabel":"Training Run","highlightLabel":"Split Time"}'::jsonb,
 '{"stylePrompt":"elite sprinting","focusAreas":["explosive start","drive phase","top-end speed"]}'::jsonb),

('running_400m', '400m', '400m', '400m', 'athletics', 'sprint', true, true, 65,
 '{"type":"time","format":"mm:ss","lowerIsBetter":true}'::jsonb,
 '🏃', '#e63946', '#f1faee',
 '{"matchLabel":"Race","opponentLabel":"Competitor","trainingLabel":"Speed Endurance","highlightLabel":"Split Time"}'::jsonb,
 '{"stylePrompt":"quarter-mile racing","focusAreas":["pace distribution","lactate tolerance","finishing speed"]}'::jsonb),

('running_5k', '5K Running', '5K', '5k-running', 'athletics', 'distance', true, true, 85,
 '{"type":"time","format":"hh:mm:ss","lowerIsBetter":true}'::jsonb,
 '🏃‍♂️', '#457b9d', '#a8dadc',
 '{"matchLabel":"Race","opponentLabel":"Runner","trainingLabel":"Distance Run","highlightLabel":"Kilometer Split"}'::jsonb,
 '{"stylePrompt":"competitive 5K racing","focusAreas":["pacing strategy","aerobic capacity","kick finish"]}'::jsonb);

-- Endurance Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('running_marathon', 'Marathon', 'Marathon', 'marathon', 'endurance', true, true, 80,
 '{"type":"time","format":"hh:mm:ss","lowerIsBetter":true}'::jsonb,
 '🏃‍♀️', '#1d3557', '#f1faee',
 '{"matchLabel":"Race","opponentLabel":"Runner","trainingLabel":"Long Run","highlightLabel":"Mile Split"}'::jsonb,
 '{"stylePrompt":"marathon endurance","focusAreas":["negative splits","fueling strategy","mental toughness"]}'::jsonb);

-- Aquatic Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('swimming_freestyle', 'Freestyle Swimming', 'Freestyle', 'swimming-freestyle', 'aquatic', true, true, 75,
 '{"type":"time","format":"mm:ss","lowerIsBetter":true}'::jsonb,
 '🏊', '#0077b6', '#00b4d8',
 '{"matchLabel":"Race","opponentLabel":"Swimmer","trainingLabel":"Swim Session","highlightLabel":"Lap Split"}'::jsonb,
 '{"stylePrompt":"competitive swimming","focusAreas":["stroke efficiency","turn technique","underwater phase"]}'::jsonb);

-- Combat Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('boxing', 'Boxing', 'Boxing', 'boxing', 'combat', true, true, 85,
 '{"type":"rounds","totalRounds":12,"scoringMethod":"knockout"}'::jsonb,
 '🥊', '#d00000', '#ffba08',
 '{"matchLabel":"Bout","opponentLabel":"Opponent","trainingLabel":"Sparring","highlightLabel":"Key Exchange"}'::jsonb,
 '{"stylePrompt":"professional boxing","focusAreas":["ring generalship","combination punching","defensive positioning"]}'::jsonb),

('mma', 'Mixed Martial Arts', 'MMA', 'mma', 'combat', true, true, 90,
 '{"type":"rounds","totalRounds":3,"scoringMethod":"points"}'::jsonb,
 '🥋', '#370617', '#dc2f02',
 '{"matchLabel":"Fight","opponentLabel":"Opponent","trainingLabel":"Training Session","highlightLabel":"Key Moment"}'::jsonb,
 '{"stylePrompt":"mixed martial arts","focusAreas":["striking defense","takedown accuracy","ground control"]}'::jsonb),

('judo', 'Judo', 'Judo', 'judo', 'combat', true, true, 70,
 '{"type":"numeric","unit":"points","higherIsBetter":true,"decimals":2}'::jsonb,
 '🥋', '#004e89', '#ff6b35',
 '{"matchLabel":"Match","opponentLabel":"Opponent","trainingLabel":"Randori","highlightLabel":"Technique"}'::jsonb,
 '{"stylePrompt":"competitive judo","focusAreas":["gripping strategy","throw timing","groundwork transitions"]}'::jsonb);

-- Cycling Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('cycling_road', 'Road Cycling', 'Road Cycling', 'road-cycling', 'cycling', true, true, 75,
 '{"type":"time","format":"hh:mm:ss","lowerIsBetter":true}'::jsonb,
 '🚴', '#2d6a4f', '#95d5b2',
 '{"matchLabel":"Race","opponentLabel":"Rider","trainingLabel":"Training Ride","highlightLabel":"Segment"}'::jsonb,
 '{"stylePrompt":"competitive cycling","focusAreas":["power output","drafting technique","climb pacing"]}'::jsonb);

-- Gymnastics Sports
INSERT INTO public.sports (id, name, short_name, slug, category, is_individual, is_published, popularity, scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context) VALUES
('gymnastics_artistic', 'Artistic Gymnastics', 'Gymnastics', 'artistic-gymnastics', 'gymnastics', true, true, 70,
 '{"type":"numeric","unit":"points","higherIsBetter":true,"decimals":2}'::jsonb,
 '🤸', '#6a4c93', '#f72585',
 '{"matchLabel":"Competition","opponentLabel":"Gymnast","trainingLabel":"Practice","highlightLabel":"Routine Element"}'::jsonb,
 '{"stylePrompt":"elite gymnastics","focusAreas":["execution score","difficulty value","landing precision"]}'::jsonb);

-- Step 7: Grant necessary permissions
GRANT SELECT ON public.sports_catalogue TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_sports_by_category(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_popular_sports(INTEGER) TO authenticated, anon;

-- Step 8: Add comment for documentation
COMMENT ON VIEW public.sports_catalogue IS 'Public view of all published sports, ordered by popularity';
COMMENT ON FUNCTION public.get_sports_by_category(TEXT) IS 'Returns sports filtered by category, or all sports if category is NULL';
COMMENT ON FUNCTION public.get_popular_sports(INTEGER) IS 'Returns the most popular sports limited by the provided count';
