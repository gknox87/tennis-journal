-- Add trial_end column to subscriptions for 14-day free trial
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_end timestamptz;

-- Update plan check to include 'trial'
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'trial'));
