"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on dashboard pages and video results pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/tiktok") || pathname?.startsWith("/instagram")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 pt-4 pb-4">
      <div className="container mx-auto px-4">
        <div className="glass-nav rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Shorts Spy Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Hide broken image icon
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-white">
              Shorts Spy
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-white font-medium hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white font-medium hover:text-blue-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-white font-medium hover:text-blue-400 transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}

