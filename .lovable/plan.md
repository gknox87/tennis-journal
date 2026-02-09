

# Business Model & Subscription System

## Overview

Build a complete subscription tier system (Free, Pro, Team) with usage limits enforced in the database and surfaced in the UI. This replaces the current static pricing page with a functional system that gates features based on the user's plan.

## Plan Tiers & Limits

| Feature | Free | Pro ($9/mo) | Team ($29/mo) |
|---|---|---|---|
| Match logging | 10 per month | Unlimited | Unlimited |
| Key opponents | 3 | Unlimited | Unlimited |
| Training load | View only | Full access | Full access |
| Wellness tracking | Basic | Full access | Full access |
| Coach sharing | No | Yes | Yes |
| Team management | No | No | Unlimited players & coaches |
| Video analytics | Removed from all tiers | -- | -- |
| AI match analysis | No | Yes | Yes |
| Export data | No | Yes | Yes |

## Implementation Steps

### 1. Database: Create `subscriptions` table and helper function

Create a new `subscriptions` table to track each user's current plan:

- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, unique)
- `plan` (text: 'free', 'pro', 'team')
- `status` (text: 'active', 'cancelled', 'past_due')
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `created_at`, `updated_at`

Enable RLS so users can only read their own subscription. Default all existing users to 'free'.

Create a `SECURITY DEFINER` function `get_user_plan(uuid)` that returns the plan string (defaulting to 'free' if no row exists). This avoids RLS recursion if plan checks are needed in policies later.

### 2. Create a `useSubscription` hook

A new React hook (`src/hooks/useSubscription.ts`) that:

- Fetches the current user's subscription from the `subscriptions` table
- Exposes: `plan` ('free' | 'pro' | 'team'), `isFreePlan`, `isProPlan`, `isTeamPlan`, `isLoading`
- Provides helper functions: `canLogMatch()` (checks monthly count against limit), `canAddKeyOpponent()` (checks count against limit), `canShareWithCoach()`, `canUseAI()`
- Counts current month's matches via a query to determine if the free cap (10) is reached
- Counts key opponents to check the free cap (3)

### 3. Create a reusable `UpgradePrompt` component

A small component (`src/components/UpgradePrompt.tsx`) shown when a user hits a limit:

- Displays a friendly message like "You've reached your free plan limit of 10 matches this month"
- Shows a button linking to the upgrade/pricing page
- Used inline wherever limits are enforced

### 4. Enforce limits in the UI

**Match logging (AddMatch page):**
- Before allowing submission, check `canLogMatch()` from the hook
- If at limit, show the `UpgradePrompt` instead of submitting
- Show remaining count in the UI (e.g., "7 of 10 matches used this month")

**Key opponents (KeyOpponents page):**
- Before allowing "Add Opponent" as key, check `canAddKeyOpponent()`
- If at limit (3 for free), show `UpgradePrompt`
- Display count indicator

**Coach sharing (MatchShareButtons):**
- Hide or disable sharing options for free users
- Show `UpgradePrompt` when they try

**AI analysis:**
- Gate the "Analyze" button behind pro/team check

### 5. Remove video analytics references

- Remove any video analytics menu items, buttons, or page links from the sidebar, dashboard, and navigation
- Keep the underlying hooks/code for now but remove all UI entry points

### 6. Update the Pricing page

- Update the static feature lists to match the actual enforced limits (10 matches/mo, 3 key opponents for free)
- Remove "Video Analysis" from all tiers
- Add "Coach Sharing" to Pro and Team
- Update Team description: "Unlimited players and coaches"
- Wire the "Start Pro Trial" / upgrade buttons to navigate to a plan selection flow (initially just a profile-based upgrade indicator until Stripe is connected)

### 7. Add subscription display to Profile page

- Show the current plan as a badge on the profile page
- Add an "Upgrade" button for free users
- Show usage stats (matches this month, key opponents count) relative to limits

### 8. Admin: View user subscriptions

- Add a subscription column to the admin users table so admins can see/manage plans

## Technical Details

### Migration SQL (summary)

```sql
-- subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
     WHERE user_id = _user_id AND status = 'active'),
    'free'
  )
$$;
```

### Files to create
- `src/hooks/useSubscription.ts` - subscription hook with limit checks
- `src/components/UpgradePrompt.tsx` - reusable upgrade CTA component

### Files to modify
- `src/pages/AddMatch.tsx` - enforce 10 match/month limit for free users
- `src/pages/KeyOpponents.tsx` - enforce 3 key opponent limit for free users
- `src/components/match/MatchShareButtons.tsx` - gate behind pro/team
- `src/pages/Pricing.tsx` - update features to match real limits
- `src/pages/Profile.tsx` - show plan badge and usage stats
- `src/components/SideMenu.tsx` - remove video analytics entry if any
- `src/components/dashboard/DashboardContent.tsx` - add plan-aware messaging
- `src/integrations/supabase/types.ts` - add subscriptions table type

### Stripe integration (future-ready)
The `subscriptions` table is designed to be updated by Stripe webhooks later. When Stripe is enabled, a webhook edge function will update the `plan`, `status`, and `current_period_end` fields. For now, plan changes can be managed manually by admins via the admin panel.

