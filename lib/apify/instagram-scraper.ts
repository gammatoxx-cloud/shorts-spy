import { createApifyClient, INSTAGRAM_SCRAPER_ACTOR_ID } from "./client";
import { getRunStatus, getRunDatasetItems, type ActorRun } from "./scraper";

/**
 * Start an Instagram Reels scraping job using Apify actor
 */
export async function startInstagramScrape(
  username: string,
  resultsLimit: number = 30
): Promise<ActorRun> {
  const client = createApifyClient();

  // Normalize username (remove @ if present, lowercase)
  const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();

  if (!normalizedUsername) {
    throw new Error("Username is required");
  }

  // Validate results limit
  if (resultsLimit < 1 || resultsLimit > 100) {
    throw new Error("Results limit must be between 1 and 100");
  }

  // Prepare Actor input based on the provided example
  const input = {
    username: [normalizedUsername],
    resultsLimit: resultsLimit,
    includeSharesCount: false,
  };

  console.log("Starting Instagram Apify actor with input:", JSON.stringify(input, null, 2));

  try {
    // The Instagram actor uses .call() method which runs the actor and waits for it to finish
    // However, we want async behavior, so we'll use .start() like TikTok if available
    // If .call() is required, we'll need to handle it differently
    // For now, let's try .start() first and adjust if needed
    const run = await client.actor(INSTAGRAM_SCRAPER_ACTOR_ID).start(input);
    console.log("Instagram Apify actor started successfully. Run ID:", run.id);
    return {
      id: run.id,
      status: run.status || "RUNNING",
      startedAt: run.startedAt,
      finishedAt: run.finishedAt || null,
    };
  } catch (error: any) {
    console.error("Error starting Instagram Apify actor:", error);
    throw error;
  }
}

/**
 * Parse Instagram Reel scraper output into normalized format
 */
