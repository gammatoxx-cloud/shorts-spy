-- Update saved_videos table to support both TikTok and Instagram videos
-- Add platform column to distinguish between video sources

-- Add platform column
ALTER TABLE saved_videos
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('tiktok', 'instagram'));

-- Update existing saved videos to have 'tiktok' platform
UPDATE saved_videos
SET platform = 'tiktok'
WHERE platform IS NULL;

-- Make platform NOT NULL after setting defaults
ALTER TABLE saved_videos
ALTER COLUMN platform SET NOT NULL,
ALTER COLUMN platform SET DEFAULT 'tiktok';

-- Drop the foreign key constraint (since we need to reference different tables)
ALTER TABLE saved_videos
DROP CONSTRAINT IF EXISTS saved_videos_video_id_fkey;

-- Update unique constraint to include platform (so same video_id can be saved for different platforms)
ALTER TABLE saved_videos
DROP CONSTRAINT IF EXISTS saved_videos_user_id_video_id_key;

ALTER TABLE saved_videos
ADD CONSTRAINT saved_videos_user_id_video_id_platform_unique UNIQUE (user_id, video_id, platform);

-- Create index on platform for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_videos_platform ON saved_videos(platform);
CREATE INDEX IF NOT EXISTS idx_saved_videos_user_platform ON saved_videos(user_id, platform);

