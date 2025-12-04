# Shorts Spy - Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Shorts Spy  
**Version:** MVP v1.0  
**Product Type:** Micro-SaaS Web Application  
**Target Users:** Content creators, marketers, and analysts who want to analyze TikTok creator performance

### Value Proposition
Shorts Spy enables users to analyze any TikTok creator's short-form video content by providing ranked lists of their videos with engagement metrics and insights, helping users understand what content performs best.

---

## 2. Core Features

### 2.1 Primary User Flow
1. User signs up/logs in
2. User enters a TikTok username
3. System scrapes creator's videos via Apify
4. System stores normalized data in Supabase
5. User views ranked/sorted list of videos with metrics
6. User sees basic insights about the creator's content

### 2.2 Feature Scope (MVP)
- ✅ TikTok username search and analysis
- ✅ Video ranking with sortable metrics (views, likes, comments, engagement rate)
- ✅ Basic insights (average engagement, best performing video, posting patterns)
- ✅ User authentication (sign up/login)
- ✅ Free tier (20 videos) and Paid tier (100 videos)
- ✅ Rate limiting to prevent abuse
- ✅ Data caching (48-hour cache, 1-hour refresh cooldown)

### 2.3 Out of Scope (Future)
- ❌ Instagram Reels analysis
- ❌ YouTube Shorts analysis
- ❌ Historical trend analysis
- ❌ Competitor comparison
- ❌ Export functionality
- ❌ API access for developers
- ❌ Team/organization accounts

---

## 3. User Roles & Tiers

### 3.1 Free Tier
- **Video Limit:** 20 videos per analysis
- **Features:**
  - Basic video ranking table
  - Basic insights panel
  - Manual refresh (1-hour cooldown)
  - Rate limit: 10 scrapes per day

### 3.2 Paid Tier
- **Video Limit:** 100 videos per analysis
- **Features:**
  - All free tier features
  - Extended video ranking (up to 100 videos)
  - Same insights panel
  - Same refresh cooldown
  - Same rate limits

---

## 4. Functional Requirements

### 4.1 Authentication
- **FR-1:** Users must sign up with email/password
- **FR-2:** Users can log in and log out
- **FR-3:** Protected routes require authentication
- **FR-4:** User session persists across browser sessions

### 4.2 TikTok Analysis
- **FR-5:** Users can enter a TikTok username to analyze
- **FR-6:** System validates username format (basic validation)
- **FR-7:** System triggers Apify scraper for the username
- **FR-8:** System displays loading state during scraping
- **FR-9:** System stores scraped data in normalized format
- **FR-10:** System displays results in a sortable table

### 4.3 Results Display
- **FR-11:** Results table shows: thumbnail, video URL, description, views, likes, comments, engagement rate, posted date
- **FR-12:** Users can sort by: views, likes, comments, engagement rate, date (ascending/descending)
- **FR-13:** Free users see maximum 20 videos with upgrade prompt
- **FR-14:** Paid users see up to 100 videos
- **FR-15:** Results page shows cache timestamp ("Last updated: X hours ago")
- **FR-16:** Users can manually refresh data (with cooldown indicator)

### 4.4 Insights
- **FR-17:** Display average engagement rate across all videos
- **FR-18:** Display total views across all videos
- **FR-19:** Display best performing video (highest engagement rate)
- **FR-20:** Display posting frequency (videos per week/month)
- **FR-21:** Display peak posting times (if available in data)

### 4.5 Data Management
- **FR-22:** System caches results for 48 hours per username
- **FR-23:** Users can refresh data with 1-hour cooldown between refreshes
- **FR-24:** System handles duplicate videos (upsert logic)
- **FR-25:** System updates profile metadata on each scrape

### 4.6 Rate Limiting
- **FR-26:** Users limited to 10 scrapes per day
- **FR-27:** System tracks rate limits per user
- **FR-28:** System displays rate limit status to users
- **FR-29:** System shows clear error message when rate limit exceeded

### 4.7 Subscription Management
- **FR-30:** Users can view pricing page
- **FR-31:** Free users see upgrade prompts when viewing >20 videos
- **FR-32:** Users can subscribe via Stripe checkout
- **FR-33:** System tracks subscription status in database
- **FR-34:** System enforces video limits based on subscription tier
- **FR-35:** Users can view subscription status in account settings

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-1:** Page load time < 2 seconds (initial load)
- **NFR-2:** API response time < 500ms (for cached data)
- **NFR-3:** Scraping operation timeout: 5 minutes max
- **NFR-4:** Support up to 100 videos in results table without performance degradation

### 5.2 Reliability
- **NFR-5:** System handles Apify API failures gracefully
- **NFR-6:** System retries failed scrapes (max 2 retries)
- **NFR-7:** System stores error messages for debugging
- **NFR-8:** Uptime target: 99% (for MVP)

### 5.3 Security
- **NFR-9:** All API routes require authentication
- **NFR-10:** Row Level Security (RLS) enabled on all Supabase tables
- **NFR-11:** User data isolated by user_id
- **NFR-12:** API keys stored in environment variables
- **NFR-13:** Input validation on all user inputs

### 5.4 Usability
- **NFR-14:** Responsive design (mobile, tablet, desktop)
- **NFR-15:** Clear error messages for all failure states
- **NFR-16:** Loading states for all async operations
- **NFR-17:** Accessible UI (basic WCAG compliance)

### 5.5 Scalability
- **NFR-18:** Architecture supports horizontal scaling
- **NFR-19:** Database queries optimized with proper indexes
- **NFR-20:** Rate limiting prevents abuse

---

## 6. Technical Constraints

