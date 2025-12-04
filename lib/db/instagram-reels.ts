import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type InstagramReel = Database["public"]["Tables"]["instagram_reels"]["Row"];
type InstagramReelInsert = Database["public"]["Tables"]["instagram_reels"]["Insert"];

/**
 * Calculate engagement rate: (likes + comments + shares) / views * 100
 */
function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): number {
  if (views === 0) return 0;
  return Number(((likes + comments + shares) / views) * 100).toFixed(4);
}

/**
 * Insert or update an Instagram reel (upsert by video_id)
 */
export async function upsertInstagramReel(
  reel: InstagramReelInsert
): Promise<InstagramReel> {
  const supabase = await createClient();

  // Calculate engagement rate if not provided
  const engagementRate =
    reel.engagement_rate ??
    calculateEngagementRate(
      reel.likes || 0,
      reel.comments || 0,
      reel.shares || 0,
      reel.views || 0
    );

  const reelData: InstagramReelInsert = {
    ...reel,
    engagement_rate: engagementRate,
  };

  const { data, error } = await supabase
    .from("instagram_reels")
    .upsert(reelData, {
      onConflict: "video_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insert multiple Instagram reels in a batch
 */
export async function insertInstagramReels(
  reels: InstagramReelInsert[]
): Promise<InstagramReel[]> {
  const supabase = await createClient();

  // Calculate engagement rates for all reels
  const reelsWithEngagement = reels.map((reel) => ({
    ...reel,
    engagement_rate:
      reel.engagement_rate ??
      calculateEngagementRate(
        reel.likes || 0,
        reel.comments || 0,
        reel.shares || 0,
        reel.views || 0
      ),
  }));

  const { data, error } = await supabase
    .from("instagram_reels")
    .upsert(reelsWithEngagement, {
      onConflict: "video_id",
      ignoreDuplicates: false,
    })
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Get Instagram reels for a profile
 */
export async function getProfileReels(
  profileId: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: "engagement_rate" | "views" | "likes" | "comments" | "posted_at";
    orderDirection?: "asc" | "desc";
  }
): Promise<InstagramReel[]> {
  const supabase = await createClient();

  let query = supabase
    .from("instagram_reels")
    .select("*")
    .eq("profile_id", profileId);

  // Apply ordering
  const orderBy = options?.orderBy || "engagement_rate";
  const orderDirection = options?.orderDirection || "desc";
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get Instagram reels for a specific scrape
 */
export async function getScrapeReels(scrapeId: string): Promise<InstagramReel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instagram_reels")
    .select("*")
    .eq("scrape_id", scrapeId)
    .order("engagement_rate", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get Instagram reel statistics for a profile
 */
export async function getProfileReelStats(profileId: string): Promise<{
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  bestVideo: InstagramReel | null;
  postingFrequency: {
    perWeek: number;
    perMonth: number;
  };
}> {
  const supabase = await createClient();

  const { data: reels, error } = await supabase
    .from("instagram_reels")
    .select("*")
    .eq("profile_id", profileId);

  if (error) throw error;

  if (!reels || reels.length === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      averageViews: 0,
      averageLikes: 0,
      averageEngagementRate: 0,
      bestVideo: null,
      postingFrequency: {
        perWeek: 0,
        perMonth: 0,
      },
    };
  }

  const totalVideos = reels.length;
  const totalViews = reels.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = reels.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = reels.reduce((sum, v) => sum + v.comments, 0);
  const averageViews = totalVideos > 0 ? totalViews / totalVideos : 0;
  const averageLikes = totalVideos > 0 ? totalLikes / totalVideos : 0;
  const averageEngagementRate =
    reels.reduce((sum, v) => sum + Number(v.engagement_rate), 0) / totalVideos;

  const bestVideo =
    reels.reduce((best, current) =>
      Number(current.engagement_rate) > Number(best.engagement_rate)
        ? current
        : best
    ) || null;

  // Calculate posting frequency
  const reelsWithDates = reels.filter((v) => v.posted_at);
  let postingFrequency = { perWeek: 0, perMonth: 0 };

  if (reelsWithDates.length > 1) {
    // Sort by date
    const sortedDates = reelsWithDates
      .map((v) => new Date(v.posted_at!).getTime())
      .sort((a, b) => a - b);

    const oldestDate = sortedDates[0];
    const newestDate = sortedDates[sortedDates.length - 1];
    const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 0) {
      postingFrequency.perWeek = (reelsWithDates.length / daysDiff) * 7;
      postingFrequency.perMonth = (reelsWithDates.length / daysDiff) * 30;
    }
  }

  return {
    totalVideos,
    totalViews,
    totalLikes,
    totalComments,
    averageViews: Math.round(averageViews),
    averageLikes: Math.round(averageLikes),
    averageEngagementRate: Number(averageEngagementRate.toFixed(4)),
    bestVideo,
    postingFrequency: {
      perWeek: Number(postingFrequency.perWeek.toFixed(1)),
      perMonth: Number(postingFrequency.perMonth.toFixed(1)),
    },
  };
}

