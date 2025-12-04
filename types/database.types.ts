/**
 * Database type definitions for Shorts Spy
 * 
 * These types match the Supabase schema defined in migrations.
 * 
 * To regenerate types from your Supabase schema, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ScrapeStatus = "pending" | "running" | "completed" | "failed";
export type SubscriptionTier = "free" | "paid";
export type SubscriptionStatus = "active" | "canceled" | "past_due";
export type RateLimitActionType = "scrape" | "refresh";
export type Platform = "tiktok" | "instagram";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          platform: Platform;
          display_name: string | null;
          avatar_url: string | null;
          follower_count: number | null;
          last_scraped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          platform?: Platform;
          display_name?: string | null;
          avatar_url?: string | null;
          follower_count?: number | null;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          platform?: Platform;
          display_name?: string | null;
          avatar_url?: string | null;
          follower_count?: number | null;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scrapes: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          platform: Platform | null;
          apify_run_id: string | null;
          status: ScrapeStatus;
          video_count: number;
          requested_video_limit: number | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id: string;
          platform?: Platform | null;
          apify_run_id?: string | null;
          status?: ScrapeStatus;
          video_count?: number;
          requested_video_limit?: number | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string;
          platform?: Platform | null;
          apify_run_id?: string | null;
          status?: ScrapeStatus;
          video_count?: number;
          requested_video_limit?: number | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      tiktok_videos: {
        Row: {
          id: string;
          profile_id: string;
          scrape_id: string;
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          scrape_id: string;
          video_id: string;
          video_url: string;
          description?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number | null;
          engagement_rate?: number;
          posted_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          scrape_id?: string;
          video_id?: string;
          video_url?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number | null;
          engagement_rate?: number;
          posted_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_tier: SubscriptionTier;
          status: SubscriptionStatus;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          action_type: RateLimitActionType;
          count: number;
          window_start: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: RateLimitActionType;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: RateLimitActionType;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_videos: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          platform: "tiktok" | "instagram";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          platform: "tiktok" | "instagram";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          platform?: "tiktok" | "instagram";
          created_at?: string;
        };
      };
      instagram_reels: {
        Row: {
          id: string;
          profile_id: string;
          scrape_id: string;
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          scrape_id: string;
          video_id: string;
          video_url: string;
          description?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number | null;
          engagement_rate?: number;
          posted_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          scrape_id?: string;
          video_id?: string;
          video_url?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number | null;
          engagement_rate?: number;
          posted_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Views can be added here as needed
    };
    Functions: {
      // Functions can be added here as needed
    };
    Enums: {
      // Enums are defined inline in the types above
    };
  };
}
