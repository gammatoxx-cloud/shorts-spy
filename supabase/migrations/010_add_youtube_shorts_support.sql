-- Add platform support for YouTube Shorts
-- This migration adds 'youtube' to platform columns, creates youtube_shorts table,
-- and adds necessary indexes and RLS policies

-- ============================================
-- PROFILES TABLE - Update platform constraint
-- ============================================

-- Drop the old check constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_platform_check;

-- Add new check constraint to include 'youtube'
ALTER TABLE profiles
ADD CONSTRAINT profiles_platform_check CHECK (platform IN ('tiktok', 'instagram', 'youtube'));

-- ============================================
-- SCRAPES TABLE - Update platform constraint
-- ============================================

-- Drop the old check constraint
ALTER TABLE scrapes
DROP CONSTRAINT IF EXISTS scrapes_platform_check;

-- Add new check constraint to include 'youtube'
ALTER TABLE scrapes
ADD CONSTRAINT scrapes_platform_check CHECK (platform IN ('tiktok', 'instagram', 'youtube'));

-- ============================================
-- SAVED_VIDEOS TABLE - Update platform constraint
-- ============================================

-- Drop the old check constraint
ALTER TABLE saved_videos
DROP CONSTRAINT IF EXISTS saved_videos_platform_check;

-- Add new check constraint to include 'youtube'
ALTER TABLE saved_videos
ADD CONSTRAINT saved_videos_platform_check CHECK (platform IN ('tiktok', 'instagram', 'youtube'));

-- ============================================
-- YOUTUBE_SHORTS TABLE - Create new table
-- ============================================

-- Create youtube_shorts table (mirroring tiktok_videos and instagram_reels structure)
CREATE TABLE IF NOT EXISTS youtube_shorts (
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
-- INDEXES FOR YOUTUBE_SHORTS
-- ============================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_profile_id ON youtube_shorts(profile_id);
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_scrape_id ON youtube_shorts(scrape_id);
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_video_id ON youtube_shorts(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_engagement_rate ON youtube_shorts(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_views ON youtube_shorts(views DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_posted_at ON youtube_shorts(posted_at DESC);

-- ============================================
-- TRIGGERS FOR YOUTUBE_SHORTS
-- ============================================

-- Create trigger to automatically update updated_at for youtube_shorts
CREATE TRIGGER update_youtube_shorts_updated_at BEFORE UPDATE ON youtube_shorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES FOR YOUTUBE_SHORTS
-- ============================================

-- Enable Row Level Security on youtube_shorts table
ALTER TABLE youtube_shorts ENABLE ROW LEVEL SECURITY;

-- Users can view shorts from profiles they have scraped
CREATE POLICY "Users can view shorts from their scrapes"
  ON youtube_shorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = youtube_shorts.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can insert shorts (when scraping)
CREATE POLICY "Users can insert shorts from their scrapes"
  ON youtube_shorts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = youtube_shorts.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can update shorts from their scrapes
CREATE POLICY "Users can update shorts from their scrapes"
  ON youtube_shorts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = youtube_shorts.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );
