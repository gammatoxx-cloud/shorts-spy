# Data Normalization & Storage - Verification ✅

This document verifies that all data normalization and storage steps are complete and properly implemented.

---

## ✅ Step 1: Parse Apify Response Format

**Status:** ✅ Complete

**Location:** `lib/apify/scraper.ts` - `parseApifyOutput()` function

**Implementation:**
- Parses raw Apify dataset items
- Handles nested properties (`videoMeta.coverUrl`, `authorMeta.name`)
- Extracts video ID from URL
- Filters out ads (`isAd: true`)
- Maps all fields to normalized format

**Fields Mapped:**
- `webVideoUrl` → `video_url`
- `videoMeta.coverUrl` → `thumbnail_url`
- `text` → `description`
- `playCount` → `views`
- `diggCount` → `likes`
- `commentCount` → `comments`
- `shareCount` → `shares`
- `videoMeta.duration` → `duration_seconds`
- `createTimeISO` → `posted_at`
- `authorMeta.name` → `display_name` (profile)
- `authorMeta.avatar` → `avatar_url` (profile)
- `authorMeta.fans` → `follower_count` (profile)

**Code:**
```typescript
export function parseApifyOutput(items: any[]): {
  videos: Array<{...}>;
  profile: {...};
}
```

---

## ✅ Step 2: Normalize Data to Our Schema

**Status:** ✅ Complete

**Location:** `lib/apify/scraper.ts` - `parseApifyOutput()` function

**Implementation:**
- Returns data in exact format matching database schema
- All fields match `TikTokVideoInsert` type
- Profile data matches `ProfileInsert` type
- Data types are correct (numbers, strings, nulls)
- Engagement rate is calculated during insertion (not in parser)

**Schema Compliance:**
- ✅ `video_id` (string, unique)
- ✅ `video_url` (string, required)
- ✅ `description` (string | null)
- ✅ `thumbnail_url` (string | null)
- ✅ `views` (number, default 0)
- ✅ `likes` (number, default 0)
- ✅ `comments` (number, default 0)
- ✅ `shares` (number | null)
- ✅ `posted_at` (ISO string | null)
- ✅ `duration_seconds` (number | null)

---

## ✅ Step 3: Create Database Insert Functions

**Status:** ✅ Complete

**Location:** `lib/db/videos.ts`

**Functions Created:**

### `upsertVideo(video: TikTokVideoInsert)`
- Inserts or updates a single video
- Calculates engagement rate automatically
- Handles duplicates via `onConflict: "video_id"`

### `insertVideos(videos: TikTokVideoInsert[])`
- Batch insert/update multiple videos
- Calculates engagement rates for all videos
- More efficient for bulk operations
- Handles duplicates via `onConflict: "video_id"`

**Code:**
```typescript
export async function upsertVideo(video: TikTokVideoInsert): Promise<TikTokVideo>
export async function insertVideos(videos: TikTokVideoInsert[]): Promise<TikTokVideo[]>
```

**Usage in API:**
```typescript
// In app/api/scrape/status/[runId]/route.ts
await insertVideos(videoInserts);
```

---

## ✅ Step 4: Handle Duplicate Videos (Upsert Logic)

**Status:** ✅ Complete

**Location:** `lib/db/videos.ts` - Both `upsertVideo` and `insertVideos`

**Implementation:**
- Uses Supabase `upsert()` with `onConflict: "video_id"`
- `ignoreDuplicates: false` means existing records are **updated** (not ignored)
- Database has unique constraint on `video_id` (from migration)
- If video exists, it updates with new data (views, likes, etc.)
- If video doesn't exist, it inserts new record

**Database Constraint:**
```sql
video_id TEXT NOT NULL UNIQUE
```

**Upsert Configuration:**
```typescript
.upsert(videoData, {
  onConflict: "video_id",
  ignoreDuplicates: false, // Updates existing records
})
```

**Behavior:**
- ✅ New video → Inserted
- ✅ Existing video → Updated with latest metrics
- ✅ Same video from different scrapes → Updated (keeps latest scrape_id)

---

## ✅ Step 5: Update Profile Metadata

**Status:** ✅ Complete

**Location:** `app/api/scrape/status/[runId]/route.ts`

**Implementation:**
- Updates `last_scraped_at` timestamp
- Updates `display_name` if available from Apify
- Updates `avatar_url` if available from Apify
- Updates `follower_count` if available from Apify
- Preserves existing values if new data is not available

**Code:**
```typescript
// Update last_scraped_at
await updateProfileLastScraped(scrape.profile_id, new Date());

// Update profile metadata if available
if (profile.display_name || profile.avatar_url || profile.follower_count !== null) {
  await supabase
    .from("profiles")
    .update({
      display_name: profile.display_name || profileRecord.display_name,
      avatar_url: profile.avatar_url || profileRecord.avatar_url,
      follower_count: profile.follower_count ?? profileRecord.follower_count,
    })
    .eq("id", scrape.profile_id);
}
```

**Profile Update Functions:**
- `updateProfileLastScraped()` - Updates timestamp
- Direct Supabase update - Updates metadata fields

---

## 🔄 Complete Data Flow

### 1. Apify Returns Data
```
Raw Apify Dataset Items
↓
parseApifyOutput()
↓
Normalized { videos, profile }
```

### 2. Profile Processing
```
Normalized profile data
↓
updateProfileLastScraped() → Updates timestamp
↓
Supabase update → Updates metadata (name, avatar, followers)
```

### 3. Video Processing
```
Normalized video array
↓
Map to include profile_id and scrape_id
↓
insertVideos() → Batch upsert
↓
Engagement rate calculated automatically
↓
Duplicate handling via onConflict: "video_id"
↓
Videos stored in database
```

---

## ✅ Verification Checklist

- [x] Apify response is parsed correctly
- [x] Data is normalized to match database schema
- [x] Database insert functions exist (`upsertVideo`, `insertVideos`)
- [x] Duplicate videos are handled (upsert by `video_id`)
- [x] Profile metadata is updated (`last_scraped_at`, `display_name`, `avatar_url`, `follower_count`)
- [x] Engagement rates are calculated automatically
- [x] Batch operations are supported for efficiency
- [x] Error handling is in place
- [x] Type safety is maintained (TypeScript types)

---

## 📝 Additional Features

### Automatic Engagement Rate Calculation
- Calculated in `insertVideos()` and `upsertVideo()`
- Formula: `(likes + comments) / views * 100`
- Stored as `NUMERIC(10, 4)` in database
- Handles edge cases (views = 0)

### Error Handling
- Database errors are caught and logged
- Failed scrapes are marked with error messages
- Partial failures don't break the entire process

### Type Safety
- All functions use TypeScript types from `database.types.ts`
- Compile-time validation ensures schema compliance
- IntelliSense support for all fields

---

## 🎯 Summary

All data normalization and storage steps are **complete and verified**:

1. ✅ **Parse Apify response** - `parseApifyOutput()` handles all field mappings
2. ✅ **Normalize to schema** - Data matches database types exactly
3. ✅ **Database insert functions** - `upsertVideo()` and `insertVideos()` ready
4. ✅ **Duplicate handling** - Upsert logic via `onConflict: "video_id"`
5. ✅ **Profile metadata updates** - Timestamp and metadata fields updated

The system is ready to process and store TikTok video data from Apify! 🚀

