"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthNav() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/60">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-white font-medium hover:text-blue-400 transition-colors hidden md:block"
        >
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          Sign Out
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/auth/login"
        className="text-sm text-white font-medium hover:text-blue-400 transition-colors hidden md:block"
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-sm"
      >
        Let's Talk
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}

