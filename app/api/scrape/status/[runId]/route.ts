import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRunStatus, getRunDatasetItems, parseApifyOutput } from "@/lib/apify/scraper";
import {
  getScrapeById,
  updateScrapeStatus,
  getProfileById,
  updateProfileLastScraped,
  upsertVideo,
  insertVideos,
  getUserVideoLimit,
  getProfileVideos,
  getProfileVideoStats,
} from "@/lib/db";

/**
 * GET /api/scrape/status/[runId]
 * Check the status of a scraping job and process results if complete
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { runId } = params;

    // Find scrape by Apify run ID
    const { data: scrapeData, error: scrapeError } = await supabase
      .from("scrapes")
      .select("*")
      .eq("apify_run_id", runId)
      .eq("user_id", user.id)
      .single();

    if (scrapeError || !scrapeData) {
      return NextResponse.json(
        { error: "Scrape not found" },
        { status: 404 }
      );
    }

    const scrape = scrapeData;

    // Get Apify run status
    const run = await getRunStatus(runId);

    if (!run) {
      return NextResponse.json(
        {
          status: "unknown",
          message: "Run not found in Apify",
        },
        { status: 404 }
      );
    }

    // Map Apify status to our status
    let scrapeStatus: "pending" | "running" | "completed" | "failed" = "running";
    if (run.status === "SUCCEEDED") {
      scrapeStatus = "completed";
    } else if (run.status === "FAILED" || run.status === "ABORTED") {
      scrapeStatus = "failed";
    } else if (run.status === "READY" || run.status === "RUNNING") {
      scrapeStatus = "running";
    }

    // If completed, process the results
    if (scrapeStatus === "completed" && scrape.status !== "completed") {
      try {
        // Get dataset items from Apify
        const items = await getRunDatasetItems(runId);
        console.log(`Processing ${items.length} items from Apify run ${runId}`);
        
        if (items.length === 0) {
          console.warn(`Warning: Apify run ${runId} completed but returned 0 items`);
        }
        
        const { videos, profile } = parseApifyOutput(items);
        console.log(`Parsed ${videos.length} videos from ${items.length} items`);

        // Check if we got profile info but no videos (empty channel scenario)
        if (videos.length === 0 && items.length > 0) {
          console.warn(`Warning: Actor completed but found 0 videos for profile. Items in dataset: ${items.length}`);
          console.log("This could mean:");
          console.log("1. The profile has no videos");
          console.log("2. The profile is private or restricted");
          console.log("3. TikTok is blocking the scraper");
          console.log("4. The profile URL format is incorrect");
          
          // Still update profile info if we got it
          const profileRecord = await getProfileById(scrape.profile_id);
          if (profileRecord) {
            await updateProfileLastScraped(
              scrape.profile_id,
              new Date()
            );
            // Update profile metadata if available
            if (profile.display_name || profile.avatar_url || profile.follower_count !== null) {
              await supabase
                .from("profiles")
                .update({
                  display_name: profile.display_name || profileRecord.display_name,
                  avatar_url: profile.avatar_url || profileRecord.avatar_url,
                  follower_count: profile.follower_count ?? profileRecord.follower_count,
                })
                .eq("id", scrape.profile_id);
            }
          }
          
          // Mark as completed but with 0 videos
          await updateScrapeStatus(scrape.id, "completed", {
            video_count: 0,
            error_message: "Actor completed but found no videos. This could mean the profile has no videos, is private, or TikTok is blocking the scraper.",
          });
          
          // Return early with empty results
          const videoLimit = scrape.requested_video_limit || await getUserVideoLimit(user.id);
          const savedVideos = await getProfileVideos(scrape.profile_id, {
            limit: videoLimit,
            orderBy: "engagement_rate",
            orderDirection: "desc",
          });
          const stats = await getProfileVideoStats(scrape.profile_id);
          
          return NextResponse.json({
            status: "completed",
            scrape: {
              id: scrape.id,
              status: "completed",
              video_count: 0,
            },
            profile: profileRecord,
            videos: savedVideos || [],
            stats,
            message: "Analysis completed but no videos were found. The profile may be empty, private, or TikTok may be blocking the scraper.",
          });
        }

        // Update profile info
        const profileRecord = await getProfileById(scrape.profile_id);
        if (profileRecord) {
          await updateProfileLastScraped(
            scrape.profile_id,
            new Date()
          );
          // Update profile metadata if available
          if (profile.display_name || profile.avatar_url || profile.follower_count !== null) {
            await supabase
              .from("profiles")
              .update({
                display_name: profile.display_name || profileRecord.display_name,
                avatar_url: profile.avatar_url || profileRecord.avatar_url,
                follower_count: profile.follower_count ?? profileRecord.follower_count,
              })
              .eq("id", scrape.profile_id);
          }
        }

        // Insert videos
        if (videos.length > 0) {
          const videoInserts = videos.map((video) => ({
            profile_id: scrape.profile_id,
            scrape_id: scrape.id,
            ...video,
          }));

          await insertVideos(videoInserts);
        }

        // Update scrape status
        await updateScrapeStatus(scrape.id, "completed", {
          video_count: videos.length,
        });

        // Use requested video limit from scrape record, fallback to user's limit
        const videoLimit = scrape.requested_video_limit || await getUserVideoLimit(user.id);

        // Get videos and stats
        const savedVideos = await getProfileVideos(scrape.profile_id, {
          limit: videoLimit,
          orderBy: "engagement_rate",
          orderDirection: "desc",
        });
        const stats = await getProfileVideoStats(scrape.profile_id);

        return NextResponse.json({
          status: "completed",
          scrape: {
            id: scrape.id,
            status: "completed",
            video_count: videos.length,
          },
          profile: profileRecord,
          videos: savedVideos,
          stats,
        });
      } catch (error: any) {
        console.error("Error processing scrape results:", error);
        await updateScrapeStatus(scrape.id, "failed", {
          error_message: error.message || "Failed to process results",
        });

        return NextResponse.json(
          {
            status: "failed",
            error: "Failed to process results",
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // If failed, update status
    if (scrapeStatus === "failed" && scrape.status !== "failed") {
      await updateScrapeStatus(scrape.id, "failed", {
        error_message: run.status === "FAILED" ? "Apify run failed" : "Apify run aborted",
      });
    }

    // Return current status
    return NextResponse.json({
      status: scrapeStatus,
      scrape: {
        id: scrape.id,
        status: scrapeStatus,
        apify_run_id: runId,
      },
      apify: {
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
      },
    });
  } catch (error: any) {
    console.error("Error checking scrape status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

