import { ApifyClient } from "apify-client";

/**
 * Create and configure Apify client
 */
export function createApifyClient(): ApifyClient {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN environment variable is not set");
  }

  return new ApifyClient({
    token: apiToken,
  });
}

/**
 * Apify actor ID for TikTok scraper
 */
export const TIKTOK_SCRAPER_ACTOR_ID = "GdWCkxBtKWOsKjdch";

/**
 * Apify actor ID for Instagram Reel scraper
 */
export const INSTAGRAM_SCRAPER_ACTOR_ID = "xMc5Ga1oCONPmWJIa";

