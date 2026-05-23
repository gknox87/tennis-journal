SELECT cron.unschedule('supabase-keepalive') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='supabase-keepalive');

SELECT cron.schedule(
  'supabase-keepalive',
  '0 12 */3 * *',
  $$
  SELECT net.http_post(
    url:='https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:=concat('{"time":"', now(), '"}')::jsonb
  ) as request_id;
  $$
);