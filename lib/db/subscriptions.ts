import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type SubscriptionUpdate = Database["public"]["Tables"]["user_subscriptions"]["Update"];

/**
 * Get user's subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  userId: string,
  updates: SubscriptionUpdate
): Promise<UserSubscription> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if user has paid subscription
 */
export async function isUserPaid(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return (
    subscription?.subscription_tier === "paid" &&
    subscription?.status === "active"
  );
}

/**
 * Get user's video limit based on subscription
 */
export async function getUserVideoLimit(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);
  if (subscription?.subscription_tier === "paid" && subscription?.status === "active") {
    return 40;
  }
  return 20; // Free tier limit
}

