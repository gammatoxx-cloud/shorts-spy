import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  saveVideo,
  getSavedVideos,
  unsaveVideo,
  getSavedStatusForVideos,
} from "@/lib/db/saved-videos";

/**
 * POST /api/saved-videos
 * Save a video for the authenticated user
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { video_id, platform = "tiktok" } = body;

    if (!video_id) {
      return NextResponse.json(
        { error: "video_id is required" },
        { status: 400 }
      );
    }

    if (platform !== "tiktok" && platform !== "instagram") {
      return NextResponse.json(
        { error: "platform must be 'tiktok' or 'instagram'" },
        { status: 400 }
      );
    }

    // Try to save the video (saveVideo will handle errors)
    try {
      console.log("Attempting to save video:", { user_id: user.id, video_id, platform });
      const savedVideo = await saveVideo(user.id, video_id, platform as "tiktok" | "instagram");
      console.log("Video saved successfully:", savedVideo);
      return NextResponse.json({
        success: true,
        saved_video: savedVideo,
      });
    } catch (saveError: any) {
      console.error("Error in saveVideo:", saveError);
      console.error("Error details:", {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
      });
      
      // If it's a unique constraint violation, the video is already saved
      if (saveError.code === "23505") {
        return NextResponse.json(
          {
            error: "Video already saved",
            message: "This video is already in your saved content",
          },
          { status: 409 }
        );
      }
      
      // If it's a type mismatch error (UUID vs TEXT), provide helpful message
      if (saveError.code === "42804" || saveError.message?.includes("invalid input syntax for type uuid")) {
        return NextResponse.json(
          {
            error: "Database schema mismatch",
            message: "The saved_videos table needs to be updated. Please run migration 009_fix_saved_videos_video_id_type.sql",
          },
          { status: 500 }
        );
      }
      
      // Re-throw to be caught by outer catch
      throw saveError;
    }
  } catch (error: any) {
    console.error("Error saving video:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/saved-videos
 * Get all saved videos for the authenticated user
 * Query params:
 *   - video_ids: comma-separated list of video IDs to check saved status (returns boolean map)
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

    const { searchParams } = new URL(request.url);
    const videoIdsParam = searchParams.get("video_ids");
    const platformParam = searchParams.get("platform") || "tiktok";

    // If video_ids param is provided, return saved status for those videos
    if (videoIdsParam) {
      const videoIds = videoIdsParam.split(",").filter((id) => id.trim());
      const platform = (platformParam === "instagram" ? "instagram" : "tiktok") as "tiktok" | "instagram";
      const savedStatus = await getSavedStatusForVideos(user.id, videoIds, platform);
      return NextResponse.json({ saved_status: savedStatus });
    }

    // Otherwise, return all saved videos with details
    const savedVideos = await getSavedVideos(user.id);

    return NextResponse.json({
      videos: savedVideos,
      count: savedVideos.length,
    });
  } catch (error: any) {
    console.error("Error fetching saved videos:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-videos
 * Remove a saved video
 */
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { video_id, platform = "tiktok" } = body;

    if (!video_id) {
      return NextResponse.json(
        { error: "video_id is required" },
        { status: 400 }
      );
    }

    if (platform !== "tiktok" && platform !== "instagram") {
      return NextResponse.json(
        { error: "platform must be 'tiktok' or 'instagram'" },
        { status: 400 }
      );
    }

    await unsaveVideo(user.id, video_id, platform as "tiktok" | "instagram");

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error unsaving video:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

