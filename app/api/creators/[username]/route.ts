import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getProfileByUsername,
  getProfileVideos,
  getProfileVideoStats,
} from "@/lib/db";
import { getUserVideoLimit } from "@/lib/db";

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

    // Get creator profile (TikTok platform by default)
    const profile = await getProfileByUsername(username, "tiktok");

    if (!profile) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Get user's video limit (if authenticated)
    const videoLimit = user ? await getUserVideoLimit(user.id) : 20;

    // Get videos for this creator (sorted by engagement rate by default)
    const videos = await getProfileVideos(profile.id, {
      limit: videoLimit,
      orderBy: "engagement_rate",
      orderDirection: "desc",
    });

    // Get video statistics
    const stats = await getProfileVideoStats(profile.id);

    return NextResponse.json({
      profile,
      videos: videos || [],
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
    console.error("Error fetching creator data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
