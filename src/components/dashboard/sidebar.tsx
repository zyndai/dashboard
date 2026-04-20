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
      <Link
        href="/"
        style={{
          display: "flex",
          justifyContent: "center",
          textDecoration: "none",
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
          transition: "all 0.2s",
          cursor: "pointer",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <img
            src="/zynd.png"
            alt="ZyndAI"
            style={{
              width: "32px",
              height: "32px",
              filter: "brightness(0) invert(1)",
            }}
          />
          <h1 style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#fff",
            margin: "0",
          }}>
            ZYND<span style={{ color: "#8B5CF6" }}>AI</span>
          </h1>
        </div>
      </Link>

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
        <button
          onClick={logout}
          className="sidebar-logout"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
