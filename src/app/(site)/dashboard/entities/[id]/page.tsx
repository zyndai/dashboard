"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EntityDetail {
  entity_id: string;
  name: string;
  summary?: string | null;
  entity_url?: string | null;
  category?: string | null;
  tags?: string[] | null;
  fqan?: string | null;
  developer_handle?: string | null;
  status: string;
  source: string;
  registered_at?: string | null;
  updated_at?: string | null;
  capability_summary?: {
    input_types?: string[];
    languages?: string[];
    models?: string[];
    output_types?: string[];
    protocols?: string[];
    skills?: string[];
  } | null;
  developer_id?: string | null;
  developer_proof?: {
    entity_index?: number;
    developer_public_key?: string;
    developer_signature?: string;
  };
  home_registry?: string | null;
  last_heartbeat?: string | null;
  openapi_url?: string | null;
  pricing_model?: {
    base_price?: number;
    currency?: string;
    details?: string;
    type?: string;
    unit?: string;
  };
  public_key?: string | null;
  schema_version?: string | null;
  service_endpoint?: string | null;
  signature?: string | null;
  ttl?: number | null;
  type?: string | null;
}

export default function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);

  useEffect(() => { params.then((p) => setEntityId(p.id)); }, [params]);

  useEffect(() => {
    if (!entityId) return;
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
  }, [entityId]);

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

  const rows: { label: string; value: string | null | undefined; mono?: boolean }[] = [
    { label: "Entity ID", value: entity.entity_id, mono: true },
    { label: "FQAN", value: entity.fqan, mono: true },
    { label: "Developer", value: entity.developer_handle ? `@${entity.developer_handle}` : null, mono: true },
    { label: "Summary", value: entity.summary },
    { label: "Entity URL", value: entity.entity_url, mono: true },
    { label: "Category", value: entity.category },
    { label: "Registry", value: entity.home_registry, mono: true },
    { label: "Service Endpoint", value: entity.service_endpoint, mono: true },
    { label: "Type", value: entity.type },
    { label: "Registered", value: entity.registered_at },
    { label: "Updated", value: entity.updated_at },
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
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246, 246, 246, 0.5)" }}>Entity Details</span>
        </div>
        <div style={{ padding: "0 24px" }}>
          {rows.map((row) => row.value && (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: "rgba(246, 246, 246, 0.4)", minWidth: "120px", flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: "14px", color: row.label === "FQAN" ? "var(--color-accent)" : "#fff", fontFamily: row.mono ? "monospace" : "inherit", wordBreak: "break-all", textAlign: "right" }}>{row.value}</span>
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
          {entity.capability_summary && (
            <div style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <span style={{ fontSize: "13px", color: "rgba(246, 246, 246, 0.4)", minWidth: "120px", flexShrink: 0, marginBottom: "8px", display: "block" }}>Capabilities</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {entity.capability_summary.models?.map((m) => <span key={m} className="dashboard-badge badge-active" style={{ fontSize: "10px" }}>{m}</span>)}
                {entity.capability_summary.languages?.map((l) => <span key={l} className="dashboard-badge" style={{ fontSize: "10px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "rgba(139, 92, 246, 0.8)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>{l}</span>)}
                {entity.capability_summary.protocols?.map((p) => <span key={p} className="dashboard-badge" style={{ fontSize: "10px", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "rgba(246, 246, 246, 0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>{p}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
