"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileMenuToggle from "@/components/MobileMenuToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 pt-4 pb-4 px-4 bg-[rgba(15,15,25,0.4)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3">
            <MobileMenuToggle
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Shorts Spy Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h1 className="text-xl font-bold text-white">
                Shorts Spy
              </h1>
            </div>
          </div>
        </div>

        <div className="pl-4 pr-4 py-6 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
