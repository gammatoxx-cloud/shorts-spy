-- Add platform support for Instagram Reels
-- This migration adds platform column to profiles and scrapes, creates instagram_reels table,
-- and adds necessary indexes and RLS policies

-- ============================================
-- PROFILES TABLE - Add platform column
-- ============================================

-- Add platform column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'tiktok' CHECK (platform IN ('tiktok', 'instagram'));

-- Drop the old unique constraint on username
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Create new unique constraint on (username, platform)
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_platform_unique UNIQUE (username, platform);

-- Update existing profiles to have 'tiktok' platform (they're already TikTok)
UPDATE profiles
SET platform = 'tiktok'
WHERE platform = 'tiktok' OR platform IS NULL;

-- Create index on platform for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_platform ON profiles(platform);
CREATE INDEX IF NOT EXISTS idx_profiles_username_platform ON profiles(username, platform);

-- ============================================
-- SCRAPES TABLE - Add platform column
-- ============================================

-- Add platform column to scrapes table
ALTER TABLE scrapes
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('tiktok', 'instagram'));

-- Update existing scrapes to have 'tiktok' platform by checking related profiles
UPDATE scrapes
SET platform = 'tiktok'
WHERE platform IS NULL;

-- Create index on platform for better query performance
CREATE INDEX IF NOT EXISTS idx_scrapes_platform ON scrapes(platform);

-- ============================================
-- INSTAGRAM_REELS TABLE - Create new table
-- ============================================

-- Create instagram_reels table (mirroring tiktok_videos structure)
CREATE TABLE IF NOT EXISTS instagram_reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scrape_id UUID NOT NULL REFERENCES scrapes(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  comments BIGINT NOT NULL DEFAULT 0,
  shares BIGINT,
  engagement_rate NUMERIC(10, 4) NOT NULL DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR INSTAGRAM_REELS
-- ============================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_instagram_reels_profile_id ON instagram_reels(profile_id);
CREATE INDEX IF NOT EXISTS idx_instagram_reels_scrape_id ON instagram_reels(scrape_id);
CREATE INDEX IF NOT EXISTS idx_instagram_reels_video_id ON instagram_reels(video_id);
CREATE INDEX IF NOT EXISTS idx_instagram_reels_engagement_rate ON instagram_reels(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_reels_views ON instagram_reels(views DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_reels_posted_at ON instagram_reels(posted_at DESC);

-- ============================================
-- TRIGGERS FOR INSTAGRAM_REELS
-- ============================================

-- Create trigger to automatically update updated_at for instagram_reels
CREATE TRIGGER update_instagram_reels_updated_at BEFORE UPDATE ON instagram_reels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES FOR INSTAGRAM_REELS
-- ============================================

-- Enable Row Level Security on instagram_reels table
ALTER TABLE instagram_reels ENABLE ROW LEVEL SECURITY;

-- Users can view reels from profiles they have scraped
CREATE POLICY "Users can view reels from their scrapes"
  ON instagram_reels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = instagram_reels.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can insert reels (when scraping)
CREATE POLICY "Users can insert reels from their scrapes"
  ON instagram_reels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = instagram_reels.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can update reels from their scrapes
CREATE POLICY "Users can update reels from their scrapes"
  ON instagram_reels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = instagram_reels.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

