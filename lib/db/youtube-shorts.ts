import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type YoutubeShort = Database["public"]["Tables"]["youtube_shorts"]["Row"];
type YoutubeShortInsert = Database["public"]["Tables"]["youtube_shorts"]["Insert"];

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
 * Insert or update a YouTube Short (upsert by video_id)
 */
export async function upsertYoutubeShort(
  short: YoutubeShortInsert
): Promise<YoutubeShort> {
  const supabase = await createClient();

  // Calculate engagement rate if not provided
  const engagementRate =
    short.engagement_rate ??
    calculateEngagementRate(
      short.likes || 0,
      short.comments || 0,
      short.shares || 0,
      short.views || 0
    );

  const shortData: YoutubeShortInsert = {
    ...short,
    engagement_rate: engagementRate,
  };

  const { data, error } = await supabase
    .from("youtube_shorts")
    .upsert(shortData, {
      onConflict: "video_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insert multiple YouTube Shorts in a batch
 */
export async function insertYoutubeShorts(
  shorts: YoutubeShortInsert[]
): Promise<YoutubeShort[]> {
  const supabase = await createClient();

  // Calculate engagement rates for all shorts
  const shortsWithEngagement = shorts.map((short) => ({
    ...short,
    engagement_rate:
      short.engagement_rate ??
      calculateEngagementRate(
        short.likes || 0,
        short.comments || 0,
        short.shares || 0,
        short.views || 0
      ),
  }));

  const { data, error } = await supabase
    .from("youtube_shorts")
    .upsert(shortsWithEngagement, {
      onConflict: "video_id",
      ignoreDuplicates: false,
    })
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Get YouTube Shorts for a profile
 */
export async function getProfileShorts(
  profileId: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: "engagement_rate" | "views" | "likes" | "comments" | "posted_at";
    orderDirection?: "asc" | "desc";
  }
): Promise<YoutubeShort[]> {
  const supabase = await createClient();

  let query = supabase
    .from("youtube_shorts")
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
 * Get YouTube Shorts for a specific scrape
 */
export async function getScrapeShorts(scrapeId: string): Promise<YoutubeShort[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("youtube_shorts")
    .select("*")
    .eq("scrape_id", scrapeId)
    .order("engagement_rate", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get YouTube Short statistics for a profile
 */
export async function getProfileShortStats(profileId: string): Promise<{
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  bestVideo: YoutubeShort | null;
  postingFrequency: {
    perWeek: number;
    perMonth: number;
  };
}> {
  const supabase = await createClient();

  const { data: shorts, error } = await supabase
    .from("youtube_shorts")
    .select("*")
    .eq("profile_id", profileId);

  if (error) throw error;

  if (!shorts || shorts.length === 0) {
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

  const totalVideos = shorts.length;
  const totalViews = shorts.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = shorts.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = shorts.reduce((sum, v) => sum + v.comments, 0);
  const averageViews = totalVideos > 0 ? totalViews / totalVideos : 0;
  const averageLikes = totalVideos > 0 ? totalLikes / totalVideos : 0;
  const averageEngagementRate =
    shorts.reduce((sum, v) => sum + Number(v.engagement_rate), 0) / totalVideos;

  const bestVideo =
    shorts.reduce((best, current) =>
      Number(current.engagement_rate) > Number(best.engagement_rate)
        ? current
        : best
    ) || null;

  // Calculate posting frequency
  const shortsWithDates = shorts.filter((v) => v.posted_at);
  let postingFrequency = { perWeek: 0, perMonth: 0 };

  if (shortsWithDates.length > 1) {
    // Sort by date
    const sortedDates = shortsWithDates
      .map((v) => new Date(v.posted_at!).getTime())
      .sort((a, b) => a - b);

    const oldestDate = sortedDates[0];
    const newestDate = sortedDates[sortedDates.length - 1];
    const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 0) {
      postingFrequency.perWeek = (shortsWithDates.length / daysDiff) * 7;
      postingFrequency.perMonth = (shortsWithDates.length / daysDiff) * 30;
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
