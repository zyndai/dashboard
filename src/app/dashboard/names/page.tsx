"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ZNSName {
  fqan: string; entity_name: string; developer_handle: string; registry_host: string;
  entity_id: string; developer_id: string; current_version?: string;
  registered_at: string; updated_at: string; signature: string;
}
interface ZNSResolveResponse {
  fqan: string; entity_id: string; developer_id: string; developer_handle: string;
  registry_host: string; version?: string; entity_url: string; public_key: string;
  protocols?: string[]; trust_score: number; verification_tier?: string; status: string;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return d; }
}

export default function NamesPage() {
  const { authenticated } = useAuth();
  const [names, setNames] = useState<ZNSName[]>([]);
  const [handle, setHandle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ZNSName | null>(null);
  const [resolveResult, setResolveResult] = useState<ZNSResolveResponse | null>(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [copiedFQAN, setCopiedFQAN] = useState<string | null>(null);

  const fetchNames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/zns/names");
      if (res.ok) { const d = await res.json(); setNames(d.names ?? []); setHandle(d.handle ?? null); setError(null); }
      else { const d = await res.json(); setError(d.error || "Failed to load names"); }
    } catch { setError("Failed to load names"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authenticated) fetchNames(); }, [authenticated, fetchNames]);

  const filteredNames = names.filter((n) =>
    n.fqan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.entity_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function handleResolve(name: ZNSName) {
    setResolveTarget(name); setResolveResult(null); setResolveError(null); setResolveDialogOpen(true); setResolveLoading(true);
    try {
      const res = await fetch(`/api/zns/resolve?developer=${encodeURIComponent(name.developer_handle)}&entity=${encodeURIComponent(name.entity_name)}`);
      const data = await res.json();
      if (!res.ok) setResolveError(data.error || "Failed to resolve"); else setResolveResult(data);
    } catch { setResolveError("Failed to resolve name"); }
    finally { setResolveLoading(false); }
  }

  async function handleCopyFQAN(fqan: string) {
    try { await navigator.clipboard.writeText(fqan); setCopiedFQAN(fqan); setTimeout(() => setCopiedFQAN(null), 2000); } catch { /* */ }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header"><div><h1>Names</h1><p>ZNS agent name bindings registered under your handle</p></div></div>

      {handle && (
        <div className="dashboard-grid-3col">
          <div className="dashboard-card stats-card"><div className="stats-value" style={{ color: "var(--color-accent)", fontSize: "20px" }}>@{handle}</div><div className="stats-label">Handle</div></div>
          <div className="dashboard-card stats-card"><div className="stats-value" style={{ color: "var(--color-accent)" }}>{names.length}</div><div className="stats-label">Total Names</div></div>
          <div className="dashboard-card stats-card"><div className="stats-value" style={{ color: "var(--color-accent)", fontSize: "20px" }}>{names.length > 0 ? formatDate(names[0].registered_at) : "—"}</div><div className="stats-label">Registered</div></div>
        </div>
      )}

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246, 246, 246, 0.5)" }}>Name Registry</span>
          <input type="text" placeholder="Search names..." className="dashboard-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "240px", padding: "8px 12px", margin: 0 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ padding: "32px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", color: "#ef4444" }}>{error}</div>
          </div>
        ) : filteredNames.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 500, color: "rgba(246, 246, 246, 0.5)", margin: "0 0 8px 0" }}>{searchTerm ? "No matching names found" : "No names registered yet"}</p>
            <p style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.3)", margin: 0 }}>{searchTerm ? "Try a different search term." : handle ? "Register an agent name binding via the agent-dns CLI." : "Claim a handle first, then register agent names."}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead><tr><th>FQAN</th><th>Agent Name</th><th>Entity ID</th><th>Version</th><th>Updated</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
              <tbody>
                {filteredNames.map((name) => (
                  <tr key={name.fqan}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--color-accent)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name.fqan}</code>
                        <button onClick={() => handleCopyFQAN(name.fqan)} style={{ background: "none", border: "none", cursor: "pointer", color: copiedFQAN === name.fqan ? "var(--color-success)" : "rgba(246, 246, 246, 0.25)", fontSize: "12px", padding: "2px", flexShrink: 0 }}>{copiedFQAN === name.fqan ? "✓" : "⎘"}</button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: "#fff" }}>{name.entity_name}</td>
                    <td><code style={{ padding: "4px 8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", fontFamily: "monospace", fontSize: "12px", color: "rgba(246, 246, 246, 0.5)" }}>{name.entity_id ? `${name.entity_id.substring(0, 18)}...` : "—"}</code></td>
                    <td>{name.current_version ? <span className="dashboard-badge badge-pending">{name.current_version}</span> : <span style={{ fontSize: "12px", fontStyle: "italic", color: "rgba(246,246,246,0.25)" }}>—</span>}</td>
                    <td style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.4)" }}>{formatDate(name.updated_at)}</td>
                    <td style={{ textAlign: "right" }}><button onClick={() => handleResolve(name)} className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "4px" }}>Resolve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resolveDialogOpen && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 999 }} onClick={() => { setResolveDialogOpen(false); setResolveResult(null); setResolveError(null); }}>
          <div className="dashboard-card" style={{ maxWidth: "520px", width: "90%", margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Resolve Name</h3>
              <button onClick={() => { setResolveDialogOpen(false); setResolveResult(null); setResolveError(null); }} style={{ background: "none", border: "none", color: "rgba(246, 246, 246, 0.4)", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            {resolveTarget && (
              <div>
                <div style={{ padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246, 246, 246, 0.3)", marginBottom: "4px" }}>FQAN</div>
                  <code style={{ fontFamily: "monospace", fontSize: "14px", color: "var(--color-accent)", wordBreak: "break-all" }}>{resolveTarget.fqan}</code>
                </div>
                {resolveLoading ? (
                  <div style={{ textAlign: "center", padding: "24px" }}>
                    <div style={{ width: "24px", height: "24px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                  </div>
                ) : resolveError ? (
                  <div style={{ padding: "12px 16px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", color: "#ef4444", fontSize: "14px" }}>{resolveError}</div>
                ) : resolveResult ? (
                  <div>
                    {[
                      { label: "Entity ID", value: resolveResult.entity_id, mono: true },
                      { label: "Status", value: resolveResult.status },
                      { label: "Version", value: resolveResult.version },
                      { label: "Entity URL", value: resolveResult.entity_url, mono: true },
                      { label: "Developer", value: resolveResult.developer_handle },
                      { label: "Registry", value: resolveResult.registry_host },
                      { label: "Trust Score", value: resolveResult.trust_score?.toFixed(3) },
                      { label: "Verification", value: resolveResult.verification_tier },
                      { label: "Protocols", value: resolveResult.protocols && resolveResult.protocols.length > 0 ? resolveResult.protocols.join(", ") : undefined },
                    ].filter((r) => r.value).map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "rgba(246, 246, 246, 0.4)", minWidth: "100px" }}>{row.label}</span>
                        <span style={{ fontSize: "12px", textAlign: "right", wordBreak: "break-all", fontFamily: row.mono ? "monospace" : "inherit", color: row.mono ? "rgba(246, 246, 246, 0.6)" : "#fff" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
