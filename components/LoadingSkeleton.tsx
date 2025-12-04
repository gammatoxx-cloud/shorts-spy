"use client";

interface LoadingSkeletonProps {
  type?: "table" | "cards" | "profile" | "dashboard";
}

export default function LoadingSkeleton({ type = "table" }: LoadingSkeletonProps) {
  if (type === "table") {
    return (
      <div className="card-modern overflow-hidden">
        <div className="animate-pulse">
          <div className="p-4 border-b border-white/10">
            <div className="h-4 bg-white/10 rounded w-32"></div>
          </div>
          <div className="divide-y divide-white/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-white/10 rounded-lg flex-shrink-0 skeleton-shimmer"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4 skeleton-shimmer"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2 skeleton-shimmer"></div>
                </div>
                <div className="space-y-2 w-24">
                  <div className="h-4 bg-white/10 rounded skeleton-shimmer"></div>
                  <div className="h-3 bg-white/10 rounded skeleton-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card-modern p-4"
          >
            <div className="h-4 bg-white/10 rounded w-24 mb-2 skeleton-shimmer"></div>
            <div className="h-8 bg-white/10 rounded w-16 skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full skeleton-shimmer"></div>
          <div className="space-y-2">
            <div className="h-8 bg-white/10 rounded w-48 skeleton-shimmer"></div>
            <div className="h-4 bg-white/10 rounded w-32 skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-white/10 rounded w-48 skeleton-shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-64 skeleton-shimmer"></div>
        </div>
        <div className="card-modern p-6">
          <div className="h-6 bg-white/10 rounded w-40 mb-4 skeleton-shimmer"></div>
          <div className="h-12 bg-white/10 rounded skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  return null;
}

