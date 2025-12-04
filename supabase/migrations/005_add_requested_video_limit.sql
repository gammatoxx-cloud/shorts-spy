-- Add requested_video_limit field to scrapes table
-- This stores the user's requested video count limit for the analysis
ALTER TABLE scrapes
ADD COLUMN IF NOT EXISTS requested_video_limit INTEGER;

-- Update existing scrapes to have default limit based on free tier
UPDATE scrapes
SET requested_video_limit = 20
WHERE requested_video_limit IS NULL;

-- Set default value for future inserts
ALTER TABLE scrapes
ALTER COLUMN requested_video_limit SET DEFAULT 20;

