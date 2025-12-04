"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecentSearch {
  scrape: {
    id: string;
    status: string;
    video_count: number;
    created_at: string;
    completed_at: string | null;
    platform?: string | null;
  };
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    platform?: string;
  } | null;
}

interface RecentSearchesProps {
  platform?: "tiktok" | "instagram";
}

export default function RecentSearches({ platform }: RecentSearchesProps) {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [totalSearches, setTotalSearches] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRecentSearches(displayCount);
  }, [displayCount]);

  const fetchRecentSearches = async (limit: number) => {
    try {
      setLoading(true);
      // Always fetch all platforms (no platform filter)
      const url = `/api/recent-searches?limit=${limit}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
        setTotalSearches(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching recent searches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const handleSearchClick = (username: string, searchPlatform?: string | null) => {
    // Determine route based on platform from search data
    if (searchPlatform === "instagram") {
      router.push(`/instagram/${username}`);
    } else {
      router.push(`/tiktok/${username}`);
    }
  };

  const getPlatformIcon = (searchPlatform?: string | null) => {
    if (searchPlatform === "instagram") {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card-modern p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Searches</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-4 p-3 rounded-lg bg-white/5"
            >
              <div className="w-12 h-12 rounded-full bg-white/10"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="card-modern p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Searches</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">
            Your recent analyses will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Recent Searches</h2>
      </div>
      <div className="space-y-3">
        {searches.map((search) => {
          if (!search.profile) return null;

          const isCompleted = search.scrape.status === "completed";
          const isRunning = search.scrape.status === "running" || search.scrape.status === "pending";
          const isFailed = search.scrape.status === "failed";
          const searchPlatform = search.scrape.platform || search.profile.platform;

          return (
            <button
              key={search.scrape.id}
              onClick={() => handleSearchClick(search.profile!.username, searchPlatform)}
              className="w-full flex items-center gap-4 p-4 rounded-lg glass-sm hover:glass-md transition-all duration-300 text-left group relative overflow-hidden"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex-shrink-0">
                {search.profile.avatar_url ? (
                  <div className="relative">
                    <img
                      src={search.profile.avatar_url}
                      alt={search.profile.display_name || search.profile.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-500/30 transition-colors duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-[rgba(15,15,25,0.6)] flex items-center justify-center text-blue-400">
                      {getPlatformIcon(searchPlatform)}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/10 group-hover:border-blue-500/30 transition-colors duration-300">
                      {(search.profile.display_name || search.profile.username)[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-[rgba(15,15,25,0.6)] flex items-center justify-center text-blue-400">
                      {getPlatformIcon(searchPlatform)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="font-semibold text-white truncate mb-1.5 group-hover:text-blue-300 transition-colors duration-200">
                  @{search.profile.username}
                </div>
                <div className="text-sm text-white/60 flex items-center gap-2 flex-wrap">
                  {isCompleted && (
                    <span className="glass-badge px-2.5 py-1 rounded-md bg-green-500/20 border-green-500/50 text-green-400 text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {search.scrape.video_count} {searchPlatform === "instagram" ? "reels" : "videos"}
                    </span>
                  )}
                  {isRunning && (
                    <span className="glass-badge px-2.5 py-1 rounded-md bg-blue-500/20 border-blue-500/50 text-blue-400 text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Analyzing...
                    </span>
                  )}
                  {isFailed && (
                    <span className="glass-badge px-2.5 py-1 rounded-md bg-red-500/20 border-red-500/50 text-red-400 text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Failed
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-white/40 group-hover:text-white/60 transition-colors duration-200 relative z-10 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(search.scrape.created_at).toLocaleDateString()}
              </div>
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Show More and See All buttons */}
      {(() => {
        const hasMore = displayCount < totalSearches;
        const showSeeAll = totalSearches > displayCount;
        
        if (!hasMore && !showSeeAll) return null;
        
        return (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            {hasMore && (
              <button
                onClick={handleShowMore}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Show More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
            {showSeeAll && (
              <Link
                href="/dashboard/history"
                className="w-full px-4 py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500/70 text-blue-400 hover:text-blue-300 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                See All Searches
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        );
      })()}
    </div>
  );
}

