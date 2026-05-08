"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
}

export default function AdminZyndBlogsPage() {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/blogs");
        if (!res.ok) { setError("Failed to load posts."); setLoading(false); return; }
        const data = await res.json();
        setPosts(data.posts);
      } catch { setError("Failed to load posts."); }
      finally { setLoading(false); }
    })();
  }, []);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete."); return; }
    setPosts((cur) => cur.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(91,124,250,0.2)", borderTop: "2px solid #5b7cfa", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", textAlign: "center", borderRadius: 8 }}>
        <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>{error}</p>
      </div>
    );
  }

  const card: React.CSSProperties = { padding: 0, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", borderRadius: 8, overflow: "hidden" };
  const cell: React.CSSProperties = { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "top" };
  const head: React.CSSProperties = { ...cell, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Blogs</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Create, edit, publish blog posts.</p>
        </div>
        <Link
          href="/admin-zynd/blogs/new"
          style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, background: "#5b7cfa", color: "white", borderRadius: 6, textDecoration: "none" }}
        >
          + New post
        </Link>
      </div>

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={head}>Title</th>
                <th style={head}>Slug</th>
                <th style={head}>Status</th>
                <th style={head}>Published</th>
                <th style={head}>Updated</th>
                <th style={head}></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} style={{ ...cell, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No posts yet.</td></tr>
              ) : posts.map((p) => (
                <tr key={p.id}>
                  <td style={cell}>
                    <Link href={`/admin-zynd/blogs/${p.id}`} style={{ fontWeight: 500, color: "#5b7cfa", textDecoration: "none" }}>
                      {p.title}
                    </Link>
                    {p.tags.length > 0 && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                        {p.tags.join(" · ")}
                      </div>
                    )}
                  </td>
                  <td style={{ ...cell, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>{p.slug}</td>
                  <td style={cell}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        background: p.status === "published" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                        color: p.status === "published" ? "#22c55e" : "#eab308",
                        border: p.status === "published" ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(234,179,8,0.25)",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ ...cell, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </td>
                  <td style={{ ...cell, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {new Date(p.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={cell}>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id, p.title)}
                      style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 4 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
