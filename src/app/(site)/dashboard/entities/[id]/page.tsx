"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EntityDetail {
  id: string;
  user_id: string;
  entity_id: string | null;
  name: string;
  description: string | null;
  entity_url: string | null;
  category: string | null;
  tags: string[] | null;
  summary: string | null;
  fqan: string | null;
  developer_handle: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  public_key: string | null;
  trust_score: number | null;
  developer_id: string | null;
  home_registry: string | null;
}

export default function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { authenticated } = useAuth();

  useEffect(() => { params.then((p) => setEntityId(p.id)); }, [params]);

  useEffect(() => {
    if (!entityId || !authenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/entities/${entityId}`);
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
        setEntity((await res.json()).entity);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entity details");
      } finally { setLoading(false); }
    })();
  }, [entityId, authenticated]);

  const handleDelete = async () => {
    if (!entityId) return;
    try {
      const supabase = createClient();
      await supabase.from("entities").delete().eq("id", entityId);
      router.push("/dashboard/entities");
    } catch (err) { console.error("Error deleting entity:", err); }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ padding: "32px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", color: "#ef4444", fontSize: "14px" }}>{error || "Entity not found"}</div>
          <button onClick={() => router.push("/dashboard/entities")} style={{ marginTop: "16px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(246, 246, 246, 0.5)", cursor: "pointer", fontSize: "14px" }}>
            Return to Entity List
          </button>
        </div>
      </div>
    );
  }

  const rows: { label: string; value: string | null; mono?: boolean; copyable?: boolean }[] = [
    { label: "FQAN", value: entity.fqan, mono: true, copyable: true },
    { label: "Entity ID", value: entity.entity_id, mono: true, copyable: true },
    { label: "Developer", value: entity.developer_handle ? `@${entity.developer_handle}` : null, mono: true },
    { label: "Description", value: entity.description || entity.summary },
    { label: "Entity URL", value: entity.entity_url, mono: true },
    { label: "Category", value: entity.category },
    { label: "Registry", value: entity.home_registry, mono: true },
    { label: "Trust Score", value: entity.trust_score != null ? entity.trust_score.toFixed(3) : null },
  ];

  return (
    <div className="dashboard-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", paddingBottom: "16px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{entity.name}</h1>
            <span className={`dashboard-badge ${entity.status.toUpperCase() === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>{entity.status.toUpperCase()}</span>
          </div>
          <p style={{ marginTop: "4px", fontFamily: "monospace", fontSize: "12px", color: "rgba(246, 246, 246, 0.3)" }}>{entity.entity_id || entityId}</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href={`/dashboard/entities/${entityId}/edit`} className="dashboard-button-secondary" style={{ textDecoration: "none", padding: "8px 16px", fontSize: "14px", borderRadius: "6px" }}>Edit</Link>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: "8px 16px", fontSize: "14px", border: "1px solid rgba(239, 68, 68, 0.3)", background: "transparent", color: "rgba(239, 68, 68, 0.8)", cursor: "pointer", borderRadius: "6px" }}>Delete</button>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246, 246, 246, 0.5)" }}>Entity Details</span>
        </div>
        <div style={{ padding: "0 24px" }}>
          {rows.map((row) => row.value && (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: "rgba(246, 246, 246, 0.4)", minWidth: "120px", flexShrink: 0 }}>{row.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
                <span style={{ fontSize: "14px", color: row.label === "FQAN" ? "var(--color-accent)" : "#fff", fontFamily: row.mono ? "monospace" : "inherit", wordBreak: "break-all", textAlign: "right" }}>{row.value}</span>
                {row.copyable && (
                  <button onClick={() => handleCopy(row.value!, row.label)} style={{ background: "none", border: "none", cursor: "pointer", color: copied === row.label ? "var(--color-accent)" : "rgba(246, 246, 246, 0.3)", fontSize: "12px", padding: "4px", flexShrink: 0 }}>
                    {copied === row.label ? "✓" : "⎘"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {entity.tags && entity.tags.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: "rgba(246, 246, 246, 0.4)", minWidth: "120px", flexShrink: 0 }}>Tags</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>
                {entity.tags.map((tag) => <span key={tag} className="dashboard-badge badge-active" style={{ fontSize: "10px" }}>{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 999 }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="dashboard-card" style={{ maxWidth: "420px", width: "90%", margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0" }}>Delete Entity?</h3>
            <p style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.5)" }}>This action cannot be undone. This will permanently delete &ldquo;{entity.name}&rdquo;.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", cursor: "pointer", borderRadius: "6px" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "8px 16px", backgroundColor: "#dc2626", border: "none", color: "#fff", fontSize: "14px", cursor: "pointer", borderRadius: "6px" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
