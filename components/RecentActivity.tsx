"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecentSearch {
  scrape: {
    id: string;
    status: string;
    video_count: number;
    created_at: string;
    completed_at: string | null;
    platform: "tiktok" | "instagram";
  };
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    platform: "tiktok" | "instagram";
  } | null;
}

interface RecentSavedVideo {
  id: string;
  video_id: string;
  video_url: string;
  description: string | null;
  thumbnail_url: string | null;
  platform: "tiktok" | "instagram";
  creator: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface RecentActivityProps {
  recentSearches: RecentSearch[];
  recentSavedVideos: RecentSavedVideo[];
  onViewAllSearches?: () => void;
  onViewAllSaved?: () => void;
}

export default function RecentActivity({
  recentSearches,
  recentSavedVideos,
  onViewAllSearches,
  onViewAllSaved,
}: RecentActivityProps) {
  const router = useRouter();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPlatformIcon = (platform: "tiktok" | "instagram") => {
    if (platform === "instagram") {
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

  const handleSearchClick = (username: string, platform: "tiktok" | "instagram") => {
    if (platform === "instagram") {
      router.push(`/instagram/${username}`);
    } else {
      router.push(`/tiktok/${username}`);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Recent Searches */}
      <div className="card-modern p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Recent Searches
            </h3>
          </div>
          {onViewAllSearches && (
            <button
              onClick={onViewAllSearches}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all
            </button>
          )}
        </div>
        {recentSearches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No recent searches</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((search) => {
              if (!search.profile) return null;
              const platform = search.scrape.platform;
              return (
                <button
                  key={search.scrape.id}
                  onClick={() => handleSearchClick(search.profile!.username, platform)}
                  className="group w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] text-left"
                >
                  {search.profile.avatar_url ? (
                    <img
                      src={search.profile.avatar_url}
                      alt={search.profile.username}
                      className="w-12 h-12 rounded-full border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      platform === "instagram" 
                        ? "from-purple-500 to-pink-500" 
                        : "from-blue-500 to-cyan-500"
                    } flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-semibold text-sm">
                        {search.profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {search.profile.display_name || search.profile.username}
                      </p>
                      <span className={`flex items-center flex-shrink-0 ${
                        platform === "instagram" ? "text-purple-400" : "text-blue-400"
                      }`}>
                        {getPlatformIcon(platform)}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">
                      {formatDate(search.scrape.created_at)}
                    </p>
                  </div>
                  {search.scrape.status === "completed" && (
                    <span className="text-xs text-emerald-400 font-medium whitespace-nowrap flex-shrink-0 ml-2">
                      {search.scrape.video_count} videos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Saved Videos */}
      <div className="card-modern p-6 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border-teal-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Recent Saved Videos
            </h3>
          </div>
          {onViewAllSaved && (
            <button
              onClick={onViewAllSaved}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              View all
            </button>
          )}
        </div>
        {recentSavedVideos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No saved videos yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSavedVideos.map((video) => {
              const platform = video.platform;
              return (
                <Link
                  key={video.id}
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 transition-all duration-300 hover:scale-[1.01]"
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.description || "Video thumbnail"}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-2 mb-2">
                      {video.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white/60 truncate">
                        @{video.creator.username}
                      </p>
                      <span className={`flex items-center flex-shrink-0 ${
                        platform === "instagram" ? "text-purple-400" : "text-blue-400"
                      }`}>
                        {getPlatformIcon(platform)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

