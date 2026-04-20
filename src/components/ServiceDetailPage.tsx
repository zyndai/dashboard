"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { getEntity, type EntityRecord } from "../lib/api/agentdns";

const C = {
  bg: "#080f1a",
  surface: "#0d1625",
  surfaceAlt: "#152033",
  border: "rgba(255,255,255,0.08)",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textFaint: "#64748b",
  accent: "#5b7cfa",
  accentHover: "#7690fc",
  green: "#10b981",
  red: "#ef4444",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

import { COLOR_MAP } from "../lib/categoryTheme";

function formatDate(iso: string): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function CopyButton({ value, label }: { value: string; label?: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }).catch(() => {});
      }}
      style={{
        background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
        color: copied ? C.green : C.textMuted, fontSize: "12px", fontWeight: 500,
        display: "inline-flex", alignItems: "center", gap: "5px", transition: "all .15s",
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
      {label || (copied ? "Copied" : "Copy")}
    </button>
  );
}

function CodeBlock({ title, code, language }: { title: string; code: string; language: string }): React.ReactElement {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: C.textFaint, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>{language}</span>
          <CopyButton value={code} />
        </div>
      </div>
      <pre style={{
        background: "#060d17", border: `1px solid ${C.border}`, borderRadius: "10px",
        padding: "16px 20px", margin: 0, overflowX: "auto", fontSize: "13px",
        lineHeight: 1.7, fontFamily: C.mono, color: "#e2e8f0",
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function generateCurlExample(service: EntityRecord): string {
  const endpoint = service.service_endpoint || service.entity_url;
  if (!endpoint) return `# No endpoint available for this service`;
  return `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "your input here"
  }'`;
}

function generatePythonExample(service: EntityRecord): string {
  const endpoint = service.service_endpoint || service.entity_url;
  if (!endpoint) return `# No endpoint available for this service`;
  return `import requests

response = requests.post(
    "${endpoint}",
    json={"query": "your input here"},
    headers={"Content-Type": "application/json"}
)

print(response.json())`;
}

function generateJSExample(service: EntityRecord): string {
  const endpoint = service.service_endpoint || service.entity_url;
  if (!endpoint) return `// No endpoint available for this service`;
  return `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "your input here" }),
});

const data = await response.json();
console.log(data);`;
}

export function ServiceDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<EntityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "javascript">("curl");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    (async () => {
      try {
        const rec = await getEntity(id, controller.signal);
        setService(rec);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load service");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const pageStyle: React.CSSProperties = {
    backgroundColor: C.bg, minHeight: "100vh", color: C.text,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <Styles />
        <div className="page-padd" style={{ padding: "80px 0" }}>
          <div className="page-container" style={{ maxWidth: "1000px" }}>
            <div className="sd-skeleton" style={{ height: 40, width: "40%", borderRadius: 8, marginBottom: 16 }} />
            <div className="sd-skeleton" style={{ height: 20, width: "25%", borderRadius: 6, marginBottom: 40 }} />
            <div className="sd-skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 24 }} />
            <div className="sd-skeleton" style={{ height: 300, borderRadius: 16 }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <Styles />
        <div className="page-padd" style={{ padding: "120px 0", minHeight: "60vh", display: "flex", alignItems: "center" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: 20, background: "rgba(239,68,68,0.1)", borderRadius: "50%", marginBottom: 20 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>Service Not Found</h1>
            <p style={{ fontSize: 15, color: C.textMuted, margin: "0 0 30px", maxWidth: 400, marginInline: "auto", lineHeight: 1.6 }}>
              This service may have been removed or there was a network error.
            </p>
            <button onClick={() => router.push("/services")} className="sd-btn-primary" style={{ padding: "12px 24px", fontSize: 15, borderRadius: 10 }}>Return to Services</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = (service.status || "active").toUpperCase() === "ACTIVE";
  const statusColor = isActive ? C.green : C.red;
  const themeColor = COLOR_MAP[service.category ?? ""] || C.accent;
  const endpoint = service.service_endpoint || service.entity_url;

  const tabs: { key: "curl" | "python" | "javascript"; label: string }[] = [
    { key: "curl", label: "cURL" },
    { key: "python", label: "Python" },
    { key: "javascript", label: "JavaScript" },
  ];

  return (
    <div style={pageStyle}>
      <Navbar />
      <Styles />

      <div className="page-padd" style={{ padding: "40px 0 100px", position: "relative", zIndex: 1 }}>
        <div className="page-container" style={{ maxWidth: "1100px" }}>

          <nav className="sd-fade dl-1" style={{ marginBottom: 32 }}>
            <button onClick={() => router.push("/services")} className="sd-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Services
            </button>
          </nav>

          {/* Header */}
          <header className="sd-fade dl-2" style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ padding: "6px 12px", background: `${themeColor}1a`, border: `1px solid ${themeColor}4d`, color: themeColor, borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                {service.category || "Service"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: statusColor, fontSize: 13, fontWeight: 500, background: `${statusColor}10`, padding: "6px 12px", borderRadius: 20, border: `1px solid ${statusColor}33` }}>
                <div style={{ width: 8, height: 8, background: statusColor, borderRadius: "50%" }} />
                {isActive ? "Available" : "Offline"}
              </div>
            </div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.1 }}>
              {service.name}
            </h1>
            <p style={{ fontSize: 15, color: C.textMuted, margin: 0, lineHeight: 1.6, maxWidth: 700 }}>
              {service.summary || "No description available."}
            </p>
          </header>

          {/* Stats row */}
          <div className="sd-fade dl-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="Endpoint" value={endpoint ? (() => { try { return new URL(endpoint).pathname; } catch { return endpoint; } })() : "N/A"} />
            <StatCard label="Registered" value={formatDate(service.registered_at)} />
            <StatCard label="Category" value={service.category || "General"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }} className="sd-grid">
            {/* Main content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>

              {/* Endpoint & Quick Start */}
              {endpoint && (
                <Card className="sd-fade dl-4">
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Service Endpoint
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#060d17", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.green, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>POST</span>
                    <code style={{ fontSize: 13, fontFamily: C.mono, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{endpoint}</code>
                    <CopyButton value={endpoint} />
                  </div>
                </Card>
              )}

              {/* Code Examples */}
              <Card className="sd-fade dl-4">
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Quick Start
                </h2>

                <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#060d17", borderRadius: 8, padding: 4 }}>
                  {tabs.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        flex: 1, padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                        border: "none", cursor: "pointer", transition: "all .15s",
                        background: activeTab === t.key ? C.accent : "transparent",
                        color: activeTab === t.key ? "#fff" : C.textMuted,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === "curl" && <CodeBlock title="Make a request" code={generateCurlExample(service)} language="bash" />}
                {activeTab === "python" && <CodeBlock title="Make a request" code={generatePythonExample(service)} language="python" />}
                {activeTab === "javascript" && <CodeBlock title="Make a request" code={generateJSExample(service)} language="javascript" />}
              </Card>

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <Card className="sd-fade dl-5">
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Tags
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {service.tags.map(tag => (
                      <span key={tag} style={{ fontFamily: C.mono, fontSize: 12, color: "#cbd5e1", background: "#111b2b", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: 6 }}>{tag}</span>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="sd-sidebar sd-fade dl-6" style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 100 }}>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Service Info</h3>
                </div>
                <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14, background: "rgba(0,0,0,0.15)" }}>
                  <InfoRow label="Entity ID" value={service.entity_id} mono />
                  <InfoRow label="Owner" value={service.owner || "N/A"} />
                  <InfoRow label="Status" value={isActive ? "Active" : "Inactive"} color={statusColor} />
                  <InfoRow label="Last Updated" value={formatDate(service.updated_at)} />
                  {service.entity_pricing && (
                    <InfoRow label="Pricing" value={service.entity_pricing.model === "free" ? "Free" : `$${service.entity_pricing.base_price_usd} / request`} color={C.green} />
                  )}
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: C.textFaint, textTransform: "uppercase", letterSpacing: "1.2px", margin: "0 0 16px" }}>Integration</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="sd-btn-secondary" onClick={() => endpoint && navigator.clipboard.writeText(endpoint)}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      Copy Endpoint
                    </span>
                  </button>
                  <button className="sd-btn-secondary" onClick={() => navigator.clipboard.writeText(generateCurlExample(service))}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                      Copy cURL
                    </span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`sd-card ${className || ""}`} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="sd-card" style={{ display: "flex", flexDirection: "column", padding: 20, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
    </div>
  );
}

function InfoRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: mono ? C.mono : "inherit", color: color || C.text, fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={value}>{value}</span>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @keyframes sd-fade-in { 0% { opacity:0; transform:translateY(12px); } 100% { opacity:1; transform:translateY(0); } }
      @keyframes sd-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      .sd-fade { animation: sd-fade-in .6s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
      .dl-1 { animation-delay:.05s; } .dl-2 { animation-delay:.1s; } .dl-3 { animation-delay:.15s; }
      .dl-4 { animation-delay:.2s; } .dl-5 { animation-delay:.25s; } .dl-6 { animation-delay:.3s; }
      .sd-skeleton { background:${C.surfaceAlt}; animation: sd-pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
      .sd-card { transition: border-color .15s; }
      .sd-card:hover { border-color: rgba(255,255,255,0.15); }
      .sd-back { display:inline-flex; align-items:center; background:transparent; border:none; color:${C.textMuted}; font-size:14px; font-weight:500; cursor:pointer; padding:6px 12px 6px 0; transition:color .15s; }
      .sd-back:hover { color:#fff; }
      .sd-btn-primary { background:${C.accent}; color:#fff; border:none; font-weight:600; cursor:pointer; transition:all .15s; }
      .sd-btn-primary:hover { background:${C.accentHover}; }
      .sd-btn-secondary { width:100%; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:12px 16px; border-radius:8px; font-size:14px; font-weight:500; cursor:pointer; transition:all .15s; }
      .sd-btn-secondary:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.2); }
      @media (max-width:900px) { .sd-grid { grid-template-columns:1fr !important; } .sd-sidebar { position:static !important; } }
    `}</style>
  );
}
