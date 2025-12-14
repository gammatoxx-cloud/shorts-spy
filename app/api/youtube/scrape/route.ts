import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startYoutubeScrape } from "@/lib/apify/youtube-scraper";
import {
  getProfileByUsername,
  upsertProfile,
  createScrape,
  updateScrapeStatus,
  checkRateLimit,
  incrementRateLimit,
  getUserVideoLimit,
} from "@/lib/db";

export const maxDuration = 300; // 5 minutes for Vercel

/**
 * POST /api/youtube/scrape
 * Start a new YouTube Shorts scraping job
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, video_count } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Get user's video limit and validate requested count
    const userVideoLimit = await getUserVideoLimit(user.id);
    const requestedVideoCount = video_count
      ? parseInt(video_count, 10)
      : userVideoLimit;

    // Validate video count
    if (isNaN(requestedVideoCount) || requestedVideoCount < 1) {
      return NextResponse.json(
        { error: "Video count must be at least 1" },
        { status: 400 }
      );
    }

    if (requestedVideoCount > userVideoLimit) {
      return NextResponse.json(
        {
          error: "Video count exceeds your subscription limit",
          message: `You can analyze up to ${userVideoLimit} shorts. ${userVideoLimit === 20 ? "Upgrade to paid to analyze up to 100 shorts." : ""}`
        },
        { status: 403 }
      );
    }

    // Rate limit check (temporarily disabled for testing - re-enable before going live)
    const DISABLE_RATE_LIMIT = true; // Temporarily always true for testing

    if (!DISABLE_RATE_LIMIT) {
      const rateLimitCheck = await checkRateLimit(user.id, "scrape");
      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `You have reached the daily limit of 10 scrapes. Try again after ${rateLimitCheck.resetAt.toISOString()}`,
            resetAt: rateLimitCheck.resetAt.toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Normalize username (channel name)
    const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();

    // Check if profile exists and was recently scraped (48-hour cache)
    const existingProfile = await getProfileByUsername(normalizedUsername, "youtube");
    if (existingProfile?.last_scraped_at) {
      const lastScraped = new Date(existingProfile.last_scraped_at);
      const hoursSinceScrape =
        (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60);

      if (hoursSinceScrape < 48) {
        // Return cached data only if there are actually shorts
        const { getProfileShorts, getProfileShortStats } = await import(
          "@/lib/db"
        );
        const shorts = await getProfileShorts(existingProfile.id, {
          limit: requestedVideoCount,
          orderBy: "engagement_rate",
          orderDirection: "desc",
        });

        // Only return cached data if we have shorts
        // If no shorts, proceed to scrape fresh data
        if (shorts && shorts.length > 0) {
          const stats = await getProfileShortStats(existingProfile.id);

          return NextResponse.json({
            message: "Using cached data",
            profile: existingProfile,
            videos: shorts,
            stats,
            cached: true,
            lastScraped: existingProfile.last_scraped_at,
            videoLimit: requestedVideoCount,
          });
        }
        // If no shorts in cache, continue to scrape
      }
    }

    // Create or get profile
    const profile = existingProfile
      ? existingProfile
      : await upsertProfile({
          username: normalizedUsername,
          platform: "youtube",
        });

    // Create scrape record
    const scrape = await createScrape({
      user_id: user.id,
      profile_id: profile.id,
      status: "pending",
      video_count: 0,
      requested_video_limit: requestedVideoCount,
      platform: "youtube",
    });

    // Start Apify actor (async - don't wait for completion)
    let apifyRunId: string | null = null;
    try {
      console.log(`Starting YouTube scrape for channel: ${normalizedUsername}, video count: ${requestedVideoCount}`);
      const run = await startYoutubeScrape(normalizedUsername, requestedVideoCount);
      apifyRunId = run.id;
      console.log(`YouTube Apify run started successfully. Run ID: ${apifyRunId}, Status: ${run.status}`);

      // Update scrape with Apify run ID
      await updateScrapeStatus(scrape.id, "running", {
        apify_run_id: apifyRunId,
        platform: "youtube",
      });
      console.log(`Updated scrape ${scrape.id} with run ID ${apifyRunId}`);
    } catch (error: any) {
      console.error("Error starting YouTube Apify run:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      });
      await updateScrapeStatus(scrape.id, "failed", {
        error_message: error.message || "Failed to start scraping job",
        platform: "youtube",
      });

      return NextResponse.json(
        {
          error: "Failed to start scraping job",
          message: error.message || "An error occurred while starting the scrape",
        },
        { status: 500 }
      );
    }

    // Increment rate limit (only if rate limiting is enabled)
    if (!DISABLE_RATE_LIMIT) {
      await incrementRateLimit(user.id, "scrape");
    }

    // Return scrape job info (client will poll for status)
    return NextResponse.json({
      message: "Scraping job started",
      scrape: {
        id: scrape.id,
        status: "running",
        apify_run_id: apifyRunId,
      },
      profile: {
        id: profile.id,
        username: profile.username,
      },
    });
  } catch (error: any) {
    console.error("Error in YouTube scrape endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
