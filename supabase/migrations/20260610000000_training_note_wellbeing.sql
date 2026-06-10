ALTER TABLE public.training_notes
  ADD COLUMN IF NOT EXISTS session_feel smallint
    CHECK (session_feel IS NULL OR (session_feel >= 1 AND session_feel <= 5)),
  ADD COLUMN IF NOT EXISTS enjoyment smallint
    CHECK (enjoyment IS NULL OR (enjoyment >= 1 AND enjoyment <= 5));
