"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import RecentActivity from "@/components/RecentActivity";

interface DashboardStats {
  stats: {
    total_scrapes: number;
    tiktok_scrapes: number;
    instagram_scrapes: number;
    completed_scrapes: number;
    pending_scrapes: number;
    total_videos_analyzed: number;
    saved_videos_count: number;
  };
  subscription: {
    tier: string;
    status: string;
    video_limit: number;
    current_period_end: string | null;
  };
  rate_limits: {
    scrape: {
      used: number;
      limit: number;
      remaining: number;
      reset_at: string;
    };
    refresh: {
      used: number;
      limit: number;
      remaining: number;
      reset_at: string;
    };
  };
  recent_searches: any[];
  recent_saved_videos: any[];
  most_analyzed_creators: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("An error occurred while loading statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getTimeUntilReset = (resetAt: string): string => {
    const reset = new Date(resetAt);
    const now = new Date();
    const diffMs = reset.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
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

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="card-modern p-8 text-center">
            <p className="text-white/70 mb-4">
              {error || "Failed to load dashboard statistics"}
            </p>
            <button
              onClick={fetchDashboardStats}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-500/40 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-blue-500/20">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-2 text-white bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-white/70 text-base">
                Overview of your activity and statistics
              </p>
            </div>
          </div>
        </div>

        {/* Platform Breakdown & Quick Actions Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Platform Analytics & Actions
            </h2>
          </div>
          
          {/* Platform Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardStatsCard
            title="TikTok Analyses"
            value={stats.stats.tiktok_scrapes}
            subtitle={`${formatNumber(stats.stats.total_videos_analyzed)} videos analyzed`}
            gradient="blue"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            }
            onClick={() => router.push("/dashboard/tiktok")}
          />
          <DashboardStatsCard
            title="Instagram Analyses"
            value={stats.stats.instagram_scrapes}
            subtitle="Reels analyzed"
            gradient="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
              </svg>
            }
            onClick={() => router.push("/dashboard/instagram")}
          />
          </div>

          {/* Enhanced Quick Actions */}
          <div className="card-modern p-8 bg-gradient-to-br from-white/5 to-transparent border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
            </div>
            <Link
              href="/dashboard/analyze"
              className="group relative overflow-hidden card-modern p-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/5 border-2 border-blue-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 border-2 border-blue-500/40 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-6 h-6 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 w-full md:w-auto">
                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    Analyze a Creator
                  </h4>
                  <p className="text-base text-white/70 mb-3">Search and analyze TikTok or Instagram creators</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
                      {stats.stats.tiktok_scrapes} TikTok
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
                      {stats.stats.instagram_scrapes} Instagram
                    </span>
                  </div>
                </div>
                <svg className="hidden md:block w-8 h-8 text-white/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Quick Stats
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Total Analyses"
            value={stats.stats.total_scrapes}
            subtitle={`${stats.stats.completed_scrapes} completed`}
            gradient="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <DashboardStatsCard
            title="Saved Videos"
            value={stats.stats.saved_videos_count}
            subtitle="Videos bookmarked"
            gradient="teal"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
            onClick={() => router.push("/dashboard/saved")}
          />
          <DashboardStatsCard
            title="Daily Analyses"
            value={`${stats.rate_limits.scrape.remaining}/${stats.rate_limits.scrape.limit}`}
            subtitle={`Resets in ${getTimeUntilReset(stats.rate_limits.scrape.reset_at)}`}
            gradient={stats.rate_limits.scrape.remaining === 0 ? "yellow" : "emerald"}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <DashboardStatsCard
            title="Subscription"
            value={stats.subscription.tier === "paid" ? "Paid" : "Free"}
            subtitle={`${stats.subscription.video_limit} videos per analysis`}
            gradient={stats.subscription.tier === "paid" ? "purple" : "blue"}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            onClick={() => router.push("/dashboard/settings")}
          />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full" />
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
          </div>
          <RecentActivity
            recentSearches={stats.recent_searches}
            recentSavedVideos={stats.recent_saved_videos}
            onViewAllSearches={() => {
              // Could navigate to a full recent searches page, or just scroll
              router.push("/dashboard/tiktok");
            }}
            onViewAllSaved={() => router.push("/dashboard/saved")}
          />
        </div>

        {/* Most Analyzed Creators */}
        {stats.most_analyzed_creators.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full" />
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Most Analyzed Creators
              </h2>
            </div>
            <div className="card-modern p-8 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border-pink-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.most_analyzed_creators.map((item) => {
                const platform = item.profile.platform || "tiktok";
                return (
                  <button
                    key={item.profile.id}
                    onClick={() => {
                      if (platform === "instagram") {
                        router.push(`/instagram/${item.profile.username}`);
                      } else {
                        router.push(`/tiktok/${item.profile.username}`);
                      }
                    }}
                    className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 text-left w-full"
                  >
                    {item.profile.avatar_url ? (
                      <img
                        src={item.profile.avatar_url}
                        alt={item.profile.username}
                        className="w-14 h-14 rounded-full border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                        platform === "instagram" 
                          ? "from-purple-500 to-pink-500" 
                          : "from-blue-500 to-cyan-500"
                      } flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-semibold text-base">
                          {item.profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {item.profile.display_name || item.profile.username}
                      </p>
                      <p className="text-xs text-white/60 truncate mb-1">@{item.profile.username}</p>
                      <p className="text-xs text-white/50">
                        {item.analysis_count} {item.analysis_count === 1 ? "analysis" : "analyses"}
                      </p>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
