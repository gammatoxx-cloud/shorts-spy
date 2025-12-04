/**
 * Client-side API functions for Instagram scraping
 */

export interface InstagramScrapeResponse {
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

export interface InstagramScrapeStatusResponse {
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
 * Start a new Instagram scrape
 */
export async function startInstagramScrape(username: string, videoCount: number): Promise<InstagramScrapeResponse> {
  const response = await fetch("/api/instagram/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, video_count: videoCount }),
  });

  if (!response.ok) {
    // Try to parse error response, but handle empty responses
    let errorMessage = "Failed to start Instagram scrape";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } else {
        // If not JSON, try to get text
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch (parseError) {
      // If parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Parse successful response
  try {
    return await response.json();
  } catch (parseError) {
    throw new Error("Invalid response from server. Please try again.");
  }
}

/**
 * Check Instagram scrape status
 */
export async function checkInstagramScrapeStatus(
  runId: string
): Promise<InstagramScrapeStatusResponse> {
  const response = await fetch(`/api/instagram/scrape/status/${runId}`);

  if (!response.ok) {
    // Try to parse error response, but handle empty responses
    let errorMessage = "Failed to check Instagram scrape status";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } else {
        // If not JSON, try to get text
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch (parseError) {
      // If parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Parse successful response
  try {
    return await response.json();
  } catch (parseError) {
    throw new Error("Invalid response from server. Please try again.");
  }
}

/**
 * Poll for Instagram scrape completion
 */
export async function pollInstagramScrapeStatus(
  runId: string,
  options?: {
    interval?: number;
    maxAttempts?: number;
    onProgress?: (status: InstagramScrapeStatusResponse) => void;
  }
): Promise<InstagramScrapeStatusResponse> {
  const interval = options?.interval || 5000; // 5 seconds
  const maxAttempts = options?.maxAttempts || 60; // 5 minutes max

  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkInstagramScrapeStatus(runId);

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

  throw new Error("Instagram scrape timed out");
}

