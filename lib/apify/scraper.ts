import { ApifyClient } from "apify-client";
import { createApifyClient, TIKTOK_SCRAPER_ACTOR_ID } from "./client";

/**
 * Type for Apify Actor Run
 */
export interface ActorRun {
  id: string;
  status: string;
  startedAt?: string;
  finishedAt?: string | null;
}

/**
 * Start a TikTok scraping job using Apify actor
 */
export async function startTikTokScrape(
  username: string,
  videoLimit: number = 50
): Promise<ActorRun> {
  const client = createApifyClient();

  // Normalize username (remove @ if present, lowercase)
  const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();

  if (!normalizedUsername) {
    throw new Error("Username is required");
  }

  // Validate video limit
  if (videoLimit < 1 || videoLimit > 100) {
    throw new Error("Video limit must be between 1 and 100");
  }

  // Start the actor run
  // Use full URL format - logs show the actor successfully loads profile with URL format
  const profileUrl = `https://www.tiktok.com/@${normalizedUsername}`;

  // Based on the actual Apify actor input structure
  // The actor accepts full profile URLs in the profiles array
  const input = {
    profiles: [profileUrl], // Array of profile URLs (required field)
    resultsPerPage: videoLimit, // Limit number of videos to scrape per profile
    profileScrapeSections: ["videos"], // Scrape videos from profiles
    profileSorting: "latest", // Sort by latest videos
    excludePinnedPosts: false, // Include pinned posts
    searchSection: "", // Empty for profile scraping
    maxProfilesPerQuery: 10, // Maximum profiles per query
    scrapeRelatedVideos: false, // Don't scrape related videos
    shouldDownloadVideos: false, // Don't download videos (just metadata)
    shouldDownloadCovers: false, // Don't download covers
    shouldDownloadSubtitles: false, // Don't download subtitles
    shouldDownloadSlideshowImages: false, // Don't download slideshow images
    shouldDownloadAvatars: false, // Don't download avatars
    shouldDownloadMusicCovers: false, // Don't download music covers
    proxyCountryCode: "None", // No proxy
  };

  console.log("Starting Apify actor with input:", JSON.stringify(input, null, 2));

  try {
    const run = await client.actor(TIKTOK_SCRAPER_ACTOR_ID).start(input);
    console.log("Apify actor started successfully. Run ID:", run.id);
    return {
      id: run.id,
      status: run.status,
      startedAt: run.startedAt ? run.startedAt.toISOString() : undefined,
      finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
    };
  } catch (error: any) {
    console.error("Error starting Apify actor:", error);
    throw error; // Re-throw to be caught by the API route
  }
}

/**
 * Get the status of an Apify actor run
 */
export async function getRunStatus(runId: string): Promise<ActorRun | null> {
  try {
    const client = createApifyClient();
    const run = await client.run(runId).get();

    if (!run) {
      console.warn(`Run ${runId} not found`);
      return null;
    }

    console.log(`Run ${runId} status: ${run.status}`);
    return {
      id: run.id,
      status: run.status,
      startedAt: run.startedAt ? run.startedAt.toISOString() : undefined,
      finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
    };
  } catch (error: any) {
    console.error(`Error getting run status for ${runId}:`, error);
    // Log more details about the error
    if (error.statusCode) {
      console.error(`Apify API error status code: ${error.statusCode}`);
    }
    if (error.message) {
      console.error(`Apify API error message: ${error.message}`);
    }
    // Check if it's a 404 (run not found) - return null for that case
    if (error.statusCode === 404 || error.statusCode === 40400) {
      console.warn(`Run ${runId} not found (404)`);
      return null;
    }
    throw error; // Re-throw other errors so we can handle them properly
  }
}

/**
 * Get dataset items from a completed Apify run
 * Retries if dataset is not ready yet
 */
