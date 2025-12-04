import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getProfileByUsername,
  getProfileReels,
  getProfileReelStats,
  getUserVideoLimit,
} from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createClient();
    const username = params.username.toLowerCase();

    // Get authenticated user (optional - for video limits)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get creator profile (Instagram platform)
    const profile = await getProfileByUsername(username, "instagram");

    if (!profile) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Get user's video limit (if authenticated)
    const videoLimit = user ? await getUserVideoLimit(user.id) : 20;

    // Get reels for this creator (sorted by engagement rate by default)
    const reels = await getProfileReels(profile.id, {
      limit: videoLimit,
      orderBy: "engagement_rate",
      orderDirection: "desc",
    });

    // Get reel statistics
    const stats = await getProfileReelStats(profile.id);

    return NextResponse.json({
      profile,
      videos: reels || [],
      stats: {
        ...stats,
        postingFrequency: stats.postingFrequency || {
          perWeek: 0,
          perMonth: 0,
        },
      },
      cacheTimestamp: profile.last_scraped_at,
      videoLimit,
    });
  } catch (error) {
    console.error("Error fetching Instagram creator data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

