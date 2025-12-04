# Phase 4: Apify Integration & Scraping Logic - Complete ✅

## Implementation Summary

Phase 4 is complete! Apify client SDK is integrated, scraping endpoints are created, and async job handling is implemented with polling.

---

## 📁 Files Created

### Apify Integration
- `lib/apify/client.ts` - Apify client setup and configuration
- `lib/apify/scraper.ts` - Scraping logic, job management, and data parsing
- `lib/apify/index.ts` - Central export file

### API Endpoints
- `app/api/scrape/route.ts` - POST endpoint to start scraping jobs
- `app/api/scrape/status/[runId]/route.ts` - GET endpoint to check job status

---

## 🔧 Setup Required

### 1. Get Apify API Token

1. Go to [https://console.apify.com](https://console.apify.com)
2. Sign up or log in
3. Navigate to **Settings** → **Integrations** → **API tokens**
4. Copy your API token
5. Add it to `.env.local`:
   ```env
   APIFY_API_TOKEN=your_apify_api_token_here
   ```

### 2. Verify Actor Availability

The integration uses the `clockworks/tiktok-scraper` actor. Verify:
- The actor is available in Apify
- You have sufficient Apify credits
- The actor accepts the `username` input parameter

---

## 🚀 How It Works

### Scraping Flow

1. **User initiates scrape** → `POST /api/scrape`
   - Validates authentication
   - Checks rate limits (10 scrapes/day)
   - Checks 48-hour cache
   - Creates scrape record in database
   - Starts Apify actor run (async)
   - Returns scrape job info

2. **Client polls for status** → `GET /api/scrape/status/[runId]`
   - Checks Apify run status
   - If completed: processes results, stores videos, updates profile
   - Returns current status or completed data

3. **Data Processing**
   - Parses Apify output into normalized format
   - Calculates engagement rates
   - Stores videos in database
   - Updates profile metadata

### Features

✅ **Rate Limiting** - 10 scrapes per user per day  
✅ **Caching** - 48-hour cache to minimize API calls  
✅ **Async Processing** - Non-blocking job execution  
✅ **Error Handling** - Comprehensive error messages and retries  
✅ **Status Polling** - Real-time job status updates  
✅ **Data Normalization** - Flexible parsing for different Apify output formats  

---

## 📡 API Endpoints

### POST `/api/scrape`

Start a new scraping job.

**Request:**
```json
{
  "username": "charlidamelio"
}
```

**Response (Job Started):**
```json
{
  "message": "Scraping job started",
  "scrape": {
    "id": "uuid",
    "status": "running",
    "apify_run_id": "abc123"
  },
  "profile": {
    "id": "uuid",
    "username": "charlidamelio"
  }
}
```

**Response (Cached Data):**
```json
{
  "message": "Using cached data",
  "profile": { ... },
  "videos": [ ... ],
  "stats": { ... },
  "cached": true,
  "lastScraped": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `400` - Missing username
- `429` - Rate limit exceeded
- `500` - Server error

### GET `/api/scrape/status/[runId]`

Check scraping job status.

**Response (Running):**
```json
{
  "status": "running",
  "scrape": {
    "id": "uuid",
    "status": "running",
    "apify_run_id": "abc123"
  },
  "apify": {
    "status": "RUNNING",
    "startedAt": "2024-01-01T00:00:00Z",
    "finishedAt": null
  }
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "scrape": {
    "id": "uuid",
    "status": "completed",
    "video_count": 50
  },
  "profile": { ... },
  "videos": [ ... ],
  "stats": {
    "totalVideos": 50,
    "totalViews": 10000000,
    "averageEngagementRate": 5.5,
    "bestVideo": { ... }
  }
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "scrape": {
    "id": "uuid",
    "status": "failed",
    "apify_run_id": "abc123"
  },
  "apify": {
    "status": "FAILED",
    "startedAt": "2024-01-01T00:00:00Z",
    "finishedAt": "2024-01-01T00:05:00Z"
  }
}
```

---

## 🔄 Client-Side Polling Example

```typescript
async function scrapeTikTok(username: string) {
  // Start scrape
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const { scrape, cached } = await response.json();

  // If cached, we're done
  if (cached) {
    return scrape;
  }

  // Poll for status
  const runId = scrape.apify_run_id;
  let status = "running";

  while (status === "running" || status === "pending") {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(`/api/scrape/status/${runId}`);
    const statusData = await statusResponse.json();

    status = statusData.status;

    if (status === "completed") {
      return statusData; // Return videos and stats
    }

    if (status === "failed") {
      throw new Error("Scraping failed");
    }
  }
}
```

---

## 📊 Apify Output Parsing

The `parseApifyOutput` function handles various possible field names from Apify:

**Supported Fields:**
- `video_id`: `id`, `videoId`, `video_id`, `aweme_id`
- `video_url`: `url`, `videoUrl`, `video_url`, `webVideoUrl`
- `description`: `text`, `description`, `caption`
- `thumbnail_url`: `cover`, `thumbnailUrl`, `thumbnail_url`, `dynamicCover`
- `views`: `playCount`, `views`, `viewCount`
- `likes`: `diggCount`, `likes`, `likeCount`
- `comments`: `commentCount`, `comments`
- `shares`: `shareCount`, `shares`
- `posted_at`: `createTime` (Unix timestamp), `postedAt`, `createdAt`
- `duration_seconds`: `videoDuration`, `duration`

**Note:** If the actual Apify output format differs, you may need to adjust `parseApifyOutput` in `lib/apify/scraper.ts`.

---

## 🧪 Testing

### Test with Real TikTok Username

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Make sure you have:**
   - Supabase credentials in `.env.local`
   - Apify API token in `.env.local`
   - Database migrations applied (Phase 3)

3. **Test the scrape endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/scrape \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{"username": "charlidamelio"}'
   ```

4. **Poll for status:**
   ```bash
   curl http://localhost:3000/api/scrape/status/RUN_ID \
     -H "Cookie: your-auth-cookie"
   ```

### Expected Behavior

- ✅ Scrape job starts immediately
- ✅ Status endpoint returns "running" initially
- ✅ After 1-3 minutes, status becomes "completed"
- ✅ Videos are stored in database
- ✅ Profile metadata is updated
- ✅ Engagement rates are calculated

---

## 🐛 Troubleshooting

### "APIFY_API_TOKEN environment variable is not set"
- **Solution:** Add `APIFY_API_TOKEN` to `.env.local` and restart dev server

### "Actor not found" or "Actor unavailable"
- **Solution:** Verify `clockworks/tiktok-scraper` exists in Apify
- Check if you have sufficient Apify credits
- Verify actor accepts `username` input parameter

### "Rate limit exceeded"
- **Solution:** Wait 24 hours or check rate limit status
- Free tier: 10 scrapes per day

### "Run not found in Apify"
- **Solution:** Verify the run ID is correct
- Check Apify dashboard for run status
- Ensure run belongs to your Apify account

### Parsing errors or missing fields
- **Solution:** Check actual Apify output format
- Adjust `parseApifyOutput` function if needed
- Add logging to see raw Apify response

### Scrape takes too long
- **Solution:** This is normal - Apify runs can take 1-5 minutes
- Increase polling interval on client side
- Consider showing progress indicator

---

## 📝 Next Steps

1. **Test with real TikTok username** to verify parsing works
2. **Adjust `parseApifyOutput`** if Apify output format differs
3. **Phase 5:** Build frontend to display results
4. **Phase 6:** Add results page with sorting and insights

---

## 💡 Notes

- The integration uses **polling** instead of webhooks for simplicity
- Jobs are processed asynchronously to avoid timeouts
- 48-hour caching minimizes Apify API calls and costs
- Rate limiting prevents abuse and controls costs
- Error handling includes retries and clear error messages

If you encounter issues with the Apify output format, please share an example JSON response and I can adjust the parser accordingly! 🚀

