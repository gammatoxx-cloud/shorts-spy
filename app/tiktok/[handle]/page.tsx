"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoTable from "@/components/VideoTable";
import CacheTimestamp from "@/components/CacheTimestamp";
import InsightsPanel from "@/components/InsightsPanel";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  last_scraped_at: string | null;
}

interface Video {
  id: string;
  video_id: string;
  video_url: string;
  description: string | null;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  engagement_rate: number;
  posted_at: string | null;
  duration_seconds: number | null;
}

interface Stats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  bestVideo: Video | null;
  postingFrequency: {
    perWeek: number;
    perMonth: number;
  };
}

export default function TikTokResultsPage() {
  const params = useParams();
  const router = useRouter();
  const handle = params.handle as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);
  const [videoLimit, setVideoLimit] = useState<number>(20);

  useEffect(() => {
    fetchData();
  }, [handle]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/creators/${handle}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Creator not found. Try analyzing this profile first.");
        } else {
          setError("Failed to load creator data.");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProfile(data.profile);
      setVideos(data.videos || []);
      setStats(data.stats);
      setCacheTimestamp(data.cacheTimestamp);
      setVideoLimit(data.videoLimit || 20);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while loading the data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton type="profile" />
          <div className="mb-8">
            <LoadingSkeleton type="cards" />
          </div>
          <LoadingSkeleton type="table" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="card-modern p-6 border-red-500/50 glass-strong">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  Unable to Load Creator Data
                </h2>
                <p className="text-red-300 mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={fetchData}
                    className="btn-glass inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/dashboard"
            className="text-sm text-white/60 hover:text-white mb-6 inline-block transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="card-modern p-6 mb-6">
            <div className="flex items-center gap-6">
              {profile.avatar_url ? (
                <div className="relative">
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/50 shadow-glow"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse"></div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-500/50 shadow-glow">
                  {(profile.display_name || profile.username)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">
                  @{profile.username}
                </h1>
                {profile.display_name && (
                  <p className="text-lg text-white/80 mb-2">
                    {profile.display_name}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  {profile.follower_count && (
                    <div className="flex items-center gap-2 text-white/70">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{profile.follower_count.toLocaleString()} followers</span>
                    </div>
                  )}
                  <CacheTimestamp timestamp={cacheTimestamp} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10" aria-label="Statistics summary">
            <div className="card-modern p-5 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/70">
                  Total Videos
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.totalVideos}
              </div>
            </div>
            <div className="card-modern p-5 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/70">
                  Average Views
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {(() => {
                  const avg = stats.totalVideos > 0 ? Math.round(stats.totalViews / stats.totalVideos) : 0;
                  return avg.toLocaleString();
                })()}
              </div>
            </div>
            <div className="card-modern p-5 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/70">
                  Avg Engagement
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.averageEngagementRate.toFixed(2)}%
              </div>
            </div>
            <div className="card-modern p-5 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/70">
                  Average Likes
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {(() => {
                  const avg = stats.totalVideos > 0 ? Math.round(stats.totalLikes / stats.totalVideos) : 0;
                  return avg.toLocaleString();
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Video Limit Notice */}
        {videos.length >= videoLimit && stats && stats.totalVideos > videoLimit && (
          <div className="card-modern p-4 mb-6 border-yellow-500/50 glass-md">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-300">
                  <strong>Free tier limit:</strong> Showing {videoLimit} of{" "}
                  {stats.totalVideos} videos.{" "}
                  {videoLimit === 20 && (
                    <Link
                      href="/pricing"
                      className="font-medium hover:underline underline-offset-2 text-yellow-200"
                    >
                      Upgrade to paid to see all {stats.totalVideos} videos
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights Panel - Above the table */}
        {stats && (
          <div className="mb-8">
            <InsightsPanel
              bestVideo={stats.bestVideo}
              postingFrequency={stats.postingFrequency}
              averageEngagementRate={stats.averageEngagementRate}
              compact={true}
            />
          </div>
        )}

        {/* Video Table - Full Width */}
        <div className="mb-10" aria-label="Videos">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Videos</h2>
            <div className="text-sm text-white/50">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </div>
          </div>
          <VideoTable videos={videos} />
        </div>
      </div>
    </div>
  );
}
