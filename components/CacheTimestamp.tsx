"use client";

interface CacheTimestampProps {
  timestamp: string | null;
}

export default function CacheTimestamp({ timestamp }: CacheTimestampProps) {
  if (!timestamp) {
    return (
      <div className="text-sm text-white/50">
        Never scraped
      </div>
    );
  }

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  const isStale = () => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / 3600000;
    return diffHours > 48; // Stale if older than 48 hours
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/50">
        Last updated: {getTimeAgo(timestamp)}
      </span>
      {isStale() && (
        <span className="glass-badge text-xs px-2 py-1 border-yellow-500/50 text-yellow-300 rounded">
          Stale
        </span>
      )}
    </div>
  );
}

