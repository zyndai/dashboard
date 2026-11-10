"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toneClass, type Badge } from "@/lib/n8n/format";

export function StatusBadge({ badge }: { badge: Badge }) {
  return (
    <span className={`dashboard-badge ${toneClass(badge.tone)}`} title={badge.hint}>
      {badge.label}
    </span>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" style={{ padding: "14px 16px", border: "1px solid rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: "14px", borderRadius: "6px", marginBottom: "16px" }}>
      {message}
    </div>
  );
}

export function Loading({ what }: { what: string }) {
  return <p style={{ padding: "40px 20px", textAlign: "center", color: "rgba(246,246,246,0.6)" }}>Loading {what}…</p>;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <p style={{ fontSize: "16px", fontWeight: 500, color: "rgba(246,246,246,0.6)", margin: "0 0 8px" }}>{title}</p>
      {children && <div style={{ fontSize: "14px", color: "rgba(246,246,246,0.4)" }}>{children}</div>}
    </div>
  );
}

export function Mono({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <code title={title} style={{ padding: "3px 8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", fontFamily: "monospace", fontSize: "12px", color: "rgba(246,246,246,0.7)", wordBreak: "break-all" }}>
      {children}
    </code>
  );
}

/** A value with a copy button. `secret` shows a warning style (used for the one-time API key). */
export function CopyField({ value, secret }: { value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
      <input
        readOnly value={value} aria-label={secret ? "API key" : "Value"}
        onFocus={(e) => e.currentTarget.select()}
        className="dashboard-input"
        style={{ fontFamily: "monospace", fontSize: "13px", ...(secret ? { borderColor: "rgba(255,184,0,0.5)" } : {}) }}
      />
      <button
        type="button" className="dashboard-button-secondary"
        style={{ whiteSpace: "nowrap", padding: "0 16px" }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked: the field is selectable */
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#ef4444" }}>{message}</p> : null;
}

const TABS = [
  { name: "Overview", href: "/dashboard/n8n" },
  { name: "Listings", href: "/dashboard/n8n/listings" },
  { name: "API keys", href: "/dashboard/n8n/api-keys" },
];

export function N8nNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/dashboard/n8n" ? pathname === href : pathname.startsWith(href));
  return (
    <nav aria-label="n8n" style={{ display: "flex", gap: "4px", marginBottom: "28px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
      {TABS.map((t) => (
        <Link
          key={t.href} href={t.href}
          aria-current={active(t.href) ? "page" : undefined}
          style={{
            padding: "10px 16px", fontSize: "14px", textDecoration: "none", marginBottom: "-1px",
            color: active(t.href) ? "#fff" : "rgba(246,246,246,0.55)",
            borderBottom: active(t.href) ? "2px solid #8B5CF6" : "2px solid transparent",
          }}
        >
          {t.name}
        </Link>
      ))}
    </nav>
  );
}
