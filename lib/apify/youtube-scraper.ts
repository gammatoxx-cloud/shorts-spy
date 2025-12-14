import { createApifyClient, YOUTUBE_SCRAPER_ACTOR_ID } from "./client";
import { getRunStatus, getRunDatasetItems, type ActorRun } from "./scraper";

/**
 * Start a YouTube Shorts scraping job using Apify actor
 */
export async function startYoutubeScrape(
  channelName: string,
  maxResults: number = 30
): Promise<ActorRun> {
  const client = createApifyClient();

  // Normalize channel name (remove @ if present, trim)
  const normalizedChannelName = channelName.trim().replace(/^@/, "");

  if (!normalizedChannelName) {
    throw new Error("Channel name is required");
  }

  // Validate max results
  if (maxResults < 1 || maxResults > 100) {
    throw new Error("Max results must be between 1 and 100");
  }

  // Prepare Actor input based on the provided example
  const input = {
    channels: [normalizedChannelName],
    maxResultsShorts: maxResults,
  };

  console.log("Starting YouTube Apify actor with input:", JSON.stringify(input, null, 2));

  try {
    const run = await client.actor(YOUTUBE_SCRAPER_ACTOR_ID).start(input);
    console.log("YouTube Apify actor started successfully. Run ID:", run.id);
    return {
      id: run.id,
      status: run.status || "RUNNING",
      startedAt: run.startedAt,
      finishedAt: run.finishedAt || null,
    };
  } catch (error: any) {
    console.error("Error starting YouTube Apify actor:", error);
    throw error;
  }
}

/**
 * Parse duration string "HH:MM:SS" to seconds
 */
function parseDurationToSeconds(duration: string): number | null {
  if (!duration) return null;
  
  try {
    const parts = duration.split(":").map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // SS
      return parts[0];
    }
  } catch (error) {
    console.warn("Error parsing duration:", duration, error);
  }
  
  return null;
}

/**
 * Parse YouTube Shorts scraper output into normalized format
 */
export function parseYoutubeOutput(items: any[]): {
  videos: Array<{
    video_id: string;
    video_url: string;
    description: string | null;
    thumbnail_url: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    posted_at: Date | null;
    duration_seconds: number | null;
    engagement_rate: number;
  }>;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    follower_count: number | null;
  };
} {
  const videos: Array<{
    video_id: string;
    video_url: string;
    description: string | null;
    thumbnail_url: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    posted_at: Date | null;
    duration_seconds: number | null;
    engagement_rate: number;
  }> = [];

  let profile = {
    display_name: null as string | null,
    avatar_url: null as string | null,
    follower_count: null as number | null,
  };

  console.log(`Parsing ${items.length} items from YouTube Apify output`);

  if (items.length === 0) {
    console.warn("WARNING: No items to parse from YouTube scraper!");
    return { videos, profile };
  }

  // Process each item
  for (const item of items) {
    // Log first item structure for debugging
    if (items.indexOf(item) === 0) {
      console.log("First YouTube item structure:", JSON.stringify(item, null, 2));
    }

    // Extract profile info from item (channelName, numberOfSubscribers)
    if (!profile.display_name && item.channelName) {
      profile.display_name = String(item.channelName);
    }
    if (profile.follower_count === null && item.numberOfSubscribers !== null && item.numberOfSubscribers !== undefined) {
      profile.follower_count = Number(item.numberOfSubscribers);
    }

    // Extract video data
    // Based on example output:
    // {
    //   "title": "19 year old from Kazakhstan making how much??",
    //   "id": "fME7sHyW3_4",
    //   "url": "https://www.youtube.com/shorts/fME7sHyW3_4",
    //   "viewCount": 15534,
    //   "date": "2025-11-27T20:06:11.000Z",
    //   "likes": 456,
    //   "channelName": "Starter Story",
    //   "channelUrl": "https://www.youtube.com/channel/UChhw6DlKKTQ9mYSpTfXUYqA",
    //   "numberOfSubscribers": 729000,
    //   "duration": "00:01:07"
    // }

    const videoId = item.id || null;
    const videoUrl = item.url || null;
    const title = item.title || null;
    const viewCount = item.viewCount || item.view_count || 0;
    const likes = item.likes || item.likeCount || 0;
    const comments = item.comments || item.commentCount || 0; // May not be in output, default to 0
    const shares = 0; // Not in output, always 0
    const date = item.date || item.postedAt || item.createdAt || null;
    const duration = item.duration || null;

    // Skip if we don't have essential video data
    if (!videoId || !videoUrl) {
      console.log("Skipping item - missing videoId or videoUrl:", {
        videoId,
        videoUrl,
        itemKeys: Object.keys(item),
      });
      continue;
    }

    // Parse posted date
    let postedAt: Date | null = null;
    if (date) {
      try {
        postedAt = new Date(date);
        // Check if date is valid
        if (isNaN(postedAt.getTime())) {
          postedAt = null;
        }
      } catch (error) {
        console.warn("Error parsing date:", date, error);
      }
    }

    // Parse duration to seconds
    const durationSeconds = duration ? parseDurationToSeconds(duration) : null;

    // Calculate engagement rate
    // Engagement = (likes + comments + shares) / views * 100
    // Note: shares is always 0 for YouTube Shorts
    const totalEngagement = likes + comments + shares;
    const engagementRate = viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

    videos.push({
      video_id: String(videoId),
      video_url: String(videoUrl),
      description: title ? String(title).substring(0, 500) : null, // Limit description length
      thumbnail_url: null, // YouTube Shorts output doesn't include thumbnail in example
      views: Math.round(Number(viewCount) || 0),
      likes: Math.round(Number(likes) || 0),
      comments: Math.round(Number(comments) || 0),
      shares: 0, // Always 0 for YouTube Shorts
      posted_at: postedAt,
      duration_seconds: durationSeconds,
      engagement_rate: Number(engagementRate.toFixed(2)),
    });
  }

  console.log(`Parsed ${videos.length} YouTube Shorts from ${items.length} items`);
  console.log("Profile info:", {
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    follower_count: profile.follower_count,
  });

  return { videos, profile };
}

// Re-export shared functions
export { getRunStatus, getRunDatasetItems, type ActorRun };
