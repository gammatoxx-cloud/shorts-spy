import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserScrapes } from "@/lib/db";

/**
 * GET /api/recent-searches
 * Get user's recent scrapes with profile information
 * Query params: ?platform=tiktok|instagram (optional, defaults to all platforms)
 */
export async function GET(request: NextRequest) {
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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") as "tiktok" | "instagram" | null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    // Get user's scrapes
    let scrapes = await getUserScrapes(user.id);

    // Filter by platform if specified
    if (platform) {
      scrapes = scrapes.filter((scrape) => scrape.platform === platform);
    }

    // Store total before slicing
    const total = scrapes.length;

    // Get profile info for each scrape (up to limit)
    const recentSearches = await Promise.all(
      scrapes.slice(0, limit).map(async (scrape) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, platform")
          .eq("id", scrape.profile_id)
          .single();

        return {
          scrape: {
            id: scrape.id,
            status: scrape.status,
            video_count: scrape.video_count,
            created_at: scrape.created_at,
            completed_at: scrape.completed_at,
            platform: scrape.platform,
          },
          profile: profile || null,
        };
      })
    );

    return NextResponse.json({
      searches: recentSearches,
      total: total,
    });
  } catch (error: any) {
    console.error("Error fetching recent searches:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

