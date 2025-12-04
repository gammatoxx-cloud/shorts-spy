"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { BookmarkSlashIcon, PlayIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";

type SortField = "engagement_rate" | "likes" | "views";
type SortDirection = "asc" | "desc";

interface SavedVideo {
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
  created_at: string;
  saved_at: string;
  platform: "tiktok" | "instagram";
  creator: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function SavedContentPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavingVideoId, setUnsavingVideoId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("engagement_rate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchSavedVideos();
    }
  }, [user]);

  const fetchSavedVideos = async () => {
    try {
      const response = await fetch("/api/saved-videos");
      if (response.ok) {
        const data = await response.json();
        setSavedVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Error fetching saved videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (savedVideoId: string, videoId: string, platform: "tiktok" | "instagram") => {
    if (unsavingVideoId) return;

    setUnsavingVideoId(savedVideoId);

    try {
      const response = await fetch("/api/saved-videos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_id: videoId, platform: platform }),
      });

      if (response.ok) {
        // Remove from local state using database UUID
        setSavedVideos((prev) => prev.filter((v) => v.id !== savedVideoId));
      } else {
        console.error("Error unsaving video");
      }
    } catch (error) {
      console.error("Error unsaving video:", error);
    } finally {
      setUnsavingVideoId(null);
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

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateWords = (text: string | null, maxWords: number = 5): { truncated: string; isTruncated: boolean } => {
    if (!text) return { truncated: "No description", isTruncated: false };
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return { truncated: text, isTruncated: false };
    }
    return {
      truncated: words.slice(0, maxWords).join(" ") + "...",
      isTruncated: true,
    };
  };

  const getEngagementBadge = (rate: number) => {
    if (rate >= 8) {
      return {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        pulse: true,
        icon: true,
      };
    } else if (rate >= 5) {
      return {
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/50",
        text: "text-yellow-400",
        pulse: false,
        icon: false,
      };
    } else {
      return {
        bg: "bg-gray-500/20",
        border: "border-gray-500/50",
        text: "text-gray-400",
        pulse: false,
        icon: false,
      };
    }
  };

  // Sort videos
  const sortedVideos = useMemo(() => {
    const sorted = [...savedVideos];
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "engagement_rate":
          aValue = Number(a.engagement_rate);
          bValue = Number(b.engagement_rate);
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "likes":
          aValue = a.likes;
          bValue = b.likes;
          break;
        default:
          return 0;
      }

      const comparison = aValue - bValue;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [savedVideos, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const paginatedVideos = sortedVideos.slice(startIndex, endIndex);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (authLoading || loading) {
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
            Please sign in to view saved content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-1 text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">Saved Content</h1>
          <p className="text-white/60 text-sm">
            Videos you&apos;ve saved for later viewing
          </p>
        </div>

        <div className="space-y-10">
          {/* Stats Card */}
          {savedVideos.length > 0 && (
            <div className="card-modern p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/40 flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <BookmarkIconSolid className="w-7 h-7 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1 font-medium">Total Saved Videos</p>
                  <p className="text-4xl font-bold text-white">{savedVideos.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Saved Videos Table */}
          {savedVideos.length === 0 ? (
            <div className="card-modern p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <BookmarkIconSolid className="w-10 h-10 text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No saved videos yet</h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto text-base leading-relaxed">
                  Start saving videos from creator analysis pages to view them here later.
                </p>
                <Link
                  href="/dashboard"
                  className="btn-glass-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
                >
                  Browse Creators
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-modern overflow-hidden">
              {/* Sort Controls */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/70 font-medium">Sort by:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSort("engagement_rate")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sortField === "engagement_rate"
                          ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Engagement</span>
                        {sortField === "engagement_rate" && (
                          sortDirection === "desc" ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronUpIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleSort("likes")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sortField === "likes"
                          ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Likes</span>
                        {sortField === "likes" && (
                          sortDirection === "desc" ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronUpIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleSort("views")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sortField === "views"
                          ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Views</span>
                        {sortField === "views" && (
                          sortDirection === "desc" ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronUpIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-hidden overflow-y-hidden">
                <table className="w-full">
                  <thead className="glass-table-header border-b border-white/10">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Engagement
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Likes
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedVideos.map((video) => {
                      const engagementBadge = getEngagementBadge(Number(video.engagement_rate));

                      return (
                        <tr 
                          key={video.id} 
                          className="glass-table-row hover:bg-[rgba(15,15,25,0.5)] transition-all duration-200 group"
                        >
                          <td className="px-3 py-3">
                            <Link
                              href={video.platform === "instagram" 
                                ? `/instagram/${video.creator.username}` 
                                : `/tiktok/${video.creator.username}`}
                              className="flex items-center gap-2 hover:opacity-90 transition-all duration-200 group/creator"
                            >
                              <div className="relative flex-shrink-0">
                                {video.creator.avatar_url ? (
                                  <img
                                    src={video.creator.avatar_url}
                                    alt={video.creator.username}
                                    className="w-8 h-8 rounded-full border-2 border-white/20 group-hover/creator:border-teal-500/50 group-hover/creator:scale-105 transition-all duration-200 shadow-lg"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center border-2 border-white/20 group-hover/creator:border-teal-500/50 group-hover/creator:scale-105 transition-all duration-200 shadow-lg">
                                    <span className="text-white font-semibold text-xs">
                                      {video.creator.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {/* Platform badge */}
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[rgba(15,15,25,0.8)] flex items-center justify-center text-[8px] font-bold ${
                                  video.platform === "instagram" 
                                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                                    : "bg-black text-white"
                                }`}>
                                  {video.platform === "instagram" ? "IG" : "TT"}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white group-hover/creator:text-teal-400 transition-colors leading-tight truncate max-w-[120px]">
                                  {video.creator.display_name || video.creator.username}
                                </p>
                                <p className="text-[10px] text-white/60 leading-tight truncate max-w-[120px]">@{video.creator.username}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 relative group/thumbnail"
                              >
                                {video.thumbnail_url ? (
                                  <div className="relative">
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.description || "Video thumbnail"}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-white/10 group-hover/thumbnail:border-teal-500/50 transition-all duration-200 shadow-lg group-hover/thumbnail:shadow-teal-500/20"
                                  />
                                    <div className="absolute inset-0 bg-black/40 group-hover/thumbnail:bg-black/20 rounded-lg flex items-center justify-center transition-all duration-200">
                                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-200">
                                        <PlayIcon className="w-3 h-3 text-white ml-0.5" />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center border-2 border-white/10 group-hover/thumbnail:border-teal-500/50 transition-all duration-200">
                                    <svg
                                      className="w-5 h-5 text-white/40"
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
                              </Link>
                              <div className="min-w-0 flex-1 max-w-[200px]">
                                {(() => {
                                  const { truncated, isTruncated } = truncateWords(video.description, 5);
                                  return (
                                    <div className="relative group/desc">
                                      <Link
                                        href={video.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-white hover:text-teal-400 transition-colors leading-tight block truncate"
                                        title={isTruncated ? video.description : undefined}
                                      >
                                        {truncated}
                                      </Link>
                                      {isTruncated && (
                                        <div className="absolute top-full left-0 mb-2 px-3 py-2 bg-[rgba(15,15,25,0.95)] backdrop-blur-md border border-white/20 rounded-lg shadow-xl text-sm text-white max-w-xs z-[100] opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all duration-200 pointer-events-none whitespace-normal">
                                          {video.description}
                                          <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/20"></div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                {video.duration_seconds && (
                                  <p className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {Math.floor(video.duration_seconds / 60)}:
                                    {String(video.duration_seconds % 60).padStart(2, "0")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                engagementBadge.pulse ? 'animate-pulse-glow' : ''
                              } ${engagementBadge.bg} ${engagementBadge.border} ${engagementBadge.text}`}
                            >
                              {engagementBadge.icon && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                              {Number(video.engagement_rate).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-white font-semibold">
                            {formatNumber(video.views)}
                          </td>
                          <td className="px-3 py-3 text-xs text-white font-semibold">
                            {formatNumber(video.likes)}
                          </td>
                          <td className="px-3 py-3 text-xs text-white/70">
                            {formatDate(video.posted_at)}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => handleUnsave(video.id, video.video_id, video.platform)}
                              disabled={unsavingVideoId === video.id}
                              className="group/btn relative p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 backdrop-blur-sm"
                              title="Remove from saved"
                            >
                              <BookmarkSlashIcon className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200" />
                              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap backdrop-blur-sm">
                                Remove from saved
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm text-white/70">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedVideos.length)} of {sortedVideos.length} videos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-white/50">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
