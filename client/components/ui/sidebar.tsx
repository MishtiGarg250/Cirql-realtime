"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Video, LogOut, Menu, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/rooms", label: "Rooms", icon: Video },
  { href: "/friends", label: "Friends", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  // Only fix the sidebar if not on /call/[id]
  const isCallPage = pathname.startsWith("/call/");

  return (
    <>
      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card/10 backdrop-blur-sm border border-cosmic-purple/20 shadow-lg hover:bg-cosmic-purple/10"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <Menu className="h-6 w-6 text-cosmic-purple" />
        </button>
      )}
      <aside className={`
        ${!isCallPage ? "fixed left-0 top-0 h-screen z-30 overflow-y-auto" : ""}
        cosmic-gradient  backdrop-blur-sm text-white flex flex-col border-r border-cosmic-purple/20 shadow-xl transition-all duration-300
        ${collapsed ? "w-20" : "w-64"} rounded-r-xl
      `}>
        <div className="flex items-center justify-between p-4">
          <span className={`text-2xl font-bold tracking-tight bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Cirql</span>
          {/* Collapse button only when expanded */}
          {!collapsed && (
            <button
              className="p-2 rounded-xl hover:bg-cosmic-purple/10 focus:outline-none"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <Menu className="h-6 w-6 text-cosmic-purple" />
            </button>
          )}
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 mb-2 transition-all duration-200 ${collapsed ? "opacity-0 w-0 h-0 p-0 m-0" : "opacity-100 w-auto h-auto"}`}>
          <div className="relative">
            <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-cosmic-pink to-cosmic-purple text-center leading-10 font-bold text-white shadow-lg ring-2 ring-cosmic-purple/40">
              {username ? username[0].toUpperCase() : "?"}
            </span>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-cosmic-purple" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{username || "User"}</div>
            <div className="text-xs text-green-400">Online</div>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200
                group
                ${pathname.startsWith(href)
                  ? "bg-cosmic-purple/30 border border-cosmic-purple/80 shadow-cosmic-purple/30 shadow-lg text-cosmic-purple"
                  : "hover:bg-cosmic-purple/10 hover:shadow-cosmic-purple/30 hover:shadow-lg hover:ring-2 hover:ring-cosmic-purple/40 border border-transparent"}
              `}
            >
              <Icon className={`h-5 w-5 ${pathname.startsWith(href) ? "text-cosmic-purple" : "text-foreground/70 group-hover:text-cosmic-purple"}`} />
              <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-cosmic-purple/20">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cosmic-pink/10 text-left"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              window.location.href = "/";
            }}
          >
            <LogOut className="h-5 w-5 text-cosmic-pink" />
            <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
} 