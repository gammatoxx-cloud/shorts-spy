/**
 * Client-side API functions for YouTube Shorts scraping
 */

export interface YoutubeScrapeResponse {
  message: string;
  scrape?: {
    id: string;
    status: string;
    apify_run_id: string | null;
  };
  profile?: {
    id: string;
    username: string;
  };
  cached?: boolean;
  videos?: any[];
  stats?: any;
  lastScraped?: string;
}

export interface YoutubeScrapeStatusResponse {
  status: string;
  scrape: {
    id: string;
    status: string;
    apify_run_id: string | null;
    video_count?: number;
  };
  apify?: {
    status: string;
    startedAt?: string;
    finishedAt?: string | null;
  };
  profile?: any;
  videos?: any[];
  stats?: any;
  error?: string;
  message?: string;
}

/**
 * Start a new YouTube Shorts scrape
 */
export async function startYoutubeScrape(username: string, videoCount: number): Promise<YoutubeScrapeResponse> {
  const response = await fetch("/api/youtube/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, video_count: videoCount }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to start YouTube scrape";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch (parseError) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error("Invalid response from server. Please try again.");
  }
}

/**
 * Check YouTube Shorts scrape status
 */
export async function checkYoutubeScrapeStatus(
  runId: string
): Promise<YoutubeScrapeStatusResponse> {
  const response = await fetch(`/api/youtube/scrape/status/${runId}`);

  if (!response.ok) {
    let errorMessage = "Failed to check YouTube scrape status";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch (parseError) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error("Invalid response from server. Please try again.");
  }
}

/**
 * Poll for YouTube Shorts scrape completion
 */
export async function pollYoutubeScrapeStatus(
  runId: string,
  options?: {
    interval?: number;
    maxAttempts?: number;
    onProgress?: (status: YoutubeScrapeStatusResponse) => void;
  }
): Promise<YoutubeScrapeStatusResponse> {
  const interval = options?.interval || 5000; // 5 seconds
  const maxAttempts = options?.maxAttempts || 60; // 5 minutes max

  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkYoutubeScrapeStatus(runId);

    if (options?.onProgress) {
      options.onProgress(status);
    }

    if (status.status === "completed" || status.status === "failed") {
      return status;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error("YouTube scrape timed out");
}
