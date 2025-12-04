/**
 * Shared TypeScript type definitions for Shorts Spy
 */

// TikTok video data structure (from Apify)
export interface TikTokVideo {
  id: string;
  videoId: string;
  videoUrl: string;
  description: string | null;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  engagementRate: number; // Calculated: (likes + comments) / views * 100
  postedAt: string; // ISO date string
  durationSeconds: number | null;
}

// TikTok profile data structure
export interface TikTokProfile {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
}

// Scrape job status
export type ScrapeStatus = "pending" | "running" | "completed" | "failed";

// User subscription tier
export type SubscriptionTier = "free" | "paid";

// Subscription status
export type SubscriptionStatus = "active" | "canceled" | "past_due";

