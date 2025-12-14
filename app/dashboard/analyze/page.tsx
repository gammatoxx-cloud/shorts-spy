"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import RecentSearches from "@/components/RecentSearches";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LoadingProgressCard from "@/components/LoadingProgressCard";
import { startScrape, pollScrapeStatus, type ScrapeResponse } from "@/lib/api/scrape";
import { startInstagramScrape, pollInstagramScrapeStatus, type InstagramScrapeResponse } from "@/lib/api/instagram-scrape";
import { startYoutubeScrape, pollYoutubeScrapeStatus, type YoutubeScrapeResponse } from "@/lib/api/youtube-scrape";

export default function AnalyzePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"tiktok" | "instagram" | "youtube">("tiktok");
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSearch = async (username: string, videoCount: number) => {
    setIsSearching(true);
    setSearchError(null);
    setProgressMessage(
      selectedPlatform === "tiktok" ? "Starting analysis..." :
      selectedPlatform === "instagram" ? "Initializing analysis..." :
      "Starting YouTube Shorts analysis..."
    );

    try {
      if (selectedPlatform === "tiktok") {
        // Start the TikTok scrape
        const response: ScrapeResponse = await startScrape(username, videoCount);

        // If cached, navigate immediately
        if (response.cached) {
          router.push(`/tiktok/${username}`);
          return;
        }

        // If we have a scrape with run ID, poll for status
        if (response.scrape?.apify_run_id) {
          setProgressMessage("Analyzing TikTok profile... This may take a minute.");

          try {
            const statusResponse = await pollScrapeStatus(
              response.scrape.apify_run_id,
              {
                interval: 5000, // Poll every 5 seconds
                maxAttempts: 60, // Max 5 minutes
                onProgress: (status) => {
                  if (status.status === "running") {
                    setProgressMessage("Still analyzing... Please wait.");
                  }
                },
              }
            );

            if (statusResponse.status === "completed") {
              setProgressMessage("Analysis complete! Redirecting...");
              // Navigate to results page
              setTimeout(() => {
                router.push(`/tiktok/${username}`);
              }, 500);
            } else if (statusResponse.status === "failed") {
              setSearchError(
                statusResponse.error ||
                  statusResponse.message ||
                  "Analysis failed. Please try again."
              );
              setProgressMessage(null);
            }
          } catch (error: any) {
            if (error.message === "Scrape timed out") {
              setSearchError(
                "Analysis is taking longer than expected. Please check back in a few minutes."
              );
            } else {
              setSearchError(error.message || "Failed to check analysis status");
            }
            setProgressMessage(null);
          }
        } else {
          // No run ID, something went wrong
          setSearchError("Failed to start analysis. Please try again.");
          setProgressMessage(null);
        }
      } else {
        // Start the Instagram scrape
        const response: InstagramScrapeResponse = await startInstagramScrape(username, videoCount);

        // If cached, navigate immediately
        if (response.cached) {
          setProgressMessage("Found cached results! Redirecting...");
          setTimeout(() => {
            router.push(`/instagram/${username}`);
          }, 500);
          return;
        }

        // If we have a scrape with run ID, poll for status
        if (response.scrape?.apify_run_id) {
          setProgressMessage("Fetching Instagram profile data...");

          try {
            // Add a small delay before first status check to allow run to initialize
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const statusResponse = await pollInstagramScrapeStatus(
              response.scrape.apify_run_id,
              {
                interval: 5000, // Poll every 5 seconds
                maxAttempts: 60, // Max 5 minutes
                onProgress: (status) => {
                  if (status.status === "running") {
                    setProgressMessage("Analyzing reels and calculating metrics...");
                  }
                },
              }
            );

            if (statusResponse.status === "completed") {
              setProgressMessage("Analysis complete! Preparing your results...");
              // Navigate to results page
              setTimeout(() => {
                router.push(`/instagram/${username}`);
              }, 1000);
            } else if (statusResponse.status === "failed") {
              setSearchError(
                statusResponse.error ||
                  statusResponse.message ||
                  "Analysis failed. Please try again."
              );
              setProgressMessage("Analysis failed. Please try again.");
            }
          } catch (error: any) {
            console.error("Error polling Instagram scrape status:", error);
            if (error.message === "Instagram scrape timed out") {
              setSearchError(
                "Analysis is taking longer than expected. Please check back in a few minutes."
              );
              setProgressMessage("Analysis is taking longer than expected...");
            } else if (error.message?.includes("Run not found") || error.message?.includes("404")) {
              setSearchError(
                "The analysis job could not be found. Please try starting a new analysis."
              );
              setProgressMessage("Analysis job not found. Please try again.");
            } else {
              const errorMsg = error.message || "Failed to check analysis status";
              console.error("Polling error details:", errorMsg);
              setSearchError(errorMsg);
              setProgressMessage("Failed to check analysis status. Please try again.");
            }
          }
        } else {
          // No run ID, something went wrong
          setSearchError("Failed to start analysis. Please try again.");
          setProgressMessage("Failed to start analysis");
        }
      } else if (selectedPlatform === "youtube") {
        // Start the YouTube scrape
        const response: YoutubeScrapeResponse = await startYoutubeScrape(username, videoCount);

        // If cached, navigate immediately
        if (response.cached) {
          setProgressMessage("Found cached results! Redirecting...");
          setTimeout(() => {
            router.push(`/youtube/${username}`);
          }, 500);
          return;
        }

        // If we have a scrape with run ID, poll for status
        if (response.scrape?.apify_run_id) {
          setProgressMessage("Fetching YouTube Shorts data...");

          try {
            // Add a small delay before first status check to allow run to initialize
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const statusResponse = await pollYoutubeScrapeStatus(
              response.scrape.apify_run_id,
              {
                interval: 5000, // Poll every 5 seconds
                maxAttempts: 60, // Max 5 minutes
                onProgress: (status) => {
                  if (status.status === "running") {
                    setProgressMessage("Analyzing shorts and calculating metrics...");
                  }
                },
              }
            );

            if (statusResponse.status === "completed") {
              setProgressMessage("Analysis complete! Preparing your results...");
              // Navigate to results page
              setTimeout(() => {
                router.push(`/youtube/${username}`);
              }, 1000);
            } else if (statusResponse.status === "failed") {
              setSearchError(
                statusResponse.error ||
                  statusResponse.message ||
                  "Analysis failed. Please try again."
              );
              setProgressMessage("Analysis failed. Please try again.");
            }
          } catch (error: any) {
            console.error("Error polling YouTube scrape status:", error);
            if (error.message === "YouTube scrape timed out") {
              setSearchError(
                "Analysis is taking longer than expected. Please check back in a few minutes."
              );
              setProgressMessage("Analysis is taking longer than expected...");
            } else if (error.message?.includes("Run not found") || error.message?.includes("404")) {
              setSearchError(
                "The analysis job could not be found. Please try starting a new analysis."
              );
              setProgressMessage("Analysis job not found. Please try again.");
            } else {
              const errorMsg = error.message || "Failed to check analysis status";
              console.error("Polling error details:", errorMsg);
              setSearchError(errorMsg);
              setProgressMessage("Failed to check analysis status. Please try again.");
            }
          }
        } else {
          // No run ID, something went wrong
          setSearchError("Failed to start analysis. Please try again.");
          setProgressMessage("Failed to start analysis");
        }
      }
    } catch (error: any) {
      console.error("Search error:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.message?.includes("Rate limit")) {
        errorMessage = "You've reached your daily limit of 10 analyses. Please try again tomorrow.";
      } else if (error.message?.includes("Unauthorized")) {
        const platformName = selectedPlatform === "tiktok" ? "TikTok" : selectedPlatform === "instagram" ? "Instagram" : "YouTube";
        errorMessage = `Please sign in to analyze ${platformName} creators.`;
      } else if (error.message?.includes("not found") || error.message?.includes("404")) {
        const platformName = selectedPlatform === "tiktok" ? "TikTok" : selectedPlatform === "instagram" ? "Instagram" : "YouTube";
        errorMessage = `${platformName} ${selectedPlatform === "youtube" ? "channel" : "username"} not found. Please check and try again.`;
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Analysis is taking longer than expected. The analysis will continue in the background. Please check back in a few minutes.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSearchError(errorMessage);
      setProgressMessage(null);
    } finally {
      if (selectedPlatform === "tiktok") {
        setIsSearching(false);
      } else {
        // Reset searching state after a delay for Instagram/YouTube
        setTimeout(() => {
          setIsSearching(false);
        }, 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/70 mb-4">
            Please sign in to access the dashboard.
          </p>
          <Link
            href="/auth/login"
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              selectedPlatform === "tiktok" ? "from-blue-500/20 to-purple-500/20 border border-blue-500/30" :
              selectedPlatform === "instagram" ? "from-purple-500/20 to-pink-500/20 border border-purple-500/30" :
              "from-red-500/20 to-orange-500/20 border border-red-500/30"
            } flex items-center justify-center backdrop-blur-sm`}>
              {selectedPlatform === "tiktok" ? (
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ) : selectedPlatform === "instagram" ? (
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1 text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Analyze
              </h1>
              <p className="text-white/60 text-sm">
                Analyze creators and discover top-performing content
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Form Card */}
        <div className={`card-modern-search relative overflow-hidden mb-10 transition-all duration-300 ${isSearching ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* Gradient accent border */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            selectedPlatform === "tiktok" ? "from-blue-500/10 via-purple-500/10 to-blue-500/10" :
            selectedPlatform === "instagram" ? "from-purple-500/10 via-pink-500/10 to-purple-500/10" :
            "from-red-500/10 via-orange-500/10 to-red-500/10"
          } opacity-50 pointer-events-none`}></div>
          <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${
            selectedPlatform === "tiktok" ? "via-blue-500/50" :
            selectedPlatform === "instagram" ? "via-purple-500/50" :
            "via-red-500/50"
          } to-transparent`}></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                selectedPlatform === "tiktok" ? "from-blue-500/20 to-purple-500/20 border border-blue-500/30" :
                selectedPlatform === "instagram" ? "from-purple-500/20 to-pink-500/20 border border-purple-500/30" :
                "from-red-500/20 to-orange-500/20 border border-red-500/30"
              } flex items-center justify-center`}>
                {selectedPlatform === "tiktok" ? (
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ) : selectedPlatform === "instagram" ? (
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Analyze a Creator
              </h2>
            </div>
            <SearchInput
              onSearch={handleSearch}
              isLoading={isSearching}
              error={searchError}
              platform={selectedPlatform}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
            />
          </div>
        </div>

        {/* Loading Progress Card */}
        {progressMessage && (
          <div className="mb-10">
            <LoadingProgressCard message={progressMessage} platform={selectedPlatform} />
          </div>
        )}

        {/* Recent Searches with better spacing */}
        <div className="mt-12">
          <RecentSearches />
        </div>
      </div>
    </div>
  );
}

