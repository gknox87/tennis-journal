
-- Rehab psychology check-ins linked to injury reports
CREATE TABLE public.injury_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  injury_report_id uuid NOT NULL REFERENCES public.injury_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  pain_level smallint CHECK (pain_level >= 0 AND pain_level <= 10),
  rehab_mood smallint NOT NULL CHECK (rehab_mood >= 1 AND rehab_mood <= 5),
  rtp_confidence smallint NOT NULL CHECK (rtp_confidence >= 1 AND rtp_confidence <= 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (injury_report_id, check_in_date)
);

CREATE INDEX idx_injury_check_ins_user_date ON public.injury_check_ins (user_id, check_in_date DESC);
CREATE INDEX idx_injury_check_ins_injury ON public.injury_check_ins (injury_report_id, check_in_date DESC);

ALTER TABLE public.injury_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own injury check-ins"
  ON public.injury_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own injury check-ins"
  ON public.injury_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own injury check-ins"
  ON public.injury_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own injury check-ins"
  ON public.injury_check_ins FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Linked coaches can view shared injury check-ins"
  ON public.injury_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.injury_reports ir
      WHERE ir.id = injury_report_id
        AND ir.shared_with_coach = true
        AND is_linked_coach(auth.uid(), ir.user_id)
    )
  );

CREATE POLICY "Guardians can view player injury check-ins"
  ON public.injury_check_ins FOR SELECT
  USING (is_guardian_of(auth.uid(), user_id));
