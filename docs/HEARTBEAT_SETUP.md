# Supabase Free-Tier Heartbeat Setup

## What this does
Keeps your free Supabase project alive. Free projects pause after **7 days of inactivity**. This heartbeat writes a tiny row to your database once a week so Supabase sees activity.

## Setup (2 steps, 5 minutes)

### Step 1: Deploy the Edge Function

Run this in your project folder:

```bash
npx supabase functions deploy heartbeat
```

Or if you use the Supabase CLI directly:

```bash
supabase functions deploy heartbeat
```

Your public heartbeat URL will be:
```
https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat
```

You can test it immediately by opening that URL in a browser — you should see:
```json
{"ok":true,"beat_at":"...","next_beat_due":"7 days"}
```

### Step 2: Set up a free cron job

**Option A: cron-job.org (recommended — free, no account needed)**
1. Go to https://cron-job.org
2. Create a free account (or use without account for a single job)
3. Create a new cron job:
   - **URL:** `https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat`
   - **Schedule:** Every 6 days (or Weekly)
   - **Method:** GET
4. Save — done. It runs forever.

**Option B: UptimeRobot (free)**
1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat`
   - **Interval:** Every 24 hours
4. Save — done.

**Option C: Bookmark (manual backup)**
Bookmark this URL and click it once a week:
```
https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat
```

## That's it

No GitHub Actions. No workflows. No secrets. Just a URL that gets pinged weekly.
