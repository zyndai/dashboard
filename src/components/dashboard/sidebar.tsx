"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Entities", href: "/dashboard/entities" },
  { name: "Names", href: "/dashboard/names" },
  { name: "Admin", href: "/dashboard/admin" },
  { name: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

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
