import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type Scrape = Database["public"]["Tables"]["scrapes"]["Row"];
type ScrapeInsert = Database["public"]["Tables"]["scrapes"]["Insert"];
type ScrapeUpdate = Database["public"]["Tables"]["scrapes"]["Update"];
type ScrapeStatus = Database["public"]["Tables"]["scrapes"]["Row"]["status"];

/**
 * Create a new scrape record
 */
export async function createScrape(scrape: ScrapeInsert): Promise<Scrape> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scrapes")
    .insert(scrape)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a scrape by ID
 */
export async function getScrapeById(id: string): Promise<Scrape | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scrapes")
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
 * Get all scrapes for a user
 */
export async function getUserScrapes(userId: string): Promise<Scrape[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scrapes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get scrapes for a profile
 */
export async function getProfileScrapes(profileId: string): Promise<Scrape[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scrapes")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update scrape status
 */
export async function updateScrapeStatus(
  id: string,
  status: ScrapeStatus,
  updates?: Partial<ScrapeUpdate>
): Promise<Scrape> {
  const supabase = await createClient();
  const updateData: ScrapeUpdate = {
    status,
    ...updates,
  };

  if (status === "completed" || status === "failed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("scrapes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get the latest scrape for a profile
 */
export async function getLatestScrapeForProfile(
  profileId: string
): Promise<Scrape | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scrapes")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}

