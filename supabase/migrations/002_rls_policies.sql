-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view profiles that they have scraped
CREATE POLICY "Users can view profiles they have scraped"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.profile_id = profiles.id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can insert profiles (when creating a new scrape)
CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Users can update profiles they have scraped
CREATE POLICY "Users can update profiles they have scraped"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.profile_id = profiles.id
      AND scrapes.user_id = auth.uid()
    )
  );

-- ============================================
-- SCRAPES TABLE POLICIES
-- ============================================

-- Users can view their own scrapes
CREATE POLICY "Users can view their own scrapes"
  ON scrapes FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own scrapes
CREATE POLICY "Users can insert their own scrapes"
  ON scrapes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own scrapes
CREATE POLICY "Users can update their own scrapes"
  ON scrapes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own scrapes
CREATE POLICY "Users can delete their own scrapes"
  ON scrapes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- TIKTOK_VIDEOS TABLE POLICIES
-- ============================================

-- Users can view videos from profiles they have scraped
CREATE POLICY "Users can view videos from their scrapes"
  ON tiktok_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = tiktok_videos.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can insert videos (when scraping)
CREATE POLICY "Users can insert videos from their scrapes"
  ON tiktok_videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = tiktok_videos.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Users can update videos from their scrapes
CREATE POLICY "Users can update videos from their scrapes"
  ON tiktok_videos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = tiktok_videos.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- ============================================
-- USER_SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own subscription (initial free tier)
CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RATE_LIMITS TABLE POLICIES
-- ============================================

-- Users can view their own rate limits
CREATE POLICY "Users can view their own rate limits"
  ON rate_limits FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own rate limits
CREATE POLICY "Users can insert their own rate limits"
  ON rate_limits FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own rate limits
CREATE POLICY "Users can update their own rate limits"
  ON rate_limits FOR UPDATE
  USING (user_id = auth.uid());

-- Service role can manage all rate limits (for server-side operations)
-- Note: Service role bypasses RLS, so no policy needed for admin operations

