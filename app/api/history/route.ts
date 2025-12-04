import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserScrapes } from "@/lib/db";

/**
 * GET /api/history
 * Get user's scrapes with profile information (paginated)
 * Query params: 
 *   - platform=tiktok|instagram (optional, defaults to all platforms)
 *   - page=number (optional, defaults to 1)
 *   - limit=number (optional, defaults to 20)
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(100, limit)); // Limit between 1 and 100
    const offset = (validPage - 1) * validLimit;

    // Get user's scrapes (already ordered by created_at DESC from getUserScrapes)
    let scrapes = await getUserScrapes(user.id);

    // Filter by platform if specified
    if (platform) {
      scrapes = scrapes.filter((scrape) => scrape.platform === platform);
    }

    // Calculate total count before pagination
    const totalCount = scrapes.length;
    const totalPages = Math.ceil(totalCount / validLimit);

    // Apply pagination
    const paginatedScrapes = scrapes.slice(offset, offset + validLimit);

    // Get profile info for each scrape
    const historySearches = await Promise.all(
      paginatedScrapes.map(async (scrape) => {
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
      searches: historySearches,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

