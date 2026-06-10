-- Wellness six-construct scoring migration
-- Promotes motivation and performance_confidence to core scored fields (/30)
-- Demotes muscle_soreness to optional supplementary field

-- Add performance_confidence column
ALTER TABLE public.wellness_entries
  ADD COLUMN IF NOT EXISTS performance_confidence smallint
    CHECK (performance_confidence >= 1 AND performance_confidence <= 5);

-- Backfill motivation and performance_confidence for existing rows
UPDATE public.wellness_entries
SET
  motivation = COALESCE(motivation, 3),
  performance_confidence = COALESCE(performance_confidence, 3);

-- Recalculate total_wellness_score using 6 core fields (exclude muscle_soreness)
UPDATE public.wellness_entries
SET total_wellness_score =
  sleep_quality + fatigue + stress_level + mood + motivation + performance_confidence;

-- Demote muscle_soreness to optional
ALTER TABLE public.wellness_entries
  ALTER COLUMN muscle_soreness DROP NOT NULL;

-- Promote motivation and performance_confidence to required
ALTER TABLE public.wellness_entries
  ALTER COLUMN motivation SET NOT NULL;

ALTER TABLE public.wellness_entries
  ALTER COLUMN performance_confidence SET NOT NULL;
