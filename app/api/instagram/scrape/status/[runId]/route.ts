import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRunStatus, getRunDatasetItems } from "@/lib/apify/scraper";
import { parseInstagramOutput } from "@/lib/apify/instagram-scraper";
import {
  getScrapeById,
  updateScrapeStatus,
  getProfileById,
  updateProfileLastScraped,
  getUserVideoLimit,
  getProfileReels,
  getProfileReelStats,
  insertInstagramReels,
} from "@/lib/db";

/**
 * GET /api/instagram/scrape/status/[runId]
 * Check the status of an Instagram scraping job and process results if complete
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
    console.log(`Checking status for Instagram run: ${runId}`);
    let run;
    try {
      run = await getRunStatus(runId);
    } catch (error: any) {
      console.error(`Error getting run status for ${runId}:`, error);
      // If it's a 404, the run doesn't exist
      if (error.statusCode === 404 || error.statusCode === 40400) {
        return NextResponse.json(
          {
            status: "unknown",
            error: "Run not found",
            message: `Run ${runId} not found in Apify. The run may not exist or may have been deleted.`,
          },
          { status: 404 }
        );
      }
      // For other errors, return 500
      return NextResponse.json(
        {
          status: "unknown",
          error: "Failed to check run status in Apify",
          message: error.message || "Error checking Apify run status",
        },
        { status: 500 }
      );
    }

    if (!run) {
      console.warn(`Run ${runId} not found in Apify (returned null)`);
      return NextResponse.json(
        {
          status: "unknown",
          error: "Run not found",
          message: `Run ${runId} not found in Apify. The run may not exist or may have been deleted.`,
        },
        { status: 404 }
      );
    }

    console.log(`Run ${runId} found with status: ${run.status}`);

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
        console.log(`Run ${runId} is completed, processing results...`);
        
        // Get dataset items from Apify
        // Wait a moment for dataset to be fully ready after run completes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let items: any[] = [];
        let datasetRetries = 3;
        let lastError: any = null;
        
        // Retry dataset retrieval if it fails or is empty
        while (datasetRetries > 0) {
          try {
            items = await getRunDatasetItems(runId, 3); // 3 retries inside the function
            console.log(`Retrieved ${items.length} items from Instagram Apify run ${runId} (attempt ${4 - datasetRetries})`);
            
            // If we got items or the run definitely has no dataset, break
            if (items.length > 0 || datasetRetries === 1) {
              break;
            }
            
            // If empty, wait and retry
            console.log(`Dataset is empty, waiting 2 seconds before retry (${datasetRetries - 1} retries left)...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            datasetRetries--;
          } catch (datasetError: any) {
            console.error(`Error retrieving dataset items for run ${runId} (attempt ${4 - datasetRetries}):`, datasetError);
            lastError = datasetError;
            
            // If it's a transient error, retry
            if (datasetRetries > 1 && (datasetError.statusCode === 404 || datasetError.statusCode === 409)) {
              console.log(`Transient error, waiting 2 seconds before retry (${datasetRetries - 1} retries left)...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              datasetRetries--;
              continue;
            }
            
            // Fatal error or out of retries
            await updateScrapeStatus(scrape.id, "failed", {
              error_message: `Failed to retrieve dataset after retries: ${datasetError.message || "Unknown error"}`,
              platform: "instagram",
            });
            
            return NextResponse.json(
              {
                status: "failed",
                error: "Failed to retrieve results",
                message: `The scraping completed but we couldn't retrieve the data after multiple attempts. Error: ${datasetError.message || "Unknown error"}`,
              },
              { status: 500 }
            );
          }
        }

        if (items.length === 0) {
          console.warn(`Warning: Instagram Apify run ${runId} completed but returned 0 items after all retries`);
        }

        // Parse the items
        let videos: any[] = [];
        let profile: any = {
          display_name: null,
          avatar_url: null,
          follower_count: null,
        };
        
        try {
          const parsed = parseInstagramOutput(items);
          videos = parsed.videos;
          profile = parsed.profile;
          console.log(`Parsed ${videos.length} Instagram reels from ${items.length} items`);
        } catch (parseError: any) {
          console.error(`Error parsing Instagram output for run ${runId}:`, parseError);
          console.error("Raw items sample:", items.length > 0 ? JSON.stringify(items[0], null, 2) : "No items");
          await updateScrapeStatus(scrape.id, "failed", {
            error_message: `Failed to parse results: ${parseError.message || "Unknown error"}`,
            platform: "instagram",
          });
          
          return NextResponse.json(
            {
              status: "failed",
              error: "Failed to parse results",
              message: `The scraping completed but we couldn't parse the data. Error: ${parseError.message || "Unknown error"}`,
            },
            { status: 500 }
          );
        }

        // Check if we got profile info but no videos (empty channel scenario)
        if (videos.length === 0 && items.length > 0) {
          console.warn(`Warning: Instagram actor completed but found 0 reels for profile. Items in dataset: ${items.length}`);
          console.log("This could mean:");
          console.log("1. The profile has no reels");
          console.log("2. The profile is private or restricted");
          console.log("3. Instagram is blocking the scraper");
          console.log("4. The profile username format is incorrect");

          // Still update profile info if we got it
          const profileRecord = await getProfileById(scrape.profile_id);
          if (profileRecord) {
            await updateProfileLastScraped(
              scrape.profile_id,
              new Date()
            );
            // Update profile metadata if available
            if (profile.display_name || profile.avatar_url || profile.follower_count !== null) {
              const updateData: any = {};
              
              // Only update fields that have new values
              if (profile.display_name) {
                updateData.display_name = profile.display_name;
              }
              if (profile.avatar_url) {
                updateData.avatar_url = profile.avatar_url;
                console.log(`Updating profile avatar URL for profile ${scrape.profile_id}`);
              }
              if (profile.follower_count !== null) {
                updateData.follower_count = profile.follower_count;
              }
              
              if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update(updateData)
                  .eq("id", scrape.profile_id);
                
                if (updateError) {
                  console.error(`Error updating profile metadata:`, updateError);
                } else {
                  console.log(`Successfully updated profile metadata for profile ${scrape.profile_id}`);
                }
              }
            }
          }

          // Mark as completed but with 0 reels
          await updateScrapeStatus(scrape.id, "completed", {
            video_count: 0,
            error_message: "Actor completed but found no reels. This could mean the profile has no reels, is private, or Instagram is blocking the scraper.",
            platform: "instagram",
          });

          // Return early with empty results
          const videoLimit = scrape.requested_video_limit || await getUserVideoLimit(user.id);
          const savedReels = await getProfileReels(scrape.profile_id, {
            limit: videoLimit,
            orderBy: "engagement_rate",
            orderDirection: "desc",
          });
          const stats = await getProfileReelStats(scrape.profile_id);

          return NextResponse.json({
            status: "completed",
            scrape: {
              id: scrape.id,
              status: "completed",
              video_count: 0,
            },
            profile: profileRecord,
            videos: savedReels || [],
            stats,
            message: "Analysis completed but no reels were found. The profile may be empty, private, or Instagram may be blocking the scraper.",
          });
        }

        // Update profile info
        let profileRecord;
        try {
          profileRecord = await getProfileById(scrape.profile_id);
          if (profileRecord) {
            await updateProfileLastScraped(
              scrape.profile_id,
              new Date()
            );
            // Update profile metadata if available
            if (profile.display_name || profile.avatar_url || profile.follower_count !== null) {
              const updateData: any = {};
              
              // Only update fields that have new values
              if (profile.display_name) {
                updateData.display_name = profile.display_name;
              }
              if (profile.avatar_url) {
                updateData.avatar_url = profile.avatar_url;
                console.log(`Updating profile avatar URL for profile ${scrape.profile_id}`);
              }
              if (profile.follower_count !== null) {
                updateData.follower_count = profile.follower_count;
              }
              
              if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update(updateData)
                  .eq("id", scrape.profile_id);
                
                if (updateError) {
                  console.error(`Error updating profile metadata:`, updateError);
                } else {
                  console.log(`Successfully updated profile metadata for profile ${scrape.profile_id}`);
                }
              }
            }
          }
        } catch (profileError: any) {
          console.error(`Error updating profile for scrape ${scrape.id}:`, profileError);
          // Continue processing even if profile update fails
        }

        // Insert reels
        if (videos.length > 0) {
          try {
            const reelInserts = videos.map((video) => ({
              profile_id: scrape.profile_id,
              scrape_id: scrape.id,
              ...video,
            }));

            await insertInstagramReels(reelInserts);
            console.log(`Successfully inserted ${videos.length} Instagram reels`);
          } catch (insertError: any) {
            console.error(`Error inserting Instagram reels for scrape ${scrape.id}:`, insertError);
            await updateScrapeStatus(scrape.id, "failed", {
              error_message: `Failed to save reels to database: ${insertError.message || "Unknown error"}`,
              platform: "instagram",
            });
            
            return NextResponse.json(
              {
                status: "failed",
                error: "Failed to save results",
                message: `The scraping completed but we couldn't save the data to the database. Error: ${insertError.message || "Unknown error"}`,
              },
              { status: 500 }
            );
          }
        }

        // Update scrape status
        try {
          await updateScrapeStatus(scrape.id, "completed", {
            video_count: videos.length,
            platform: "instagram",
          });
        } catch (statusError: any) {
          console.error(`Error updating scrape status for ${scrape.id}:`, statusError);
          // Continue even if status update fails
        }

        // Use requested video limit from scrape record, fallback to user's limit
        const videoLimit = scrape.requested_video_limit || await getUserVideoLimit(user.id);

        // Get reels and stats
        let savedReels: any[] = [];
        let stats: any = null;
        try {
          savedReels = await getProfileReels(scrape.profile_id, {
            limit: videoLimit,
            orderBy: "engagement_rate",
            orderDirection: "desc",
          });
          stats = await getProfileReelStats(scrape.profile_id);
        } catch (retrievalError: any) {
          console.error(`Error retrieving saved reels/stats for scrape ${scrape.id}:`, retrievalError);
          // Use empty defaults if retrieval fails
          stats = {
            totalVideos: videos.length,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            averageViews: 0,
            averageLikes: 0,
            averageEngagementRate: 0,
            bestVideo: null,
            postingFrequency: { perWeek: 0, perMonth: 0 },
          };
        }

        return NextResponse.json({
          status: "completed",
          scrape: {
            id: scrape.id,
            status: "completed",
            video_count: videos.length,
          },
          profile: profileRecord,
          videos: savedReels,
          stats,
        });
      } catch (error: any) {
        console.error("Error processing Instagram scrape results:", error);
        console.error("Error stack:", error.stack);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          name: error.name,
        });
        
        const errorMessage = error.message || "Failed to process results";
        await updateScrapeStatus(scrape.id, "failed", {
          error_message: errorMessage,
          platform: "instagram",
        }).catch((updateError) => {
          console.error("Failed to update scrape status after error:", updateError);
        });

        return NextResponse.json(
          {
            status: "failed",
            error: "Failed to process results",
            message: errorMessage,
            details: process.env.NODE_ENV === "development" ? error.stack : undefined,
          },
          { status: 500 }
        );
      }
    }

    // If failed, update status
    if (scrapeStatus === "failed" && scrape.status !== "failed") {
      await updateScrapeStatus(scrape.id, "failed", {
        error_message: run.status === "FAILED" ? "Apify run failed" : "Apify run aborted",
        platform: "instagram",
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
    console.error("Error checking Instagram scrape status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

