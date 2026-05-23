CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public._heartbeat (
  id integer PRIMARY KEY,
  last_beat timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public._heartbeat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heartbeat readable" ON public._heartbeat FOR SELECT USING (true);