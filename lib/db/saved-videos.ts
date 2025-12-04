import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type SavedVideo = Database["public"]["Tables"]["saved_videos"]["Row"];
type SavedVideoInsert = Database["public"]["Tables"]["saved_videos"]["Insert"];

export interface SavedVideoWithDetails {
  id: string;
  video_id: string;
  video_url: string;
  description: string | null;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  engagement_rate: number;
  posted_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  saved_at: string;
  platform: "tiktok" | "instagram";
  creator: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Save a video for a user
 */
export async function saveVideo(
  userId: string,
  videoId: string,
  platform: "tiktok" | "instagram" = "tiktok"
): Promise<SavedVideo> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_videos")
    .insert({
      user_id: userId,
      video_id: videoId,
      platform: platform,
    })
    .select()
    .single();

  if (error) {
    // If it's a unique constraint violation, the video is already saved
    if (error.code === "23505") {
      // Return the existing record
      const { data: existing } = await supabase
        .from("saved_videos")
        .select()
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .eq("platform", platform)
        .single();
      if (existing) return existing;
    }
    throw error;
  }

  return data;
}

/**
 * Get all saved videos for a user with creator information
 */
export async function getSavedVideos(
  userId: string
): Promise<SavedVideoWithDetails[]> {
  const supabase = await createClient();

  // Get all saved videos for the user
  const { data: savedVideos, error: savedError } = await supabase
    .from("saved_videos")
    .select("id, created_at, video_id, platform")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) {
    console.error("Error fetching saved_videos:", savedError);
    throw savedError;
  }

  console.log(`Found ${savedVideos?.length || 0} saved video records for user ${userId}`);

  if (!savedVideos || savedVideos.length === 0) {
    return [];
  }

  // Separate TikTok and Instagram video IDs
  const tiktokVideoIds = savedVideos
    .filter((sv) => sv.platform === "tiktok")
    .map((sv) => sv.video_id);
  const instagramVideoIds = savedVideos
    .filter((sv) => sv.platform === "instagram")
    .map((sv) => sv.video_id);

  const allVideos: SavedVideoWithDetails[] = [];

  // Fetch TikTok videos if any
  if (tiktokVideoIds.length > 0) {
    console.log(`Fetching ${tiktokVideoIds.length} TikTok videos:`, tiktokVideoIds);
    const { data: tiktokVideos, error: tiktokError } = await supabase
      .from("tiktok_videos")
      .select(
        `
        id,
        video_id,
        video_url,
        description,
        thumbnail_url,
        views,
        likes,
        comments,
        shares,
        engagement_rate,
        posted_at,
        duration_seconds,
        created_at,
        profile_id,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .in("video_id", tiktokVideoIds);

    if (tiktokError) {
      console.error("Error fetching TikTok videos:", tiktokError);
    } else {
      console.log(`Found ${tiktokVideos?.length || 0} TikTok videos in database`);
      if (tiktokVideos && tiktokVideos.length > 0) {
        // Create a map of saved_videos by video_id for quick lookup
        const savedVideosMap = new Map(
          savedVideos
            .filter((sv) => sv.platform === "tiktok")
            .map((sv) => [sv.video_id, sv])
        );

        tiktokVideos.forEach((video: any) => {
          const savedVideo = savedVideosMap.get(video.video_id);
          if (savedVideo) {
            const profile = video.profiles as any;
            allVideos.push({
              id: video.id,
              video_id: video.video_id,
              video_url: video.video_url,
              description: video.description,
              thumbnail_url: video.thumbnail_url,
              views: video.views,
              likes: video.likes,
              comments: video.comments,
              shares: video.shares,
              engagement_rate: video.engagement_rate,
              posted_at: video.posted_at,
              duration_seconds: video.duration_seconds,
              created_at: video.created_at,
              saved_at: savedVideo.created_at,
              platform: "tiktok" as const,
              creator: {
                id: profile?.id || "",
                username: profile?.username || "",
                display_name: profile?.display_name || null,
                avatar_url: profile?.avatar_url || null,
              },
            });
          }
        });
      }
    }
  }

  // Fetch Instagram videos if any
  if (instagramVideoIds.length > 0) {
    const { data: instagramVideos, error: instagramError } = await supabase
      .from("instagram_reels")
      .select(
        `
        id,
        video_id,
        video_url,
        description,
        thumbnail_url,
        views,
        likes,
        comments,
        shares,
        engagement_rate,
        posted_at,
        duration_seconds,
        created_at,
        profile_id,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .in("video_id", instagramVideoIds);

    if (instagramError) {
      console.error("Error fetching Instagram videos:", instagramError);
    } else if (instagramVideos) {
      // Create a map of saved_videos by video_id for quick lookup
      const savedVideosMap = new Map(
        savedVideos
          .filter((sv) => sv.platform === "instagram")
          .map((sv) => [sv.video_id, sv])
      );

      instagramVideos.forEach((video: any) => {
        const savedVideo = savedVideosMap.get(video.video_id);
        if (savedVideo) {
          const profile = video.profiles as any;
          allVideos.push({
            id: video.id,
            video_id: video.video_id,
            video_url: video.video_url,
            description: video.description,
            thumbnail_url: video.thumbnail_url,
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            shares: video.shares,
            engagement_rate: video.engagement_rate,
            posted_at: video.posted_at,
            duration_seconds: video.duration_seconds,
            created_at: video.created_at,
            saved_at: savedVideo.created_at,
            platform: "instagram" as const,
            creator: {
              id: profile?.id || "",
              username: profile?.username || "",
              display_name: profile?.display_name || null,
              avatar_url: profile?.avatar_url || null,
            },
          });
        }
      });
    }
  }

  console.log(`Returning ${allVideos.length} total saved videos with details`);

  // Sort by saved_at (most recent first)
  return allVideos.sort((a, b) => 
    new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
  );
}

/**
 * Check if a video is saved by a user
 */
export async function isVideoSaved(
  userId: string,
  videoId: string,
  platform: "tiktok" | "instagram" = "tiktok"
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_videos")
    .select("id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .eq("platform", platform)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return false;
    }
    throw error;
  }

  return !!data;
}

/**
 * Remove a saved video
 */
export async function unsaveVideo(
  userId: string,
  videoId: string,
  platform: "tiktok" | "instagram" = "tiktok"
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("saved_videos")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .eq("platform", platform);

  if (error) throw error;
}

/**
 * Get saved status for multiple videos at once
 */
export async function getSavedStatusForVideos(
  userId: string,
  videoIds: string[],
  platform: "tiktok" | "instagram" = "tiktok"
): Promise<Record<string, boolean>> {
  if (videoIds.length === 0) return {};

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_videos")
    .select("video_id")
    .eq("user_id", userId)
    .eq("platform", platform)
    .in("video_id", videoIds);

  if (error) throw error;

  const savedMap: Record<string, boolean> = {};
  videoIds.forEach((id) => {
    savedMap[id] = false;
  });

  if (data) {
    data.forEach((item) => {
      savedMap[item.video_id] = true;
    });
  }

  return savedMap;
}

