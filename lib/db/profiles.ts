import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * Get a profile by username and platform
 */
export async function getProfileByUsername(
  username: string,
  platform: "tiktok" | "instagram" = "tiktok"
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("platform", platform)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get a profile by ID
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
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
 * Create or update a profile
 */
export async function upsertProfile(profile: ProfileInsert): Promise<Profile> {
  const supabase = await createClient();
  
  // Ensure platform has a default value
  const profileWithPlatform = {
    ...profile,
    username: profile.username.toLowerCase(),
    platform: profile.platform || "tiktok",
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profileWithPlatform, {
      onConflict: "username,platform",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update profile's last_scraped_at timestamp
 */
export async function updateProfileLastScraped(
  profileId: string,
  lastScrapedAt: Date
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ last_scraped_at: lastScrapedAt.toISOString() })
    .eq("id", profileId);

  if (error) throw error;
}

