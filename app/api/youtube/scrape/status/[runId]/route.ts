import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRunStatus, getRunDatasetItems } from "@/lib/apify/scraper";
import { parseYoutubeOutput } from "@/lib/apify/youtube-scraper";
import {
  getScrapeById,
  updateScrapeStatus,
  getProfileById,
  updateProfileLastScraped,
  getUserVideoLimit,
  getProfileShorts,
  getProfileShortStats,
  insertYoutubeShorts,
} from "@/lib/db";

/**
 * GET /api/youtube/scrape/status/[runId]
 * Check the status of a YouTube Shorts scraping job and process results if complete
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
    console.log(`Checking status for YouTube run: ${runId}`);
    let run;
    try {
      run = await getRunStatus(runId);
    } catch (error: any) {
      console.error(`Error getting run status for ${runId}:`, error);
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
      return NextResponse.json(
        {
          status: "unknown",
          error: "Run not found",
          message: `Run ${runId} not found in Apify.`,
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let items: any[] = [];
        let datasetRetries = 3;
        
        while (datasetRetries > 0) {
          try {
            items = await getRunDatasetItems(runId, 3);
            console.log(`Retrieved ${items.length} items from YouTube Apify run ${runId}`);
            
            if (items.length > 0 || datasetRetries === 1) {
              break;
            }
            
            console.log(`Dataset is empty, waiting 2 seconds before retry (${datasetRetries - 1} retries left)...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            datasetRetries--;
          } catch (datasetError: any) {
            console.error(`Error retrieving dataset items for run ${runId}:`, datasetError);
            
            if (datasetRetries > 1 && (datasetError.statusCode === 404 || datasetError.statusCode === 409)) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              datasetRetries--;
              continue;
            }
            
            await updateScrapeStatus(scrape.id, "failed", {
              error_message: `Failed to retrieve dataset: ${datasetError.message || "Unknown error"}`,
              platform: "youtube",
            });
            
            return NextResponse.json(
              {
                status: "failed",
                error: "Failed to retrieve results",
                message: `The scraping completed but we couldn't retrieve the data. Error: ${datasetError.message || "Unknown error"}`,
              },
              { status: 500 }
            );
          }
        }

        // Parse the items
        let videos: any[] = [];
        let profile: any = {
          display_name: null,
          avatar_url: null,
          follower_count: null,
        };
        
        try {
          const parsed = parseYoutubeOutput(items);
          videos = parsed.videos;
          profile = parsed.profile;
          console.log(`Parsed ${videos.length} YouTube Shorts from ${items.length} items`);
        } catch (parseError: any) {
          console.error(`Error parsing YouTube output for run ${runId}:`, parseError);
          await updateScrapeStatus(scrape.id, "failed", {
            error_message: `Failed to parse results: ${parseError.message || "Unknown error"}`,
            platform: "youtube",
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
            if (profile.display_name || profile.follower_count !== null) {
              const updateData: any = {};
              
              if (profile.display_name) {
                updateData.display_name = profile.display_name;
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
                }
              }
            }
          }
        } catch (profileError: any) {
          console.error(`Error updating profile for scrape ${scrape.id}:`, profileError);
        }

        // Insert shorts
        if (videos.length > 0) {
          try {
            const shortInserts = videos.map((video) => ({
              profile_id: scrape.profile_id,
              scrape_id: scrape.id,
              ...video,
            }));

            await insertYoutubeShorts(shortInserts);
            console.log(`Successfully inserted ${videos.length} YouTube Shorts`);
          } catch (insertError: any) {
            console.error(`Error inserting YouTube Shorts for scrape ${scrape.id}:`, insertError);
            await updateScrapeStatus(scrape.id, "failed", {
              error_message: `Failed to save shorts to database: ${insertError.message || "Unknown error"}`,
              platform: "youtube",
            });
            
            return NextResponse.json(
              {
                status: "failed",
                error: "Failed to save results",
                message: `The scraping completed but we couldn't save the data. Error: ${insertError.message || "Unknown error"}`,
              },
              { status: 500 }
            );
          }
        }

        // Update scrape status
        await updateScrapeStatus(scrape.id, "completed", {
          video_count: videos.length,
          platform: "youtube",
        });

        // Get shorts and stats
        const videoLimit = scrape.requested_video_limit || await getUserVideoLimit(user.id);
        const savedShorts = await getProfileShorts(scrape.profile_id, {
          limit: videoLimit,
          orderBy: "engagement_rate",
          orderDirection: "desc",
        });
        const stats = await getProfileShortStats(scrape.profile_id);

        return NextResponse.json({
          status: "completed",
          scrape: {
            id: scrape.id,
            status: "completed",
            video_count: videos.length,
          },
          profile: profileRecord,
          videos: savedShorts,
          stats,
        });
      } catch (error: any) {
        console.error("Error processing YouTube scrape results:", error);
        await updateScrapeStatus(scrape.id, "failed", {
          error_message: error.message || "Failed to process results",
          platform: "youtube",
        }).catch((updateError) => {
          console.error("Failed to update scrape status after error:", updateError);
        });

        return NextResponse.json(
          {
            status: "failed",
            error: "Failed to process results",
            message: error.message || "An unexpected error occurred",
          },
          { status: 500 }
        );
      }
    }

    // If failed, update status
    if (scrapeStatus === "failed" && scrape.status !== "failed") {
      await updateScrapeStatus(scrape.id, "failed", {
        error_message: run.status === "FAILED" ? "Apify run failed" : "Apify run aborted",
        platform: "youtube",
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
    console.error("Error checking YouTube scrape status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
