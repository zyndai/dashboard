"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { name: "Users", href: "/admin-zynd/users" },
  { name: "Blogs", href: "/admin-zynd/blogs" },
];

export function AdminZyndChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin-zynd/logout", { method: "POST" });
    router.replace("/admin-zynd");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E17", color: "white", display: "flex" }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#5b7cfa", marginBottom: 6 }}>
            ZYND · ADMIN
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Hidden console</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "white" : "rgba(255,255,255,0.6)",
                  background: active ? "rgba(91,124,250,0.12)" : "transparent",
                  border: active ? "1px solid rgba(91,124,250,0.25)" : "1px solid transparent",
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          style={{
            marginTop: "auto",
            padding: "9px 12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            borderRadius: 6,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Sign out
        </button>
      </aside>

      <main style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>{children}</main>
    </div>
  );
}
