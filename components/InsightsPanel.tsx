"use client";

import Link from "next/link";

interface Video {
  id: string;
  video_id: string;
  video_url: string;
  description: string | null;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  engagement_rate: number;
  posted_at: string | null;
}

interface InsightsPanelProps {
  bestVideo: Video | null;
  postingFrequency: {
    perWeek: number;
    perMonth: number;
  };
  averageEngagementRate: number;
  compact?: boolean;
}

export default function InsightsPanel({
  bestVideo,
  postingFrequency,
  averageEngagementRate,
  compact = false,
}: InsightsPanelProps) {
  if (compact) {
    return (
      <div className="card-modern p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-xl font-bold text-white">Key Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Best Performing Video */}
          {bestVideo && (
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-sm font-semibold text-white/90">
                  Best Performing Video
                </h3>
              </div>
              <Link
                href={bestVideo.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex gap-3 p-3 rounded-lg glass-sm border border-yellow-500/20 hover:glass-md hover:border-yellow-500/40 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                  {bestVideo.thumbnail_url ? (
                    <img
                      src={bestVideo.thumbnail_url}
                      alt={bestVideo.description || "Best video"}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
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
                    <p className="text-xs font-medium text-white group-hover:text-yellow-400 line-clamp-2 mb-2 transition-colors">
                      {bestVideo.description || "No description"}
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-semibold w-fit">
                        {Number(bestVideo.engagement_rate).toFixed(2)}% engagement
                      </span>
                      <span className="text-white/60 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {bestVideo.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Posting Frequency */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white/90">
                Posting Frequency
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-white/70">Per week</span>
                  <span className="text-sm font-bold text-white">
                    {postingFrequency.perWeek > 0
                      ? `${postingFrequency.perWeek.toFixed(1)} videos`
                      : "N/A"}
                  </span>
                </div>
                {postingFrequency.perWeek > 0 && (
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((postingFrequency.perWeek / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-white/70">Per month</span>
                  <span className="text-sm font-bold text-white">
                    {postingFrequency.perMonth > 0
                      ? `${postingFrequency.perMonth.toFixed(1)} videos`
                      : "N/A"}
                  </span>
                </div>
                {postingFrequency.perMonth > 0 && (
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((postingFrequency.perMonth / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Average Engagement */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white/90">
                Average Engagement
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-white">
                {averageEngagementRate.toFixed(2)}%
              </span>
              <span className="text-xs text-white/50 px-2 py-0.5 rounded bg-white/5">
                across all videos
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((averageEngagementRate / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-bold text-white">Key Insights</h2>
      </div>

      <div className="space-y-6">
        {/* Best Performing Video */}
        {bestVideo && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-sm font-semibold text-white/90">
                Best Performing Video
              </h3>
            </div>
            <Link
              href={bestVideo.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex gap-3 p-4 rounded-lg glass-sm border border-yellow-500/20 hover:glass-md hover:border-yellow-500/40 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                {bestVideo.thumbnail_url ? (
                  <img
                    src={bestVideo.thumbnail_url}
                    alt={bestVideo.description || "Best video"}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-yellow-400 line-clamp-2 mb-2 transition-colors">
                    {bestVideo.description || "No description"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-semibold">
                      {Number(bestVideo.engagement_rate).toFixed(2)}% engagement
                    </span>
                    <span className="text-white/60 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {bestVideo.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Posting Frequency */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white/90">
              Posting Frequency
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/70">
                  Per week
                </span>
                <span className="text-sm font-bold text-white">
                  {postingFrequency.perWeek > 0
                    ? `${postingFrequency.perWeek.toFixed(1)} videos`
                    : "N/A"}
                </span>
              </div>
              {postingFrequency.perWeek > 0 && (
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((postingFrequency.perWeek / 7) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/70">
                  Per month
                </span>
                <span className="text-sm font-bold text-white">
                  {postingFrequency.perMonth > 0
                    ? `${postingFrequency.perMonth.toFixed(1)} videos`
                    : "N/A"}
                </span>
              </div>
              {postingFrequency.perMonth > 0 && (
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((postingFrequency.perMonth / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Average Engagement */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white/90">
              Average Engagement
            </h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">
              {averageEngagementRate.toFixed(2)}%
            </span>
            <span className="text-xs text-white/50 px-2 py-1 rounded bg-white/5">
              across all videos
            </span>
          </div>
          <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((averageEngagementRate / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

