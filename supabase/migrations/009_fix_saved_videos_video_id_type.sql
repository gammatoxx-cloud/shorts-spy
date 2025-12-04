-- Fix saved_videos.video_id column type from UUID to TEXT
-- The code stores TikTok video ID strings (TEXT), not database UUIDs

-- First, drop any existing data (since we can't convert UUIDs to video_id strings)
-- This is safe because saved_videos is just a bookmark table
DELETE FROM saved_videos;

-- Change the column type from UUID to TEXT
ALTER TABLE saved_videos
ALTER COLUMN video_id TYPE TEXT USING video_id::TEXT;

-- Recreate the index since the column type changed
DROP INDEX IF EXISTS idx_saved_videos_video_id;
CREATE INDEX IF NOT EXISTS idx_saved_videos_video_id ON saved_videos(video_id);

