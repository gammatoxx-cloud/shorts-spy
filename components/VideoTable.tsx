"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BookmarkIcon, BookmarkSlashIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";

type SortField = "engagement_rate" | "views" | "likes" | "comments" | "posted_at";
type SortDirection = "asc" | "desc";

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

interface VideoTableProps {
  videos: Video[];
  platform?: "tiktok" | "instagram" | "youtube";
}

export default function VideoTable({ videos, platform = "tiktok" }: VideoTableProps) {
  const [sortField, setSortField] = useState<SortField>("engagement_rate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Sort videos
  const sortedVideos = useMemo(() => {
    const sorted = [...videos];
    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

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
        case "comments":
          aValue = a.comments;
          bValue = b.comments;
          break;
        case "posted_at":
          aValue = a.posted_at || "";
          bValue = b.posted_at || "";
          break;
        default:
          return 0;
      }

      if (sortField === "posted_at") {
        // Date comparison
        if (!aValue) return 1;
        if (!bValue) return -1;
        const comparison =
          new Date(aValue as string).getTime() -
          new Date(bValue as string).getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      } else {
        // Number comparison
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });

    return sorted;
  }, [videos, sortField, sortDirection]);

  // Calculate engagement rate thresholds for color coding
  const getEngagementBadge = (rate: number) => {
    if (rate >= 8) {
      return { color: "emerald", bg: "bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-400" };
    } else if (rate >= 5) {
      return { color: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400" };
    } else {
      return { color: "gray", bg: "bg-gray-500/20", border: "border-gray-500/50", text: "text-gray-400" };
    }
  };

  // Get top 3 videos for highlighting
  const topVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => Number(b.engagement_rate) - Number(a.engagement_rate));
    return sorted.slice(0, 3).map(v => v.id);
  }, [videos]);

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

  // Fetch saved status for all videos on mount
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (videos.length === 0) return;

      try {
        // Use video_id (TikTok video ID) not id (database UUID)
        const videoIds = videos.map((v) => v.video_id).join(",");
        const response = await fetch(`/api/saved-videos?video_ids=${videoIds}&platform=${platform}`);
        if (response.ok) {
          const data = await response.json();
          setSavedStatus(data.saved_status || {});
        }
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };

    fetchSavedStatus();
  }, [videos, platform]);

  const handleSaveToggle = async (videoId: string) => {
    if (savingVideoId) {
      console.log("Save already in progress, ignoring click");
      return; // Prevent multiple simultaneous saves
    }

    console.log("handleSaveToggle called with videoId:", videoId);
    const isCurrentlySaved = savedStatus[videoId];
    console.log("Current saved status:", isCurrentlySaved);
    setSavingVideoId(videoId);

    try {
      if (isCurrentlySaved) {
        // Unsave
        console.log("Attempting to unsave video:", videoId);
        const response = await fetch("/api/saved-videos", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ video_id: videoId, platform: platform }),
        });

        console.log("Unsave response status:", response.status);
        if (response.ok) {
          setSavedStatus((prev) => ({ ...prev, [videoId]: false }));
          console.log("Video unsaved successfully");
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error unsaving video:", response.status, errorData);
          // Revert the optimistic update
          setSavedStatus((prev) => ({ ...prev, [videoId]: isCurrentlySaved }));
        }
      } else {
        // Save
        console.log("Attempting to save video:", videoId);
        const response = await fetch("/api/saved-videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ video_id: videoId, platform: platform }),
        });

        console.log("Save response status:", response.status);
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          console.log("Save response data:", data);
          setSavedStatus((prev) => ({ ...prev, [videoId]: true }));
          console.log("Video saved successfully");
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error saving video:", response.status, errorData);
          // Revert the optimistic update
          setSavedStatus((prev) => ({ ...prev, [videoId]: false }));
        }
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
    } finally {
      setSavingVideoId(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="text-white/40 ml-1">
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </span>
      );
    }

    return (
      <span className="text-blue-400 ml-1">
        {sortDirection === "asc" ? (
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </span>
    );
  };

  if (videos.length === 0) {
    return (
      <div className="card-modern p-8 text-center">
        <p className="text-white/60">
          No videos found for this creator.
        </p>
      </div>
    );
  }

  return (
    <div className="card-modern overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="glass-table-header border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Video
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer transition-colors duration-200"
                onClick={() => handleSort("engagement_rate")}
              >
                <div className="flex items-center">
                  Engagement
                  <SortIcon field="engagement_rate" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer transition-colors duration-200"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center">
                  Views
                  <SortIcon field="views" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer transition-colors duration-200"
                onClick={() => handleSort("likes")}
              >
                <div className="flex items-center">
                  Likes
                  <SortIcon field="likes" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer transition-colors duration-200"
                onClick={() => handleSort("comments")}
              >
                <div className="flex items-center">
                  Comments
                  <SortIcon field="comments" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer transition-colors duration-200"
                onClick={() => handleSort("posted_at")}
              >
                <div className="flex items-center">
                  Posted
                  <SortIcon field="posted_at" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedVideos.map((video, index) => {
              const engagementBadge = getEngagementBadge(Number(video.engagement_rate));
              const isTopVideo = topVideos.includes(video.id);
              
              return (
                <tr
                  key={video.id}
                  className={`glass-table-row ${isTopVideo ? 'ring-1 ring-blue-500/30' : ''}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 relative">
                        <Link
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/thumbnail relative block"
                        >
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.description || "Video thumbnail"}
                              className="w-24 h-24 object-cover rounded-lg border border-white/10"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                              <svg
                                className="w-8 h-8 text-white/40"
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Bookmark clicked for video:", video.video_id);
                            handleSaveToggle(video.video_id);
                          }}
                          disabled={savingVideoId === video.video_id}
                          className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 hover:bg-black/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                          title={savedStatus[video.video_id] ? "Remove from saved" : "Save video"}
                          type="button"
                        >
                          {savedStatus[video.video_id] ? (
                            <BookmarkIconSolid className="w-4 h-4 text-blue-400" />
                          ) : (
                            <BookmarkIcon className="w-4 h-4 text-white/80" />
                          )}
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          {isTopVideo && (
                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-full">
                              Top {topVideos.indexOf(video.id) + 1}
                            </span>
                          )}
                          <Link
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white hover:text-blue-400 line-clamp-2 transition-colors flex-1"
                          >
                            {video.description || "No description"}
                          </Link>
                        </div>
                        {video.duration_seconds && (
                          <p className="text-xs text-white/50 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {Math.floor(video.duration_seconds / 60)}:
                            {String(video.duration_seconds % 60).padStart(2, "0")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${engagementBadge.bg} ${engagementBadge.border} ${engagementBadge.text}`}>
                      {Number(video.engagement_rate).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {formatNumber(video.views)}
                  </td>
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {formatNumber(video.likes)}
                  </td>
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {formatNumber(video.comments)}
                  </td>
                  <td className="px-4 py-4 text-sm text-white/60">
                    {formatDate(video.posted_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

