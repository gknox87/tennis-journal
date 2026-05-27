-- Padel Partner Tracking Schema
-- Add partner tracking to support doubles matches for padel and other pair sports

-- Create match_type enum for singles/doubles
CREATE TYPE match_type AS ENUM ('singles', 'doubles');

-- Add partner_id FK to matches table (nullable, for doubles matches)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- Add match_type column to distinguish singles vs doubles
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_type match_type DEFAULT 'singles';

-- Create partners table for tracking doubles partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique constraint: one partner name per user per sport
  UNIQUE(user_id, sport_id, name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_user_sport ON partners(user_id, sport_id);

-- RLS policies for partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are viewable by their owner"
  ON partners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can be inserted by authenticated users"
  ON partners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can be updated by their owner"
  ON partners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can be deleted by their owner"
  ON partners FOR DELETE
  USING (auth.uid() = user_id);

-- Update matches table to allow partner_id to be updated
ALTER TABLE matches ALTER COLUMN partner_id DROP NOT NULL;

-- Add index on match_type for filtering
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON matches(match_type);

-- Add index on partner_id for partner stats queries
CREATE INDEX IF NOT EXISTS idx_matches_partner_id ON matches(partner_id);

-- Function to get or create a partner
CREATE OR REPLACE FUNCTION get_or_create_partner(
  p_name TEXT,
  p_user_id UUID,
  p_sport_id TEXT
) RETURNS UUID AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  -- Try to find existing partner
  SELECT id INTO v_partner_id
  FROM partners
  WHERE name = p_name AND user_id = p_user_id AND sport_id = p_sport_id;
  
  -- If not found, create new
  IF v_partner_id IS NULL THEN
    INSERT INTO partners (name, user_id, sport_id)
    VALUES (p_name, p_user_id, p_sport_id)
    RETURNING id INTO v_partner_id;
  END IF;
  
  RETURN v_partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update matches RLS to allow reading by partner_id for doubles matches
-- (Partners can see their matches when they are the partner)