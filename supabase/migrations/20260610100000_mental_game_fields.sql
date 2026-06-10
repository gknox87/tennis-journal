-- Mental game fields: pre-match state, emotion tags, IZOF analytics support

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS pre_nerves smallint
    CHECK (pre_nerves IS NULL OR (pre_nerves >= 1 AND pre_nerves <= 10)),
  ADD COLUMN IF NOT EXISTS pre_confidence smallint
    CHECK (pre_confidence IS NULL OR (pre_confidence >= 1 AND pre_confidence <= 10)),
  ADD COLUMN IF NOT EXISTS pre_arousal smallint
    CHECK (pre_arousal IS NULL OR (pre_arousal >= 1 AND pre_arousal <= 10)),
  ADD COLUMN IF NOT EXISTS process_goal text,
  ADD COLUMN IF NOT EXISTS pre_emotion_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS post_emotion_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scheduled_event_id uuid REFERENCES public.scheduled_events(id) ON DELETE SET NULL;

ALTER TABLE public.scheduled_events
  ADD COLUMN IF NOT EXISTS pre_match_state jsonb;

ALTER TABLE public.training_notes
  ADD COLUMN IF NOT EXISTS emotion_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_arousal smallint
    CHECK (session_arousal IS NULL OR (session_arousal >= 1 AND session_arousal <= 10));
