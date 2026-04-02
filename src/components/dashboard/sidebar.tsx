"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, Settings, X, Globe, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Names", href: "/dashboard/names", icon: Globe },
  { name: "Admin", href: "/dashboard/admin", icon: ShieldCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onLinkClick?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onLinkClick, mobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-60 flex-col border-r border-white/10 bg-[#0a0a0a]"
          : "hidden md:flex w-60 flex-col border-r border-white/10 bg-[#0a0a0a]"
      }
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/zynd.png" alt="ZyndAI" className="h-8 brightness-0 invert" />
          <span className="text-xl font-extrabold tracking-widest text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            ZYND<span className="text-[var(--color-accent)]">AI</span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onLinkClick}
            className="p-1 text-white/40 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-6 flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`flex items-center gap-4 px-4 py-3.5 text-lg font-medium transition-colors ${
                    isActive
                      ? "border-l-2 border-[var(--color-accent)] bg-[var(--color-accent)]/[0.06] text-[var(--color-accent)]"
                      : "border-l-2 border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
