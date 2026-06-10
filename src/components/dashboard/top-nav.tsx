"use client";

import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { authenticated, user, developer, logout } = useAuth();

  const displayName = developer?.developer_id
    ? `${developer.developer_id.slice(0, 16)}...`
    : user?.email ?? "";

  return (
    <nav className="flex h-14 items-center justify-between border-b border-white/10 bg-black px-4 md:px-6">
      <button
        onClick={onToggleSidebar}
        className="p-1.5 text-white/40 transition-colors hover:text-white md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {authenticated && displayName ? (
          <>
            <span className="font-mono text-xs text-white/40">
              {displayName}
            </span>
            <button
              onClick={logout}
              className="flex cursor-pointer items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-red-500/30 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
