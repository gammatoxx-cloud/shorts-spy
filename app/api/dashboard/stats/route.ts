import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserScrapes } from "@/lib/db/scrapes";
import { getSavedVideos } from "@/lib/db/saved-videos";
import { getUserSubscription, getUserVideoLimit } from "@/lib/db/subscriptions";
import { getRateLimitStatus } from "@/lib/db/rate-limits";

/**
 * GET /api/dashboard/stats
 * Get aggregated dashboard statistics for the authenticated user
 * Optimized to minimize database queries using batching and JOINs
 */
export async function GET(request: NextRequest) {
  try {
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

    // Fetch all data in parallel - optimized queries
    const [scrapes, savedVideos, subscription, rateLimitStatus] = await Promise.all([
      getUserScrapes(user.id),
      getSavedVideos(user.id),
      getUserSubscription(user.id),
      getRateLimitStatus(user.id),
    ]);

    // Calculate scrape statistics
    const totalScrapes = scrapes.length;
    // Handle null platforms (default to 'tiktok' for backward compatibility)
    const tiktokScrapes = scrapes.filter((s) => (s.platform || "tiktok") === "tiktok").length;
    const instagramScrapes = scrapes.filter((s) => s.platform === "instagram").length;
    const completedScrapes = scrapes.filter((s) => s.status === "completed").length;
    const pendingScrapes = scrapes.filter((s) => s.status === "pending" || s.status === "running").length;

    // OPTIMIZATION 1: Batch fetch profiles for recent searches (last 5)
    const recentScrapes = scrapes.slice(0, 5);
    const recentProfileIds = recentScrapes.map(s => s.profile_id).filter(Boolean);
    
    let recentProfilesMap = new Map();
    if (recentProfileIds.length > 0) {
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, platform")
        .in("id", recentProfileIds);
      
      if (recentProfiles) {
        recentProfilesMap = new Map(recentProfiles.map(p => [p.id, p]));
      }
    }

    const recentSearches = recentScrapes.map(scrape => ({
      scrape: {
        id: scrape.id,
        status: scrape.status,
        video_count: scrape.video_count,
        created_at: scrape.created_at,
        completed_at: scrape.completed_at,
        platform: scrape.platform || "tiktok",
      },
      profile: recentProfilesMap.get(scrape.profile_id) || null,
    }));

    // Get recent saved videos (last 5)
    const recentSavedVideos = savedVideos.slice(0, 5);

    // OPTIMIZATION 2: Batch fetch all unique profiles for most analyzed creators
    const uniqueProfileIds = [...new Set(scrapes.map(s => s.profile_id).filter(Boolean))];
    
    let allProfilesMap = new Map();
    if (uniqueProfileIds.length > 0) {
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, platform")
        .in("id", uniqueProfileIds);
      
      if (allProfiles) {
        allProfilesMap = new Map(allProfiles.map(p => [p.id, p]));
      }
    }

    // Count scrapes per profile using the batched profile data
    const profileCounts = new Map<string, { count: number; profile: any }>();
    scrapes.forEach(scrape => {
      const profile = allProfilesMap.get(scrape.profile_id);
      if (profile) {
        const existing = profileCounts.get(scrape.profile_id);
        if (existing) {
          existing.count += 1;
        } else {
          profileCounts.set(scrape.profile_id, { count: 1, profile });
        }
      }
    });

    const mostAnalyzedCreators = Array.from(profileCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        profile: item.profile,
        analysis_count: item.count,
      }));

    // Get subscription info
    const videoLimit = await getUserVideoLimit(user.id);
    const subscriptionTier = subscription?.subscription_tier || "free";
    const subscriptionStatus = subscription?.status || "active";

    // Calculate total videos analyzed
    const totalVideosAnalyzed = scrapes
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + (s.video_count || 0), 0);

    return NextResponse.json({
      stats: {
        total_scrapes: totalScrapes,
        tiktok_scrapes: tiktokScrapes,
        instagram_scrapes: instagramScrapes,
        completed_scrapes: completedScrapes,
        pending_scrapes: pendingScrapes,
        total_videos_analyzed: totalVideosAnalyzed,
        saved_videos_count: savedVideos.length,
      },
      subscription: {
        tier: subscriptionTier,
        status: subscriptionStatus,
        video_limit: videoLimit,
        current_period_end: subscription?.current_period_end || null,
      },
      rate_limits: {
        scrape: {
          used: rateLimitStatus.scrape.used,
          limit: rateLimitStatus.scrape.limit,
          remaining: rateLimitStatus.scrape.limit - rateLimitStatus.scrape.used,
          reset_at: rateLimitStatus.scrape.resetAt.toISOString(),
        },
        refresh: {
          used: rateLimitStatus.refresh.used,
          limit: rateLimitStatus.refresh.limit,
          remaining: rateLimitStatus.refresh.limit - rateLimitStatus.refresh.used,
          reset_at: rateLimitStatus.refresh.resetAt.toISOString(),
        },
      },
      recent_searches: recentSearches,
      recent_saved_videos: recentSavedVideos,
      most_analyzed_creators: mostAnalyzedCreators,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

