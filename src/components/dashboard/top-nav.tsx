"use client";

import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatAddress } from "@/lib/utils";

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { authenticated, user, walletAddress, logout } = useAuth();

  return (
    <nav className="flex h-16 items-center justify-between border-b border-white/10 bg-black px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded p-1.5 text-[#E0E7FF]/60 transition-colors hover:text-[#E0E7FF] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold text-[#E0E7FF]">Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        {authenticated && (user || walletAddress) ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-[#E0E7FF]/60">
              {user ? formatAddress(user.walletAddress) : formatAddress(walletAddress || "")}
            </span>
            <button
              onClick={logout}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#E0E7FF]/60 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
