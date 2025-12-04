-- Create saved_videos table to store user-video relationships
CREATE TABLE IF NOT EXISTS saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES tiktok_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_videos

-- Users can view their own saved videos
CREATE POLICY "Users can view their own saved videos"
  ON saved_videos FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own saved videos
CREATE POLICY "Users can insert their own saved videos"
  ON saved_videos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own saved videos
CREATE POLICY "Users can delete their own saved videos"
  ON saved_videos FOR DELETE
  USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_videos_user_id ON saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_video_id ON saved_videos(video_id);

