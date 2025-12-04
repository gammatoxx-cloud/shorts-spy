import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserVideoLimit } from "@/lib/db/subscriptions";

/**
 * GET /api/user/video-limit
 * Get the user's video limit based on their subscription tier
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const videoLimit = await getUserVideoLimit(user.id);

    return NextResponse.json({ videoLimit });
  } catch (error: any) {
    console.error("Error fetching video limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

