-- Data Export Migration
-- Creates tables and functions for data export and Google Sheets integration

-- ============================================================================
-- Google Sheets Links Table (for Google Sheets sync feature)
-- ============================================================================
CREATE TABLE IF NOT EXISTS google_sheet_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_sheet UNIQUE (user_id, sheet_id)
);

-- Index for user sheet lookups
CREATE INDEX IF NOT EXISTS idx_google_sheet_links_user_id ON google_sheet_links(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheet_links_sheet_id ON google_sheet_links(sheet_id);

-- ============================================================================
-- Data Export Requests Table (for tracking export history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type VARCHAR(50) NOT NULL DEFAULT 'full',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  file_count INTEGER DEFAULT 0,
  file_size_bytes BIGINT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user export history
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);

-- ============================================================================
-- Data Retention Settings (per user preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_retention_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  retain_matches_days INTEGER DEFAULT NULL,
  retain_training_days INTEGER DEFAULT NULL,
  retain_notes_days INTEGER DEFAULT NULL,
  auto_delete_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Function: Get user's Google Sheet links
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_google_sheets(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  sheet_id VARCHAR(255),
  sheet_name VARCHAR(255),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gsl.id,
    gsl.sheet_id,
    gsl.sheet_name,
    gsl.last_sync,
    gsl.created_at
  FROM google_sheet_links gsl
  WHERE gsl.user_id = p_user_id
  ORDER BY gsl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Sync matches to Google Sheet
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_matches_to_sheet(
  p_user_id UUID,
  p_sheet_id UUID,
  p_since TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  synced_count INTEGER,
  last_match_date TIMESTAMPTZ
) AS $$
DECLARE
  v_last_sync TIMESTAMPTZ;
  v_synced INTEGER := 0;
  v_last_date TIMESTAMPTZ;
BEGIN
  -- Get last sync time
  SELECT last_sync INTO v_last_sync
  FROM google_sheet_links
  WHERE id = p_sheet_id AND user_id = p_user_id;

  -- Fetch matches since last sync
  IF p_since IS NOT NULL THEN
    v_last_sync := p_since;
  END IF;

  -- Return sync info (actual sync is done via edge function with API access)
  RETURN QUERY
  SELECT 
    COALESCE(
      (SELECT COUNT(*) FROM matches 
       WHERE user_id = p_user_id 
       AND (v_last_sync IS NULL OR created_at > v_last_sync)),
      0
    )::INTEGER,
    COALESCE(
      (SELECT MAX(created_at) FROM matches WHERE user_id = p_user_id),
      NOW()
    )::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Log data export request
-- ============================================================================
CREATE OR REPLACE FUNCTION log_data_export_request(
  p_user_id UUID,
  p_export_type VARCHAR(50) DEFAULT 'full'
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO data_export_requests (user_id, export_type, status)
  VALUES (p_user_id, p_export_type, 'processing')
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Update data export request status
-- ============================================================================
CREATE OR REPLACE FUNCTION update_export_request_status(
  p_request_id UUID,
  p_status VARCHAR(20),
  p_file_count INTEGER DEFAULT NULL,
  p_file_size_bytes BIGINT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE data_export_requests
  SET 
    status = p_status,
    file_count = COALESCE(p_file_count, file_count),
    file_size_bytes = COALESCE(p_file_size_bytes, file_size_bytes),
    completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Add journaling_preferences JSONB column to profiles if not exists
-- (for future export preferences like auto-export to Google Sheets)
-- ============================================================================
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
-- RLS Policies
-- ============================================================================
ALTER TABLE google_sheet_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own Google Sheet links
CREATE POLICY "Users can view own Google Sheet links"
  ON google_sheet_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Google Sheet links"
  ON google_sheet_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Google Sheet links"
  ON google_sheet_links FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only access their own export requests
CREATE POLICY "Users can view own export requests"
  ON data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export requests"
  ON data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only access their own retention settings
CREATE POLICY "Users can view own retention settings"
  ON data_retention_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retention settings"
  ON data_retention_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retention settings"
  ON data_retention_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- CRS:18