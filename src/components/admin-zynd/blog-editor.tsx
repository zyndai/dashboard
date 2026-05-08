"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface BlogEditorValue {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt: string;
  status: "draft" | "published";
  tags: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

export const EMPTY_EDITOR: BlogEditorValue = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  publishedAt: "",
  status: "draft",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
};

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: 14,
  borderRadius: 6,
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export function BlogEditor({ initial }: { initial: BlogEditorValue }) {
  const router = useRouter();
  const [val, setVal] = useState<BlogEditorValue>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof BlogEditorValue>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setVal((cur) => ({ ...cur, [k]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const tagsArr = val.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const publishedAtIso = val.publishedAt ? new Date(val.publishedAt).toISOString() : null;

    const body = {
      title: val.title,
      slug: val.slug || undefined,
      excerpt: val.excerpt || null,
      body: val.body,
      coverImage: val.coverImage || null,
      publishedAt: publishedAtIso,
      status: val.status,
      tags: tagsArr,
      seoTitle: val.seoTitle || null,
      seoDescription: val.seoDescription || null,
      ogImage: val.ogImage || null,
    };

    const url = val.id ? `/api/admin/blogs/${val.id}` : "/api/admin/blogs";
    const method = val.id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      router.push("/admin-zynd/blogs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{val.id ? "Edit post" : "New post"}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => router.push("/admin-zynd/blogs")}
            style={{ padding: "10px 16px", fontSize: 13, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 6, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, background: "#5b7cfa", color: "white", border: "none", borderRadius: 6, cursor: saving ? "default" : "pointer", opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", borderRadius: 6, color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={card}>
        <div>
          <label style={labelStyle}>Title</label>
          <input required value={val.title} onChange={field("title")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Slug (auto from title if empty)</label>
          <input value={val.slug} onChange={field("slug")} style={inputStyle} placeholder="my-post-slug" />
        </div>
        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea value={val.excerpt} onChange={field("excerpt")} rows={2} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Body (Markdown)</label>
          <textarea
            value={val.body}
            onChange={field("body")}
            rows={20}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}
            placeholder={"# Heading\n\nWrite markdown here…"}
          />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={val.status} onChange={field("status")} style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Published at</label>
            <input type="datetime-local" value={val.publishedAt} onChange={field("publishedAt")} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input value={val.tags} onChange={field("tags")} style={inputStyle} placeholder="Protocol, x402, Tutorial" />
        </div>
        <div>
          <label style={labelStyle}>Cover image URL</label>
          <input value={val.coverImage} onChange={field("coverImage")} style={inputStyle} placeholder="https://…" />
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
          SEO overrides (optional)
        </div>
        <div>
          <label style={labelStyle}>SEO title</label>
          <input value={val.seoTitle} onChange={field("seoTitle")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>SEO description</label>
          <textarea value={val.seoDescription} onChange={field("seoDescription")} rows={2} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>OG image URL</label>
          <input value={val.ogImage} onChange={field("ogImage")} style={inputStyle} />
        </div>
      </div>
    </form>
  );
}
