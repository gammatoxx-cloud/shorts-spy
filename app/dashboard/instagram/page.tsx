"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstagramDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified analyze page
    router.replace("/dashboard/analyze");
  }, [router]);

  return null;
}