### 6.1 Technology Stack
- **TC-1:** Frontend: Next.js 14+ (App Router), React, TypeScript
- **TC-2:** Styling: Tailwind CSS
- **TC-3:** Database: Supabase (PostgreSQL)
- **TC-4:** Authentication: Supabase Auth
- **TC-5:** Payments: Supabase Stripe integration
- **TC-6:** External API: Apify `clockworks/tiktok-scraper` actor
- **TC-7:** Deployment: Vercel (or similar serverless platform)

### 6.2 Data Constraints
- **TC-8:** TikTok data source: Apify actor only (no direct TikTok API)
- **TC-9:** Data freshness: 48-hour cache minimum
- **TC-10:** Refresh cooldown: 1 hour minimum between manual refreshes
- **TC-11:** Maximum videos per analysis: 100 (paid tier)

### 6.3 API Constraints
- **TC-12:** Apify actor runs asynchronously (requires polling)
- **TC-13:** Rate limits: 10 scrapes per user per day
- **TC-14:** No direct TikTok API access (rely on Apify)

### 6.4 Cost Constraints
- **TC-15:** Minimize Apify API calls (caching strategy)
- **TC-16:** Minimize database operations (efficient queries)
- **TC-17:** Serverless architecture to minimize infrastructure costs

---

## 7. Business Constraints

### 7.1 Pricing Model
- **BC-1:** Free tier: 20 videos per analysis
- **BC-2:** Paid tier: 100 videos per analysis
- **BC-3:** Payment processing via Stripe
- **BC-4:** Subscription management via Supabase

### 7.2 Usage Limits
- **BC-5:** Rate limit: 10 scrapes per user per day (applies to all tiers)
- **BC-6:** Video limit enforced per subscription tier
- **BC-7:** Manual refresh cooldown: 1 hour

### 7.3 Data Retention
- **BC-8:** Scraped data stored indefinitely (for user history)
- **BC-9:** Users can view their scrape history
- **BC-10:** No automatic data deletion (for MVP)

---

## 8. Data Requirements

### 8.1 Required Data Fields (from Apify)
- TikTok username
- Video ID
- Video URL
- Description
- Thumbnail URL
- Views count
- Likes count
- Comments count
- Shares count (if available)
- Posted date/timestamp
- Duration (if available)
- Creator display name
- Creator follower count (if available)

### 8.2 Calculated Fields
- Engagement rate: `(likes + comments) / views * 100`
- Posting frequency: Videos per week/month
- Average engagement rate: Mean across all videos

### 8.3 Data Quality
- **DR-1:** Handle missing/null values gracefully
- **DR-2:** Validate data types before storage
- **DR-3:** Normalize data format (consistent date formats, number formats)
- **DR-4:** Deduplicate videos by video_id

---

## 9. User Experience Requirements

### 9.1 Page Structure
- **UX-1:** Landing page with value proposition
- **UX-2:** Authentication pages (sign up, login)
- **UX-3:** Dashboard with search functionality
- **UX-4:** Results page with table and insights
- **UX-5:** Pricing page
- **UX-6:** Account settings page

### 9.2 Interaction Patterns
- **UX-7:** Search bar prominently displayed on dashboard
- **UX-8:** Recent searches shown on dashboard (last 5)
- **UX-9:** Sortable table columns with visual indicators
- **UX-10:** Clear subscription status badge
- **UX-11:** Upgrade prompts for free users viewing >20 videos
- **UX-12:** Refresh button with cooldown timer

### 9.3 Error Handling
- **UX-13:** Clear error messages for invalid usernames
- **UX-14:** Clear error messages for rate limit exceeded
- **UX-15:** Clear error messages for scraping failures
- **UX-16:** Retry options for failed operations

---

## 10. Success Metrics (MVP)

### 10.1 Technical Metrics
- Successful scrape rate: >95%
- Average scrape completion time: <3 minutes
- API error rate: <5%
- Page load performance: <2 seconds

### 10.2 Business Metrics (Post-MVP)
- User sign-up conversion rate
- Free-to-paid conversion rate
- Daily active users
- Average analyses per user

---

## 11. Assumptions

1. Apify `clockworks/tiktok-scraper` actor returns data in consistent format
2. TikTok usernames are publicly accessible (no private account handling needed for MVP)
3. Users understand what TikTok usernames are (no extensive education needed)
4. Stripe integration works seamlessly with Supabase
5. Serverless functions can handle async Apify operations within timeout limits

---

## 12. Risks & Mitigations

### 12.1 Technical Risks
- **Risk:** Apify API changes or becomes unavailable
  - **Mitigation:** Store raw responses, implement fallback error handling
- **Risk:** Scraping takes too long, times out
  - **Mitigation:** Implement polling with reasonable timeout, show progress
- **Risk:** TikTok changes structure, breaking scraper
  - **Mitigation:** Monitor Apify actor updates, handle errors gracefully

### 12.2 Business Risks
- **Risk:** High Apify costs from excessive API calls
  - **Mitigation:** Aggressive caching (48 hours), rate limiting, refresh cooldowns
- **Risk:** Users abuse free tier
  - **Mitigation:** Rate limiting (10 per day), video limits
- **Risk:** Low conversion from free to paid
  - **Mitigation:** Clear value proposition, strategic upgrade prompts

---

## 13. Future Enhancements (Post-MVP)

1. Instagram Reels analysis
2. YouTube Shorts analysis
3. Historical trend charts
4. Competitor comparison tools
5. Export to CSV/PDF
6. Email reports
7. API access for developers
8. Team/organization accounts
9. Advanced analytics (sentiment analysis, hashtag analysis)
10. Content recommendations based on top performers

---

## Document Version
- **Version:** 1.0
- **Last Updated:** [Current Date]
- **Status:** Draft - Pre-Implementation

