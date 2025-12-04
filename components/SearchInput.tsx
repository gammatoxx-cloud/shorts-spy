"use client";

import { useState, FormEvent, useEffect } from "react";

interface SearchInputProps {
  onSearch: (username: string, videoCount: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  platform?: "tiktok" | "instagram";
  selectedPlatform?: "tiktok" | "instagram";
  onPlatformChange?: (platform: "tiktok" | "instagram") => void;
}

export default function SearchInput({
  onSearch,
  isLoading = false,
  error = null,
  platform: platformProp = "tiktok",
  selectedPlatform,
  onPlatformChange,
}: SearchInputProps) {
  // Use selectedPlatform if provided, otherwise fall back to platform prop
  const platform = selectedPlatform || platformProp;
  const [username, setUsername] = useState("");
  const [videoCount, setVideoCount] = useState(20);
  const [maxVideoCount, setMaxVideoCount] = useState(20);
  const [loadingLimit, setLoadingLimit] = useState(true);

  useEffect(() => {
    // Fetch user's video limit
    const fetchVideoLimit = async () => {
      try {
        const response = await fetch("/api/user/video-limit");
        if (response.ok) {
          const data = await response.json();
          setMaxVideoCount(data.videoLimit || 20);
          setVideoCount(data.videoLimit || 20);
        }
      } catch (error) {
        console.error("Error fetching video limit:", error);
      } finally {
        setLoadingLimit(false);
      }
    };

    fetchVideoLimit();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || isLoading) {
      return;
    }

    const normalizedUsername = username.trim().replace(/^@/, "");
    await onSearch(normalizedUsername, videoCount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Platform Selection */}
      {onPlatformChange && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-3">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Platform
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPlatformChange("tiktok")}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                platform === "tiktok"
                  ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span>TikTok</span>
            </button>
            <button
              type="button"
              onClick={() => onPlatformChange("instagram")}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                platform === "instagram"
                  ? "bg-purple-500/20 border border-purple-500/50 text-purple-400"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
              </svg>
              <span>Instagram Reels</span>
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-3">
            {platform === "instagram" ? (
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" stroke="currentColor" fill="none"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" stroke="currentColor" fill="none"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="currentColor"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            Username
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g., charlidamelio)"
              className="glass-input w-full pl-12 pr-4 py-3.5 text-base text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              disabled={isLoading}
              required
            />
          </div>
          <p className="text-xs text-white/50 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enter a username without the @ symbol
          </p>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="videoCount" className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-3">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {platform === "instagram" ? "Reels to Analyze" : "Videos to Analyze"}
          </label>
          <input
            id="videoCount"
            type="number"
            min="1"
            max={maxVideoCount}
            value={videoCount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                // Allow empty temporarily during editing
                return;
              }
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= maxVideoCount) {
                setVideoCount(numValue);
              } else if (numValue > maxVideoCount) {
                // If user enters a value greater than max, set to max
                setVideoCount(maxVideoCount);
              } else if (numValue < 1) {
                // If user enters a value less than 1, set to 1
                setVideoCount(1);
              }
            }}
            onBlur={(e) => {
              // Ensure value is valid on blur
              if (e.target.value === "" || parseInt(e.target.value, 10) < 1) {
                setVideoCount(1);
              } else if (parseInt(e.target.value, 10) > maxVideoCount) {
                setVideoCount(maxVideoCount);
              }
            }}
            className="glass-input w-full px-4 py-3.5 text-base text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
            disabled={isLoading || loadingLimit}
            required
          />
          <p className="text-xs text-white/50 mt-2">
            Max: <span className="text-blue-400 font-medium">{maxVideoCount}</span> {maxVideoCount === 40 ? <span className="text-purple-400">(Paid)</span> : <span className="text-white/60">(Free)</span>}
          </p>
        </div>
        <div className="md:col-span-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3 invisible pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Spy Now</span>
          </div>
          <button
            type="submit"
            disabled={isLoading || !username.trim() || loadingLimit}
            className="btn-glass-primary w-full md:w-auto px-8 py-3.5 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Spy Now</span>
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className="glass-badge bg-red-500/20 border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </form>
  );
}

