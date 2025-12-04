import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type RateLimit = Database["public"]["Tables"]["rate_limits"]["Row"];
type RateLimitActionType = Database["public"]["Tables"]["rate_limits"]["Row"]["action_type"];

const RATE_LIMITS = {
  scrape: {
    maxCount: 10,
    windowHours: 24,
  },
  refresh: {
    maxCount: 10,
    windowHours: 1,
  },
} as const;

/**
 * Check if user has exceeded rate limit
 */
export async function checkRateLimit(
  userId: string,
  actionType: RateLimitActionType
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = await createClient();
  const limit = RATE_LIMITS[actionType];
  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - limit.windowHours);

  // Get current rate limit record
  const { data: rateLimit, error } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  // If no record exists or window has passed, create new window
  if (!rateLimit || new Date(rateLimit.window_start) < windowStart) {
    const newWindowStart = new Date();
    const resetAt = new Date(newWindowStart);
    resetAt.setHours(resetAt.getHours() + limit.windowHours);

    await supabase.from("rate_limits").insert({
      user_id: userId,
      action_type: actionType,
      count: 0,
      window_start: newWindowStart.toISOString(),
    });

    return {
      allowed: true,
      remaining: limit.maxCount,
      resetAt,
    };
  }

  const remaining = Math.max(0, limit.maxCount - rateLimit.count);
  const resetAt = new Date(rateLimit.window_start);
  resetAt.setHours(resetAt.getHours() + limit.windowHours);

  return {
    allowed: rateLimit.count < limit.maxCount,
    remaining,
    resetAt,
  };
}

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(
  userId: string,
  actionType: RateLimitActionType
): Promise<void> {
  const supabase = await createClient();
  const limit = RATE_LIMITS[actionType];
  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - limit.windowHours);

  // Find or create rate limit record
  const { data: rateLimit } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1)
    .single();

  if (rateLimit) {
    // Update existing record
    await supabase
      .from("rate_limits")
      .update({ count: rateLimit.count + 1 })
      .eq("id", rateLimit.id);
  } else {
    // Create new record
    await supabase.from("rate_limits").insert({
      user_id: userId,
      action_type: actionType,
      count: 1,
      window_start: new Date().toISOString(),
    });
  }
}

/**
 * Get rate limit status for user
 */
export async function getRateLimitStatus(
  userId: string
): Promise<{
  scrape: { used: number; limit: number; resetAt: Date };
  refresh: { used: number; limit: number; resetAt: Date };
}> {
  const scrapeStatus = await checkRateLimit(userId, "scrape");
  const refreshStatus = await checkRateLimit(userId, "refresh");

  const scrapeLimit = RATE_LIMITS.scrape.maxCount;
  const refreshLimit = RATE_LIMITS.refresh.maxCount;

  return {
    scrape: {
      used: scrapeLimit - scrapeStatus.remaining,
      limit: scrapeLimit,
      resetAt: scrapeStatus.resetAt,
    },
    refresh: {
      used: refreshLimit - refreshStatus.remaining,
      limit: refreshLimit,
      resetAt: refreshStatus.resetAt,
    },
  };
}

