# Phase 3: Database Schema & Supabase Setup - Complete ✅

## Implementation Summary

Phase 3 is complete! All database schema, RLS policies, TypeScript types, and utility functions have been created.

---

## 📁 Files Created

### SQL Migrations
- `supabase/migrations/001_initial_schema.sql` - All tables, indexes, and triggers
- `supabase/migrations/002_rls_policies.sql` - Row Level Security policies
- `supabase/migrations/003_initial_user_subscription.sql` - Auto-subscription trigger
- `supabase/README.md` - Migration instructions

### TypeScript Types
- `types/database.types.ts` - Complete database type definitions

### Database Utilities
- `lib/db/profiles.ts` - Profile management functions
- `lib/db/scrapes.ts` - Scrape job management functions
- `lib/db/videos.ts` - Video data management functions
- `lib/db/subscriptions.ts` - Subscription management functions
- `lib/db/rate-limits.ts` - Rate limiting functions
- `lib/db/index.ts` - Central export file

---

## 🗄️ Database Schema

### Tables Created

1. **`profiles`** - TikTok creator profiles
   - Stores username, display name, avatar, follower count
   - Tracks last scraped timestamp

2. **`scrapes`** - Scraping job records
   - Links users to profiles
   - Tracks Apify run IDs, status, video counts
   - Stores error messages for failed scrapes

3. **`tiktok_videos`** - Normalized video data
   - Video metadata (URL, description, thumbnail)
   - Metrics (views, likes, comments, shares)
   - Calculated engagement rate
   - Posted date and duration

4. **`user_subscriptions`** - Subscription management
   - Free/paid tier tracking
   - Stripe customer/subscription IDs
   - Subscription status and period end

5. **`rate_limits`** - API usage tracking
   - Tracks scrape and refresh actions
   - Enforces daily/hourly limits
   - Window-based rate limiting

### Indexes Created
- Optimized indexes on foreign keys
- Indexes on frequently queried fields (engagement_rate, views, posted_at)
- Unique constraints on username and video_id

### Triggers Created
- Auto-update `updated_at` timestamps
- Auto-create free subscription for new users

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- ✅ Users can only view their own scrapes and videos
- ✅ Users can only insert/update their own records
- ✅ Users can view profiles they've scraped
- ✅ Users can manage their own subscriptions
- ✅ Users can track their own rate limits

**Security Features:**
- Data isolation per user
- No cross-user data access
- Service role can bypass RLS for admin operations

---

## 📝 How to Apply Migrations

### Step 1: Open Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your Shorts Spy project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run Migrations in Order

**Migration 1: Initial Schema**
1. Open `supabase/migrations/001_initial_schema.sql`
2. Copy all contents
3. Paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for "Success" message

**Migration 2: RLS Policies**
1. Open `supabase/migrations/002_rls_policies.sql`
2. Copy all contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success

**Migration 3: User Subscription Trigger**
1. Open `supabase/migrations/003_initial_user_subscription.sql`
2. Copy all contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success

### Step 3: Verify Setup

1. **Check Tables:**
   - Go to **Table Editor** in Supabase dashboard
   - Verify all 5 tables exist:
     - `profiles`
     - `scrapes`
     - `tiktok_videos`
     - `user_subscriptions`
     - `rate_limits`

2. **Check RLS:**
   - In Table Editor, each table should show a 🔒 lock icon
   - This indicates RLS is enabled

3. **Test Auto-Subscription:**
   - Create a new user account in your app
   - Go to Table Editor → `user_subscriptions`
   - Verify a free subscription was auto-created

---

## 🛠️ Database Utility Functions

All database operations are available through utility functions in `lib/db/`:

### Profiles
```typescript
import { getProfileByUsername, upsertProfile } from "@/lib/db";

// Get profile by username
const profile = await getProfileByUsername("charlidamelio");

// Create or update profile
const newProfile = await upsertProfile({
  username: "charlidamelio",
  display_name: "Charli D'Amelio",
});
```

### Scrapes
```typescript
import { createScrape, updateScrapeStatus } from "@/lib/db";

// Create new scrape
const scrape = await createScrape({
  user_id: userId,
  profile_id: profileId,
  status: "pending",
});

// Update scrape status
await updateScrapeStatus(scrape.id, "completed", {
  video_count: 50,
});
```

### Videos
```typescript
import { upsertVideo, getProfileVideos, getProfileVideoStats } from "@/lib/db";

// Insert/update video
await upsertVideo({
  profile_id: profileId,
  scrape_id: scrapeId,
  video_id: "video123",
  video_url: "https://...",
  views: 1000000,
  likes: 50000,
  comments: 5000,
  // engagement_rate is auto-calculated
});

// Get videos sorted by engagement
const videos = await getProfileVideos(profileId, {
  orderBy: "engagement_rate",
  orderDirection: "desc",
  limit: 20,
});

// Get statistics
const stats = await getProfileVideoStats(profileId);
```

### Subscriptions
```typescript
import { getUserSubscription, getUserVideoLimit } from "@/lib/db";

// Get user's subscription
const subscription = await getUserSubscription(userId);

// Get video limit (20 for free, 100 for paid)
const limit = await getUserVideoLimit(userId);
```

### Rate Limits
```typescript
import { checkRateLimit, incrementRateLimit } from "@/lib/db";

// Check if user can perform action
const { allowed, remaining, resetAt } = await checkRateLimit(
  userId,
  "scrape"
);

if (allowed) {
  // Perform action
  await incrementRateLimit(userId, "scrape");
}
```

---

## ✅ Verification Checklist

After applying migrations, verify:

- [ ] All 5 tables exist in Supabase Table Editor
- [ ] RLS is enabled (lock icon visible on each table)
- [ ] Indexes are created (check in Database → Indexes)
- [ ] Trigger function `handle_new_user()` exists
- [ ] New user signup creates free subscription automatically
- [ ] TypeScript types compile without errors
- [ ] Database utility functions can be imported

---

## 🐛 Troubleshooting

### "relation does not exist" error
- **Solution:** Make sure you ran migrations in the correct order (001, 002, 003)
- Check that you're connected to the correct Supabase project

### RLS blocking all queries
- **Solution:** Verify you're authenticated when testing
- Check that RLS policies were applied correctly
- Review policy conditions in `002_rls_policies.sql`

### Auto-subscription not working
- **Solution:** Verify `003_initial_user_subscription.sql` was executed
- Check that function `handle_new_user()` exists in Database → Functions
- Test by creating a new user account

### TypeScript errors
- **Solution:** Make sure `types/database.types.ts` is up to date
- Restart your TypeScript server in your IDE
- Run `npm run build` to check for type errors

---

## 📚 Next Steps

Now that the database is set up:

1. **Phase 4:** Integrate Apify TikTok scraper
2. **Phase 5:** Implement data normalization and storage
3. **Phase 6:** Build frontend results page

The database is ready to store scraped TikTok data! 🎉

