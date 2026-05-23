SELECT cron.unschedule('supabase-keepalive') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='supabase-keepalive');

SELECT cron.schedule(
  'supabase-keepalive',
  '0 12 */3 * *',
  $$
  SELECT net.http_post(
    url:='https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubG9jaWJldHRneXF5dHRlZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyOTMyNTAsImV4cCI6MjA1Mjg2OTI1MH0.eA90Z5FYhTwVD37Lh7WX6ctYHSI4_Z_-q7oOL_4FkFg"}'::jsonb,
    body:=concat('{"time":"', now(), '"}')::jsonb
  ) as request_id;
  $$
);