export async function getRunDatasetItems(runId: string, retries: number = 3): Promise<any[]> {
  try {
    const client = createApifyClient();
    const run = await client.run(runId).get();

    if (!run) {
      console.error("Run not found:", runId);
      return [];
    }

    console.log("Run status:", run.status);
    console.log("Run defaultDatasetId:", run.defaultDatasetId);
    console.log("Run defaultKeyValueStoreId:", run.defaultKeyValueStoreId);

    if (!run.defaultDatasetId) {
      console.error("Run has no default dataset ID:", runId);
      // Try to get dataset from run info
      if (run.defaultKeyValueStoreId) {
        console.log("Trying to get data from key-value store instead");
        try {
          const store = await client.keyValueStore(run.defaultKeyValueStoreId).get();
          console.log("Key-value store info:", store);
        } catch (e) {
          console.error("Error accessing key-value store:", e);
        }
      }
      return [];
    }

    console.log("Fetching dataset items from dataset:", run.defaultDatasetId);
    
    // Try to get dataset info first
    try {
      const dataset = await client.dataset(run.defaultDatasetId).get();
      console.log("Dataset info:", {
        id: dataset?.id,
        itemCount: dataset?.itemCount,
      });
    } catch (e) {
      console.error("Error getting dataset info:", e);
    }
    
    // Get all items from the dataset (with pagination if needed)
    let items: any[] = [];
    try {
      const result = await client.dataset(run.defaultDatasetId).listItems({
        limit: 1000, // Get up to 1000 items
      });
      items = result.items || [];
    } catch (error: any) {
      console.error(`Error listing dataset items for run ${runId}:`, error);
      console.error("Error details:", {
        statusCode: error.statusCode,
        message: error.message,
        datasetId: run.defaultDatasetId,
      });
      
      // If dataset is not ready, retry
      if (retries > 0 && (error.message?.includes('not ready') || error.statusCode === 404 || error.statusCode === 409)) {
        console.log(`Dataset not ready (status: ${error.statusCode}), retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getRunDatasetItems(runId, retries - 1);
      }
      
      // Provide more context in the error
      const errorMessage = error.message || "Unknown error";
      const statusCode = error.statusCode || "unknown";
      throw new Error(`Failed to retrieve dataset items: ${errorMessage} (status: ${statusCode})`);
    }
    
    console.log(`Retrieved ${items.length} items from Apify dataset`);
    
    if (items && items.length > 0) {
      console.log("Sample item structure (first item):", JSON.stringify(items[0], null, 2));
      console.log("Sample item keys:", Object.keys(items[0]));
    } else {
      console.warn("WARNING: Dataset is empty or items array is null/undefined");
      console.log("Items value:", items);
    }
    
    return items || [];
  } catch (error: any) {
    console.error("Error getting dataset items:", error);
    console.error("Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
    return [];
  }
}

/**
 * Helper function to get nested property using dot notation
 * e.g., getNestedProperty(item, "videoMeta.coverUrl")
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Parse Apify output into normalized format
 * Handles various possible field names from Apify, including dot notation
 */
export function parseApifyOutput(items: any[]): {
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

  console.log(`Parsing ${items.length} items from Apify output`);
  
  if (items.length === 0) {
    console.warn("WARNING: No items to parse!");
    return { videos: [], profile };
  }
  
  // Check if items are profile metadata objects (from "empty channel" scenario)
  // The actor might return profile info even when no videos are found
  // Look for items that have profile info but no video data
  const profileOnlyItems: any[] = [];
  const videoItems: any[] = [];
  
  for (const item of items) {
    // Check if this is a video item (has video identifiers)
    const hasVideoId = item.id || item.videoId || item.video_id || item.aweme_id || item.awemeId;
    const hasVideoUrl = item.url || item.videoUrl || item.video_url || item.webVideoUrl;
    
    // Check if this is a profile metadata item (has author/profile info but no video data)
    const hasProfileInfo = item.author || item.profile || item.user || item.uniqueId;
    const isProfileOnly = hasProfileInfo && !hasVideoId && !hasVideoUrl;
    
    if (isProfileOnly) {
      profileOnlyItems.push(item);
      console.log("Found profile-only item (no videos):", Object.keys(item));
    } else if (hasVideoId || hasVideoUrl) {
      videoItems.push(item);
    } else {
      // Unknown structure, try to process it anyway
      videoItems.push(item);
    }
  }
  
  console.log(`Found ${profileOnlyItems.length} profile-only items and ${videoItems.length} video items`);
  
  // Extract profile info from profile-only items
  for (const profileItem of profileOnlyItems) {
    // Handle both regular and dot notation fields
    if (!profile.display_name) {
      const authorName = getNestedProperty(profileItem, "authorMeta.name") ||
                         profileItem.author?.nickname || profileItem.author?.uniqueId || 
                         profileItem.author?.name || profileItem.uniqueId ||
                         profileItem.authorMeta?.name || null;
      if (authorName) {
        profile.display_name = authorName;
      }
    }
    if (!profile.avatar_url) {
      const avatarUrl = getNestedProperty(profileItem, "authorMeta.avatar") ||
                        getNestedProperty(profileItem, "authorMeta.avatarUrl") ||
                        profileItem.author?.avatar || profileItem.author?.avatarUrl ||
                        profileItem.avatar || profileItem.authorMeta?.avatar || 
                        profileItem.authorMeta?.avatarUrl || null;
      if (avatarUrl) {
        profile.avatar_url = avatarUrl;
      }
    }
    if (profile.follower_count === null) {
      const followerCount = getNestedProperty(profileItem, "authorMeta.followerCount") ||
                            getNestedProperty(profileItem, "authorMeta.fans") ||
                            profileItem.author?.followerCount || profileItem.author?.fans ||
                            profileItem.followerCount || profileItem.authorMeta?.followerCount || 
                            profileItem.authorMeta?.fans || null;
      if (followerCount !== null && followerCount !== undefined) {
        profile.follower_count = Number(followerCount);
      }
    }
  }
  
  // Use video items for processing
  items = videoItems;
  
  // Check if items contain nested video arrays (some actors return profile objects with videos array)
  if (items.length > 0 && items[0].videos && Array.isArray(items[0].videos)) {
    console.log("Detected nested video structure - extracting videos from profile objects");
    const allVideos: any[] = [];
    for (const profileItem of items) {
      if (profileItem.videos && Array.isArray(profileItem.videos)) {
        allVideos.push(...profileItem.videos);
      }
    }
    console.log(`Extracted ${allVideos.length} videos from ${items.length} profile items`);
    // Process the extracted videos instead
    items = allVideos;
  }
  
  // Check if items are nested in a different structure (e.g., items[0].data or items[0].result)
  if (items.length > 0 && !items[0].id && !items[0].videoId && !items[0].video_id) {
    console.log("Checking for nested data structures...");
    const firstItemKeys = Object.keys(items[0]);
    console.log("First item top-level keys:", firstItemKeys);
    
    // Try to find nested video data
    for (const key of firstItemKeys) {
      if (Array.isArray(items[0][key])) {
        console.log(`Found array in key '${key}' with ${items[0][key].length} items`);
        // Check if this array contains video-like objects
        if (items[0][key].length > 0) {
          const firstNestedItem = items[0][key][0];
          const nestedKeys = Object.keys(firstNestedItem);
          console.log(`Nested item keys in '${key}':`, nestedKeys);
          if (firstNestedItem.id || firstNestedItem.videoId || firstNestedItem.video_id || firstNestedItem.url) {
            console.log(`Extracting videos from nested array '${key}'`);
            const allVideos: any[] = [];
            for (const item of items) {
              if (item[key] && Array.isArray(item[key])) {
                allVideos.push(...item[key]);
              }
            }
            items = allVideos;
            break;
          }
        }
      }
    }
  }
  
  // Process each item
  for (const item of items) {
    // Log first item structure for debugging
    if (items.indexOf(item) === 0) {
      console.log("First item structure:", JSON.stringify(item, null, 2));
    }
    
    // Extract profile info from first item (if available)
    // Handle both regular and dot notation fields
    if (!profile.display_name) {
      const authorName = getNestedProperty(item, "authorMeta.name") ||
                         item.author?.nickname || item.author?.uniqueId || item.author?.name ||
                         item.authorMeta?.name || null;
      if (authorName) {
        profile.display_name = authorName;
      }
    }
    if (!profile.avatar_url) {
      const avatarUrl = getNestedProperty(item, "authorMeta.avatar") ||
                        getNestedProperty(item, "authorMeta.avatarUrl") ||
                        item.author?.avatar || item.author?.avatarUrl ||
                        item.authorMeta?.avatar || item.authorMeta?.avatarUrl || null;
      if (avatarUrl) {
        profile.avatar_url = avatarUrl;
      }
    }
    if (profile.follower_count === null) {
      const followerCount = getNestedProperty(item, "authorMeta.followerCount") ||
                            getNestedProperty(item, "authorMeta.fans") ||
                            item.author?.followerCount || item.author?.fans ||
                            item.authorMeta?.followerCount || item.authorMeta?.fans || null;
      if (followerCount !== null && followerCount !== undefined) {
        profile.follower_count = Number(followerCount);
      }
    }

    // Extract video data
    // Handle various possible field names - check all possible variations including dot notation
    
    // Extract video URL first (needed to extract ID if not available)
    const videoUrl = item.webVideoUrl || item.url || item.videoUrl || item.video_url || 
                     item.video?.url || item.data?.url || null;
    
    // Extract video ID - try direct fields first, then extract from URL if needed
    let videoId = item.id || item.videoId || item.video_id || item.aweme_id || item.awemeId || 
                  item.aweme?.id || item.video?.id || item.data?.id || null;
    
    // If no video ID found but we have a URL, try to extract it from the URL
    // TikTok URLs are like: https://www.tiktok.com/@username/video/1234567890
    if (!videoId && videoUrl) {
      const urlMatch = videoUrl.match(/\/video\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        videoId = urlMatch[1];
      }
    }
    
    // If still no video ID, try to construct URL from ID (fallback)
    const finalVideoUrl = videoUrl || (videoId ? `https://www.tiktok.com/video/${videoId}` : null);
    
    // Extract description - handle dot notation
    const description = item.text || item.description || item.caption || item.desc || 
                        item.video?.description || item.data?.description || null;
    
    // Extract thumbnail URL - handle dot notation like "videoMeta.coverUrl"
    const thumbnailUrl = getNestedProperty(item, "videoMeta.coverUrl") ||
                         item.cover || item.thumbnailUrl || item.thumbnail_url || item.dynamicCover || 
                         item.coverUrl || item.video?.cover || item.data?.cover || 
                         item.video?.coverUrl || getNestedProperty(item, "videoMeta.cover") || null;
    
    // Extract views - handle dot notation
    const views = item.playCount || item.views || item.viewCount || item.play_count || 
                  item.statistics?.playCount || item.video?.playCount || item.data?.playCount || 0;
    
    // Extract likes - handle dot notation
    const likes = item.diggCount || item.likes || item.likeCount || item.digg_count || 
                  item.statistics?.diggCount || item.video?.diggCount || item.data?.diggCount || 0;
    
    // Extract comments - handle dot notation
    const comments = item.commentCount || item.comments || item.comment_count || 
                     item.statistics?.commentCount || item.video?.commentCount || item.data?.commentCount || 0;
    
    // Extract shares - handle dot notation
    const shares = item.shareCount || item.shares || item.share_count || 
                   item.statistics?.shareCount || item.video?.shareCount || item.data?.shareCount || 0;
    
    // Handle posted_at - could be Unix timestamp or ISO string, handle dot notation
    let postedAt: Date | null = null;
    if (item.createTimeISO) {
      // ISO string format
      postedAt = new Date(item.createTimeISO);
    } else if (item.createTime) {
      // If it's a Unix timestamp (in seconds or milliseconds)
      const timestamp = typeof item.createTime === 'number' 
        ? (item.createTime > 1000000000000 ? item.createTime : item.createTime * 1000)
        : null;
      postedAt = timestamp ? new Date(timestamp) : null;
    } else if (item.postedAt || item.createdAt) {
      postedAt = new Date(item.postedAt || item.createdAt);
    }

    // Extract duration - handle dot notation like "videoMeta.duration"
    const durationSeconds = getNestedProperty(item, "videoMeta.duration") ||
                            item.videoDuration || item.duration || 
                            item.video?.duration || item.data?.duration || null;
    
    // Extract profile info from authorMeta (dot notation) - already handled above, but ensure we get it from video items too
    if (!profile.display_name) {
      const authorName = getNestedProperty(item, "authorMeta.name") ||
                         item.author?.name || item.author?.nickname || item.author?.uniqueId ||
                         item.authorMeta?.name || null;
      if (authorName) {
        profile.display_name = authorName;
      }
    }
    if (!profile.avatar_url) {
      const avatarUrl = getNestedProperty(item, "authorMeta.avatar") ||
                        getNestedProperty(item, "authorMeta.avatarUrl") ||
                        item.author?.avatar || item.author?.avatarUrl ||
                        item.authorMeta?.avatar || item.authorMeta?.avatarUrl || null;
      if (avatarUrl) {
        profile.avatar_url = avatarUrl;
      }
    }
    if (profile.follower_count === null) {
      const followerCount = getNestedProperty(item, "authorMeta.followerCount") ||
                            getNestedProperty(item, "authorMeta.fans") ||
                            item.author?.followerCount || item.author?.fans ||
                            item.authorMeta?.followerCount || item.authorMeta?.fans || null;
      if (followerCount !== null && followerCount !== undefined) {
        profile.follower_count = Number(followerCount);
      }
    }

    // Skip if we don't have essential video data
    if (!videoId || !finalVideoUrl) {
      console.log("Skipping item - missing videoId or videoUrl:", {
        videoId,
        videoUrl: finalVideoUrl,
        itemKeys: Object.keys(item),
      });
      continue;
    }

    // Calculate engagement rate
    // Engagement = (likes + comments + shares) / views * 100
    const totalEngagement = likes + comments + shares;
    const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;

    videos.push({
      video_id: String(videoId),
      video_url: finalVideoUrl,
      description: description ? String(description).substring(0, 500) : null, // Limit description length
      thumbnail_url: thumbnailUrl || null,
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      posted_at: postedAt,
      duration_seconds: durationSeconds ? Number(durationSeconds) : null,
      engagement_rate: Number(engagementRate.toFixed(2)),
    });
  }

  console.log(`Parsed ${videos.length} videos from ${items.length} items`);
  console.log("Profile info:", {
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    follower_count: profile.follower_count,
  });

  return { videos, profile };
}
