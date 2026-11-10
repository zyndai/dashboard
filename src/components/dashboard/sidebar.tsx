"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMyCard } from "@/hooks/useMyCard";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Entities", href: "/dashboard/entities" },
  { name: "n8n", href: "/dashboard/n8n" },
  { name: "Wallet", href: "/dashboard/wallet" },
  { name: "CLI", href: "/dashboard/cli" },
  { name: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { handle } = useMyCard();
  const cardHref = handle ? `/p/${encodeURIComponent(handle)}` : "/create";
  const cardLabel = handle ? "Profile Card" : "Create Profile";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <img src="/zynd.png" alt="ZyndAI" className="sidebar-logo-img" />
            <h1>ZYND<span>AI</span></h1>
          </div>
        </Link>
        <button onClick={logout} className="sidebar-logout-mobile">
          Sign Out
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link
          href={cardHref}
          className={`sidebar-link ${pathname.startsWith("/p/") || pathname === "/create" ? "active" : ""}`}
        >
          {cardLabel}
        </Link>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-logout">
          Sign Out
        </button>
      </div>
    </div>
  );
}
