"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useAuth } from "@/contexts/AuthContext";

interface HistorySearch {
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

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [searches, setSearches] = useState<HistorySearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const router = useRouter();
  const limit = 20;

  useEffect(() => {
    if (user) {
      fetchHistory(currentPage);
    }
  }, [user, currentPage]);

  const fetchHistory = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/history?page=${page}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (username: string, searchPlatform?: string | null) => {
    // Determine route based on platform
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
            Please sign in to view your search history.
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
          <h1 className="text-4xl font-bold mb-1 text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-white/60 text-sm">
            All your creator searches and analyses
          </p>
        </div>

        {/* Stats Card */}
        {pagination && pagination.totalCount > 0 && (
          <div className="card-modern p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1 font-medium">Total Searches</p>
                <p className="text-4xl font-bold text-white">{pagination.totalCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        {searches.length === 0 ? (
          <div className="card-modern p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No search history yet</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto text-base leading-relaxed">
                Start analyzing creators to see your search history here.
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
          <div className="card-modern p-6">
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
            
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/60">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalCount)} of {pagination.totalCount} searches
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      // Calculate which page numbers to show
                      const maxPagesToShow = Math.min(5, pagination.totalPages);
                      let startPage: number;
                      if (pagination.totalPages <= 5) {
                        startPage = 1;
                      } else if (currentPage <= 3) {
                        startPage = 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        startPage = pagination.totalPages - 4;
                      } else {
                        startPage = currentPage - 2;
                      }
                      
                      return Array.from({ length: maxPagesToShow }, (_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              currentPage === pageNum
                                ? "bg-blue-500/20 border border-blue-500/50 text-blue-400 font-semibold"
                                : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

