-- Migration: Add subscription system for monetisation
-- This migration creates tables and functions for managing user subscriptions

-- Step 1: Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'coach')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 2: Create usage_limits table for tracking free tier limits
CREATE TABLE IF NOT EXISTS public.usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  limit_type VARCHAR(50) NOT NULL, -- 'matches_per_month', 'notes_per_month', 'opponents_total'
  current_count INTEGER DEFAULT 0,
  reset_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, limit_type, reset_date)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON public.usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_reset_date ON public.usage_limits(reset_date);

-- Step 4: Create function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_tier VARCHAR(20);
BEGIN
  SELECT tier INTO v_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 5: Create function to check if user can access feature
CREATE OR REPLACE FUNCTION public.can_access_feature(
  p_user_id UUID,
  p_feature VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR(20);
BEGIN
  v_tier := public.get_user_tier(p_user_id);
  
  -- Feature access logic
  CASE p_feature
    WHEN 'video_analysis' THEN
      RETURN v_tier IN ('pro', 'coach');
    WHEN 'advanced_analytics' THEN
      RETURN v_tier IN ('pro', 'coach');
    WHEN 'multi_sport' THEN
      RETURN v_tier IN ('pro', 'coach');
    WHEN 'export' THEN
      RETURN v_tier IN ('pro', 'coach');
    WHEN 'coach_tools' THEN
      RETURN v_tier = 'coach';
    ELSE
      RETURN true; -- Default to allowing access
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 6: Create function to get usage limit for user
CREATE OR REPLACE FUNCTION public.get_usage_limit(
  p_user_id UUID,
  p_limit_type VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
  v_tier VARCHAR(20);
  v_count INTEGER;
  v_reset_date DATE;
BEGIN
  v_tier := public.get_user_tier(p_user_id);
  
  -- Free tier limits
  IF v_tier = 'free' THEN
    CASE p_limit_type
      WHEN 'matches_per_month' THEN
        RETURN 10;
      WHEN 'notes_per_month' THEN
        RETURN 5;
      WHEN 'opponents_total' THEN
        RETURN 5;
      ELSE
        RETURN 0;
    END CASE;
  END IF;
  
  -- Pro and Coach tiers have unlimited access
  RETURN 999999;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 7: Create function to get current usage count
CREATE OR REPLACE FUNCTION public.get_current_usage(
  p_user_id UUID,
  p_limit_type VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_reset_date DATE;
BEGIN
  -- Get current month's reset date
  v_reset_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  SELECT current_count INTO v_count
  FROM public.usage_limits
  WHERE user_id = p_user_id
    AND limit_type = p_limit_type
    AND reset_date = v_reset_date;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 8: Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_limit_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_reset_date DATE;
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  v_reset_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_limit := public.get_usage_limit(p_user_id, p_limit_type);
  v_current_count := public.get_current_usage(p_user_id, p_limit_type);
  
  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN false;
  END IF;
  
  -- Insert or update usage
  INSERT INTO public.usage_limits (user_id, limit_type, current_count, reset_date)
  VALUES (p_user_id, p_limit_type, 1, v_reset_date)
  ON CONFLICT (user_id, limit_type, reset_date)
  DO UPDATE SET
    current_count = usage_limits.current_count + 1,
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Set up Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_limits
CREATE POLICY "Users can view their own usage limits"
  ON public.usage_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage limits"
  ON public.usage_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage limits"
  ON public.usage_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 10: Create trigger to auto-create free subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Grant permissions
GRANT SELECT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_limits TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tier(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_access_feature(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_usage_limit(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_current_usage(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, VARCHAR) TO authenticated;

-- Step 12: Add comments for documentation
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription information and Stripe integration data';
COMMENT ON TABLE public.usage_limits IS 'Tracks usage limits for free tier users (resets monthly)';
COMMENT ON FUNCTION public.get_user_tier(UUID) IS 'Returns the subscription tier for a user (defaults to free)';
COMMENT ON FUNCTION public.can_access_feature(UUID, VARCHAR) IS 'Checks if a user can access a specific premium feature';
COMMENT ON FUNCTION public.get_usage_limit(UUID, VARCHAR) IS 'Returns the usage limit for a specific limit type based on user tier';
COMMENT ON FUNCTION public.get_current_usage(UUID, VARCHAR) IS 'Returns the current usage count for a user and limit type';
COMMENT ON FUNCTION public.increment_usage(UUID, VARCHAR) IS 'Increments usage count and returns true if within limit, false if exceeded';
