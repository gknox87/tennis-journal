-- Smart Notifications Migration
-- Creates notifications table and user_location_sessions for GPS play detection

-- ============================================================================
-- Notifications table (if not already created)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
-- Index for cleanup of old notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- User location sessions table for GPS play detection
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_location_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sport_id VARCHAR(50),
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding unprocessed sessions
CREATE INDEX IF NOT EXISTS idx_user_location_sessions_unprocessed ON user_location_sessions(processed) WHERE processed = FALSE;
-- Index for user location lookup
CREATE INDEX IF NOT EXISTS idx_user_location_sessions_user_id ON user_location_sessions(user_id);
-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_user_location_sessions_timestamp ON user_location_sessions(timestamp DESC);

-- ============================================================================
-- Notification preferences stored in profiles.journaling_preferences (JSONB)
-- Fields:
--   reminder_enabled: boolean
--   reminder_time: string (HH:mm)
--   reminder_days: string[] (["mon","tue",...])
--   after_match_reminder: boolean
--   after_training_reminder: boolean
--   weekly_summary_enabled: boolean
--   location_tracking_enabled: boolean
--   smart_nudge_enabled: boolean
--   smart_nudge_threshold_days: number
-- ============================================================================

-- Add journaling_preferences column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'journaling_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN journaling_preferences JSONB DEFAULT NULL;
  END IF;
END $$;

-- ============================================================================
-- Function to create a notification
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_body TEXT DEFAULT NULL,
  p_link VARCHAR(500) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to get users with active reminders at a specific time window
-- ============================================================================
CREATE OR REPLACE FUNCTION get_users_for_reminder_window(
  p_current_time TIME,
  p_window_minutes INT DEFAULT 15
) RETURNS TABLE (
  user_id UUID,
  reminder_time TIME,
  reminder_days TEXT[],
  journaling_preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    (prefs->>'reminder_time')::TIME as reminder_time,
    (prefs->>'reminder_days')::TEXT[] as reminder_days,
    prefs as journaling_preferences
  FROM profiles p
  CROSS JOIN LATERAL (
    SELECT COALESCE(p.journaling_preferences, '{}'::JSONB) AS prefs
  ) prefs_json
  WHERE 
    p.journaling_preferences IS NOT NULL
    AND (prefs_json.prefs->>'reminder_enabled')::BOOLEAN = TRUE
    AND ABS(EXTRACT(EPOCH FROM ((prefs_json.prefs->>'reminder_time')::TIME - p_current_time)) / 60) <= p_window_minutes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to check if current day is in reminder days
-- ============================================================================
CREATE OR REPLACE FUNCTION is_reminder_day(
  p_reminder_days TEXT[],
  p_current_date DATE DEFAULT CURRENT_DATE
) RETURNS BOOLEAN AS $$
DECLARE
  current_day VARCHAR(3);
BEGIN
  current_day := LOWER(TO_CHAR(p_current_date, 'dy'));
  
  -- Handle international variations
  IF current_day = 'Thu' THEN current_day := 'thu';
  ELSIF current_day = 'Sat' THEN current_day := 'sat';
  ELSIF current_day = 'Sun' THEN current_day := 'sun';
  END IF;
  
  RETURN current_day = ANY(p_reminder_days);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- CRS:18
