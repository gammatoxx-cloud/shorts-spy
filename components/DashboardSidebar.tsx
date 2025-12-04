"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: "/dashboard/analyze",
      label: "Analyze",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      href: "/dashboard/saved",
      label: "Saved Content",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
    },
  ];

  const allPagesItems = [
    {
      href: "/dashboard/history",
      label: "History",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // Home is active only on exact /dashboard path, not on sub-pages
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/analyze") {
      return pathname?.startsWith("/dashboard/analyze") || pathname?.startsWith("/dashboard/tiktok") || pathname?.startsWith("/dashboard/instagram") || pathname?.startsWith("/tiktok/") || pathname?.startsWith("/instagram/");
    }
    if (href === "/dashboard/history") {
      return pathname?.startsWith("/dashboard/history");
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex-shrink-0
          lg:relative lg:flex-shrink-0 lg:h-screen lg:z-10
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        <div className={`h-full ${isCollapsed ? "w-[80px]" : "w-[280px]"} bg-[rgba(15,15,25,0.4)] backdrop-blur-[20px] border-r border-[rgba(59,130,246,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-300`}>
          {/* Logo/Branding with Collapse Toggle */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group"
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
                {!isCollapsed && (
                  <h1 className="text-xl font-bold text-white">Shorts Spy</h1>
                )}
              </Link>
              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              )}
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                  aria-label="Expand sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
            {/* Main Menu Items */}
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[rgba(139,92,246,0.2)] text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-blue-400" : ""}>{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                </Link>
              );
            })}

            {/* All Pages Section */}
            {!isCollapsed && (
              <>
                {allPagesItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? "bg-[rgba(59,130,246,0.15)] text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={active ? "text-blue-400" : ""}>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* Collapsed Menu Items */}
            {isCollapsed && (
              <div className="space-y-1">
                {allPagesItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`
                        flex items-center justify-center p-3 rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? "bg-[rgba(59,130,246,0.15)] text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                      title={item.label}
                    >
                      {item.icon}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User Profile Section */}
          <div className="p-4">
            <Link
              href="/dashboard/settings"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-white/60">Account settings</p>
                </div>
              )}
              {!isCollapsed && (
                <svg
                  className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