export function parseInstagramOutput(items: any[]): {
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

  console.log(`Parsing ${items.length} items from Instagram Apify output`);

  if (items.length === 0) {
    console.warn("WARNING: No items to parse from Instagram scraper!");
    return { videos: [], profile };
  }

  // Helper function to get nested property using dot notation
  const getNestedProperty = (obj: any, path: string): any => {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  };

  // Separate profile-only items from video items
  const profileOnlyItems: any[] = [];
  const videoItems: any[] = [];
  
  for (const item of items) {
    // Check if this is a video/reel item (has video identifiers)
    const hasVideoId = item.id || item.shortCode || item.videoId || item.reelId;
    const hasVideoUrl = item.url || item.videoUrl || item.video_url;
    const hasVideoType = item.type === "Video" || item.productType === "clips";
    
    // Check if this is a profile metadata item (has profile info but no video data)
    const hasProfileInfo = item.ownerFullName || item.ownerUsername || item.username || item.fullName;
    const isProfileOnly = hasProfileInfo && !hasVideoId && !hasVideoUrl && !hasVideoType;
    
    if (isProfileOnly) {
      profileOnlyItems.push(item);
    } else if (hasVideoId || hasVideoUrl || hasVideoType) {
      videoItems.push(item);
    } else {
      // Unknown structure, try to process it as a video item
      videoItems.push(item);
    }
  }
  
  console.log(`Found ${profileOnlyItems.length} profile-only items and ${videoItems.length} video items`);
  
  // Extract profile info from profile-only items first
  for (const profileItem of profileOnlyItems) {
    if (!profile.display_name) {
      const displayName =
        profileItem.ownerFullName ||
        profileItem.fullName ||
        profileItem.name ||
        profileItem.displayName ||
        profileItem.username ||
        getNestedProperty(profileItem, "owner.fullName") ||
        getNestedProperty(profileItem, "user.fullName") ||
        null;
      if (displayName) {
        profile.display_name = String(displayName);
      }
    }
    
    if (!profile.avatar_url) {
      const avatarUrl =
        profileItem.ownerProfilePicUrl ||
        profileItem.owner_profile_pic_url ||
        profileItem.profilePicUrl ||
        profileItem.profile_pic_url ||
        profileItem.profilePictureUrl ||
        profileItem.profile_picture_url ||
        profileItem.avatar ||
        profileItem.avatarUrl ||
        profileItem.avatar_url ||
        getNestedProperty(profileItem, "owner.profilePicUrl") ||
        getNestedProperty(profileItem, "owner.profile_pic_url") ||
        null;
      
      if (avatarUrl) {
        const urlString = String(avatarUrl).trim();
        if (urlString && (urlString.startsWith('http://') || urlString.startsWith('https://'))) {
          profile.avatar_url = urlString;
        }
      }
    }
    
    if (profile.follower_count === null) {
      const followerCount =
        profileItem.followerCount ||
        profileItem.followers ||
        profileItem.followersCount ||
        getNestedProperty(profileItem, "owner.followerCount") ||
        getNestedProperty(profileItem, "user.followerCount") ||
        null;
      if (followerCount !== null && followerCount !== undefined) {
        profile.follower_count = Number(followerCount);
      }
    }
  }

  // Process video items
  for (const item of videoItems) {
    // Log first item structure for debugging
    if (videoItems.indexOf(item) === 0) {
      console.log("First Instagram video item structure:", JSON.stringify(item, null, 2));
    }

    // Extract profile info from item
    // Based on actual Apify output: ownerFullName, ownerUsername
    if (!profile.display_name) {
      const displayName =
        item.ownerFullName ||
        item.fullName ||
        item.name ||
        item.displayName ||
        item.username ||
        getNestedProperty(item, "owner.fullName") ||
        getNestedProperty(item, "user.fullName") ||
        null;
      if (displayName) {
        profile.display_name = String(displayName);
      }
    }

    if (!profile.avatar_url) {
      // Check for owner profile picture URL (common in Instagram Apify output)
      const avatarUrl =
        item.ownerProfilePicUrl ||
        item.owner_profile_pic_url ||
        item.ownerProfilePictureUrl ||
        item.owner_profile_picture_url ||
        item.profilePicUrl ||
        item.profile_pic_url ||
        item.profilePictureUrl ||
        item.profile_picture_url ||
        item.avatar ||
        item.avatarUrl ||
        item.avatar_url ||
        item.profilePic ||
        item.profile_pic ||
        item.profileImage ||
        item.profile_image ||
        item.pictureUrl ||
        item.picture_url ||
        item.picture ||
        item.photoUrl ||
        item.photo_url ||
        item.photo ||
        getNestedProperty(item, "owner.profilePicUrl") ||
        getNestedProperty(item, "owner.profile_pic_url") ||
        getNestedProperty(item, "owner.profilePictureUrl") ||
        getNestedProperty(item, "owner.profile_picture_url") ||
        getNestedProperty(item, "owner.avatar") ||
        getNestedProperty(item, "owner.avatarUrl") ||
        getNestedProperty(item, "owner.avatar_url") ||
        getNestedProperty(item, "owner.profile_pic_url") ||
        getNestedProperty(item, "user.profilePicUrl") ||
        getNestedProperty(item, "user.profile_pic_url") ||
        getNestedProperty(item, "user.profilePictureUrl") ||
        getNestedProperty(item, "user.profile_picture_url") ||
        getNestedProperty(item, "user.avatar") ||
        getNestedProperty(item, "user.avatarUrl") ||
        getNestedProperty(item, "user.avatar_url") ||
        getNestedProperty(item, "author.profilePicUrl") ||
        getNestedProperty(item, "author.profile_pic_url") ||
        getNestedProperty(item, "author.avatar") ||
        getNestedProperty(item, "author.avatarUrl") ||
        getNestedProperty(item, "author.avatar_url") ||
        null;
      
      if (avatarUrl) {
        // Ensure it's a valid URL string
        const urlString = String(avatarUrl).trim();
        if (urlString && (urlString.startsWith('http://') || urlString.startsWith('https://'))) {
          profile.avatar_url = urlString;
        } else if (urlString) {
          // If it's a relative URL, try to make it absolute
          console.warn(`Instagram avatar URL appears to be relative: ${urlString}`);
          profile.avatar_url = urlString.startsWith('/') ? `https://instagram.com${urlString}` : urlString;
        }
      }
    }

    if (profile.follower_count === null) {
      const followerCount =
        item.followerCount ||
        item.followers ||
        item.followersCount ||
        getNestedProperty(item, "owner.followerCount") ||
        getNestedProperty(item, "user.followerCount") ||
        null;
      if (followerCount !== null && followerCount !== undefined) {
        profile.follower_count = Number(followerCount);
      }
    }

    // Extract reel/video data
    // Based on actual Apify output structure
    const reelUrl =
      item.url ||
      item.shortUrl ||
      item.webUrl ||
      item.link ||
      getNestedProperty(item, "media.url") ||
      null;

    // Extract video ID from URL (Instagram shortcode format: /p/SHORTCODE/ or /reel/SHORTCODE/)
    let reelId: string | null = null;
    if (reelUrl) {
      // Try to extract shortcode from URL patterns:
      // https://www.instagram.com/p/SHORTCODE/
      // https://www.instagram.com/reel/SHORTCODE/
      const urlMatch = reelUrl.match(/\/(?:p|reel)\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        reelId = urlMatch[1];
      }
    }

    // Fallback: try direct ID fields
    if (!reelId) {
      reelId =
        item.id ||
        item.shortCode ||
        item.reelId ||
        item.videoId ||
        item.postId ||
        getNestedProperty(item, "media.id") ||
        null;
    }

    // Skip if we don't have essential reel data
    if (!reelId || !reelUrl) {
      console.log("Skipping item - missing reelId or reelUrl:", {
        reelId,
        reelUrl,
        itemKeys: Object.keys(item),
      });
      continue;
    }

    // Extract description/caption (based on actual output: "caption")
    const description =
      item.caption ||
      item.text ||
      item.description ||
      getNestedProperty(item, "caption.text") ||
      getNestedProperty(item, "media.caption") ||
      null;

    // Extract thumbnail/display URL (check multiple possible field names)
    // First, check if there's an images array (common in Instagram Apify output)
    let thumbnailUrl: string | null = null;
    
    // Check for images array (Instagram Apify often returns thumbnails in an array)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // Use the first image from the array as the thumbnail
      thumbnailUrl = item.images[0];
    } else if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      thumbnailUrl = item.imageUrls[0];
    } else {
      // Fallback to checking individual fields
      thumbnailUrl =
        item.displayUrl ||
        item.display_url ||
        item.thumbnailUrl ||
        item.thumbnail_url ||
        item.thumbnail ||
        item.imageUrl ||
        item.image_url ||
        item.image ||
        item.coverUrl ||
        item.cover_url ||
        item.cover ||
        item.mediaUrl ||
        item.media_url ||
        item.previewUrl ||
        item.preview_url ||
        item.pictureUrl ||
        item.picture_url ||
        item.photoUrl ||
        item.photo_url ||
        getNestedProperty(item, "media.displayUrl") ||
        getNestedProperty(item, "media.display_url") ||
        getNestedProperty(item, "media.thumbnailUrl") ||
        getNestedProperty(item, "media.thumbnail_url") ||
        getNestedProperty(item, "media.imageUrl") ||
        getNestedProperty(item, "media.image_url") ||
        getNestedProperty(item, "media.coverUrl") ||
        getNestedProperty(item, "media.cover_url") ||
        getNestedProperty(item, "video.displayUrl") ||
        getNestedProperty(item, "video.display_url") ||
        getNestedProperty(item, "video.thumbnailUrl") ||
        getNestedProperty(item, "video.thumbnail_url") ||
        null;
    }

    // Log if thumbnail is missing (only for first item to avoid spam)
    if (items.indexOf(item) === 0 && !thumbnailUrl) {
      console.warn("WARNING: No thumbnail URL found for first Instagram reel. Available fields:", Object.keys(item).filter(key => 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('thumbnail') || 
        key.toLowerCase().includes('display') || 
        key.toLowerCase().includes('cover') ||
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('picture') ||
        key.toLowerCase().includes('preview') ||
        key.toLowerCase().includes('media')
      ));
      if (item.images) {
        console.log("Found 'images' field but it's not an array or is empty:", item.images);
      }
    }

    // Extract views/plays (Instagram Reels may not always have views in the API response)
    // If not available, we'll use likes as a proxy for engagement calculation
    const views =
      item.playCount ||
      item.views ||
      item.viewCount ||
      item.plays ||
      item.videoViewCount ||
      getNestedProperty(item, "media.playCount") ||
      getNestedProperty(item, "media.views") ||
      0;

    // Extract likes (based on actual output: "likesCount")
    const likes =
      item.likesCount ||
      item.likes ||
      item.likeCount ||
      getNestedProperty(item, "media.likesCount") ||
      getNestedProperty(item, "media.likes") ||
      0;

    // Extract comments (based on actual output: "commentsCount")
    const comments =
      item.commentsCount ||
      item.comments ||
      item.commentCount ||
      getNestedProperty(item, "media.commentsCount") ||
      getNestedProperty(item, "media.comments") ||
      0;

    // Extract shares (Instagram Reels may not always have shares in the API response)
    const shares =
      item.sharesCount ||
      item.shares ||
      item.shareCount ||
      getNestedProperty(item, "media.sharesCount") ||
      getNestedProperty(item, "media.shares") ||
      0;

    // Extract posted date (based on actual output: "timestamp" as ISO string)
    let postedAt: Date | null = null;
    if (item.timestamp) {
      // Can be ISO string or Unix timestamp
      if (typeof item.timestamp === "string") {
        // ISO string format like "2025-11-14T18:54:13.000Z"
        postedAt = new Date(item.timestamp);
      } else if (typeof item.timestamp === "number") {
        // Unix timestamp (in seconds or milliseconds)
        const timestamp =
          item.timestamp > 1000000000000 ? item.timestamp : item.timestamp * 1000;
        postedAt = new Date(timestamp);
      }
    } else if (item.takenAt || item.createdAt || item.postedAt) {
      postedAt = new Date(item.takenAt || item.createdAt || item.postedAt);
    }

    // Extract duration (in seconds) - may not always be available
    const durationSeconds =
      item.videoDuration ||
      item.duration ||
      item.durationSeconds ||
      getNestedProperty(item, "media.videoDuration") ||
      null;

    // Calculate engagement rate
    // For Instagram: if views are not available, use likes + comments as engagement base
    // Engagement = (likes + comments + shares) / max(views, likes + comments) * 100
    const totalEngagement = likes + comments + shares;
    const engagementBase = views > 0 ? views : Math.max(likes + comments, 1);
    const engagementRate = engagementBase > 0 ? (totalEngagement / engagementBase) * 100 : 0;

    // Ensure thumbnail URL is a valid string or null
    let finalThumbnailUrl: string | null = null;
    if (thumbnailUrl) {
      // Convert to string and validate it's a URL
      const urlString = String(thumbnailUrl).trim();
      if (urlString && (urlString.startsWith('http://') || urlString.startsWith('https://'))) {
        finalThumbnailUrl = urlString;
      } else if (urlString) {
        // If it's a relative URL, try to make it absolute (Instagram CDN)
        console.warn(`Instagram thumbnail URL appears to be relative: ${urlString}`);
        finalThumbnailUrl = urlString.startsWith('/') ? `https://instagram.com${urlString}` : urlString;
      }
    }

    videos.push({
      video_id: String(reelId),
      video_url: String(reelUrl),
      description: description ? String(description).substring(0, 500) : null,
      thumbnail_url: finalThumbnailUrl,
      views: Math.round(Number(views) || 0),
      likes: Math.round(Number(likes) || 0),
      comments: Math.round(Number(comments) || 0),
      shares: Math.round(Number(shares) || 0),
      posted_at: postedAt,
      duration_seconds: durationSeconds ? Math.round(Number(durationSeconds)) : null,
      engagement_rate: Number(engagementRate.toFixed(2)),
    });
  }

  console.log(`Parsed ${videos.length} Instagram reels from ${items.length} items (${videoItems.length} video items, ${profileOnlyItems.length} profile items)`);
  console.log("Profile info:", {
    display_name: profile.display_name,
    avatar_url: profile.avatar_url ? `${profile.avatar_url.substring(0, 50)}...` : null,
    follower_count: profile.follower_count,
  });
  
  // Log warning if avatar URL is missing
  if (!profile.avatar_url && items.length > 0) {
    const sampleItem = profileOnlyItems.length > 0 ? profileOnlyItems[0] : (videoItems.length > 0 ? videoItems[0] : items[0]);
    console.warn("WARNING: No avatar URL found for Instagram profile. Available fields in sample item:", 
      Object.keys(sampleItem).filter(key => 
        key.toLowerCase().includes('avatar') || 
        key.toLowerCase().includes('profile') || 
        key.toLowerCase().includes('picture') ||
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('owner')
      )
    );
    // Also log if ownerProfilePicUrl exists but wasn't extracted
    if (sampleItem.ownerProfilePicUrl) {
      console.warn("Found ownerProfilePicUrl but it wasn't extracted:", sampleItem.ownerProfilePicUrl);
    }
  }

  return { videos, profile };
}

// Re-export shared functions
export { getRunStatus, getRunDatasetItems, type ActorRun };

