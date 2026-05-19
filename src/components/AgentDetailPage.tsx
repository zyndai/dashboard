"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  getEntity,
  getNetworkStatus,
  getEntityCard,
  getEntityCardDirect,
  type EntityRecord,
  type NetworkStatus,
  type EntityCard,
} from "../lib/api/agentdns";

const C = {
  bg: "#080f1a",
  surface: "#0d1625",
  surfaceAlt: "#152033",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
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

function resolveCategoryTheme(category: string | null): string {
  if (!category) return C.accent;
  return COLOR_MAP[category] || C.accent;
}

function isLoopbackUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1";
  } catch {
    return false;
  }
}

function formatDate(iso: string): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "\u2014";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(iso);
}

function truncateMiddle(s: string, head = 12, tail = 6): string {
  if (!s) return "";
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}\u2026${s.slice(-tail)}`;
}

async function copyToClipboard(value: string): Promise<boolean> {
  // Modern API requires secure context (HTTPS or localhost). Fall back to a
  // hidden textarea so prod previews behind a custom proxy still work.
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through
    }
  }
  if (typeof document === "undefined") return false;
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

function CopyEntityIdButton({
  value,
  label,
  variant,
  style,
}: {
  value: string;
  label: string;
  variant: "primary" | "secondary";
  style?: React.CSSProperties;
}): React.ReactElement {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const handle = async (): Promise<void> => {
    const ok = await copyToClipboard(value);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1500);
  };

  const className = variant === "primary" ? "dp-btn-primary" : "dp-btn-secondary";
  const baseStyle: React.CSSProperties =
    variant === "primary"
      ? { display: "inline-flex", alignItems: "center", gap: "8px", ...style }
      : { display: "flex", justifyContent: "space-between", alignItems: "center", ...style };

  const isCopied = state === "copied";
  const isFailed = state === "failed";
  const displayLabel = isCopied ? "Copied!" : isFailed ? "Copy failed" : label;

  const leadingIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
  const trailingIcon = isCopied ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={handle}
      className={className}
      style={baseStyle}
      aria-label={label}
    >
      {variant === "primary" ? (
        <>
          {trailingIcon}
          {displayLabel}
        </>
      ) : (
        <>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {leadingIcon}
            {displayLabel}
          </span>
          {trailingIcon}
        </>
      )}
    </button>
  );
}

function CopyButton({ value }: { value: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const handle = async (): Promise<void> => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="dp-copy"
      aria-label="Copy"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function AgentDetailPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const router = useRouter();
  const [agent, setAgent] = useState<EntityRecord | null>(null);
  const [card, setCard] = useState<EntityCard | null>(null);
  const [cardFetchFailed, setCardFetchFailed] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setEntityId(p.id));
  }, [params]);

  useEffect(() => {
    if (!entityId) return;
    const controller = new AbortController();

    (async () => {
      try {
        const rec = await getEntity(entityId, controller.signal);
        setAgent(rec);

        const isActive = (rec.status || "active").toUpperCase() === "ACTIVE";
        if (isActive) {
          let cardData = await getEntityCard(entityId, controller.signal);
          // Registry proxy can't reach private/loopback agent URLs from the
          // cloud. Try fetching the card directly from the entity URL in case
          // the user's browser can reach it (works for local dev).
          if (!cardData) {
            cardData = await getEntityCardDirect(rec.entity_url, controller.signal);
          }
          if (cardData) {
            setCard(cardData);
          } else {
            setCardFetchFailed(true);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load entity");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    getNetworkStatus(controller.signal)
      .then(setNetworkInfo)
      .catch(() => {});

    return () => controller.abort();
  }, [entityId]);

  const pageStyle: React.CSSProperties = {
    backgroundColor: C.bg,
    minHeight: "100vh",
    color: C.text,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <PageStyles />
        <div className="page-padd" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
          <div className="page-container" style={{ maxWidth: "1000px" }}>
             <div className="dp-skeleton animate-pulse" style={{ height: "40px", width: "40%", borderRadius: "8px", marginBottom: "16px" }} />
             <div className="dp-skeleton animate-pulse" style={{ height: "20px", width: "25%", borderRadius: "6px", marginBottom: "40px" }} />
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                 <div className="dp-skeleton animate-pulse" style={{ height: "100px", borderRadius: "16px" }} />
                 <div className="dp-skeleton animate-pulse" style={{ height: "100px", borderRadius: "16px" }} />
                 <div className="dp-skeleton animate-pulse" style={{ height: "100px", borderRadius: "16px" }} />
             </div>
             <div className="dp-skeleton animate-pulse" style={{ height: "300px", borderRadius: "20px" }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <PageStyles />
        <div className="page-padd" style={{ paddingTop: "80px", paddingBottom: "80px", minHeight: "60vh", display: "flex", alignItems: "center" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "20px", background: "rgba(239,68,68,0.1)", borderRadius: "50%", marginBottom: "20px" }}>
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="10" />
                     <line x1="12" y1="8" x2="12" y2="12" />
                     <line x1="12" y1="16" x2="12.01" y2="16" />
                 </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 12px", color: C.text }}>Entity Not Found</h1>
            <p style={{ fontSize: "15px", color: C.textMuted, margin: "0 0 30px", maxWidth: "400px", marginInline: "auto", lineHeight: 1.6 }}>We couldn&apos;t load this entity. It may have been removed or there was a network error.</p>
            <button type="button" onClick={() => router.back()} className="dp-btn-primary" style={{ padding: "12px 24px", fontSize: "15px", borderRadius: "10px" }}>Return to Registry</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = (agent.status || "active").toUpperCase() === "ACTIVE";
  const statusColor = isActive ? C.green : C.red;
  const themeColor = resolveCategoryTheme(agent.category);
  const isService = (agent.entity_type || "agent").toLowerCase() === "service";
  const entityNoun = isService ? "service" : "agent";
  const EntityNoun = isService ? "Service" : "Agent";

  return (
    <div style={pageStyle}>
      <Navbar />
      <PageStyles />

      <div className="page-padd" style={{ paddingTop: "16px", paddingBottom: "80px", position: "relative", zIndex: 1 }}>
        <div className="page-container" style={{ maxWidth: "1100px" }}>

          <nav aria-label="Breadcrumb" className="fade-in dl-1" style={{ marginBottom: "32px" }}>
            <button type="button" onClick={() => router.back()} className="dp-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Registry
            </button>
          </nav>

          <header className="fade-in dl-2 dp-header" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: "24px", rowGap: "16px", alignItems: "start", marginBottom: "40px", textAlign: "left" }}>
            <div style={{ minWidth: 0, gridColumn: "1" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ padding: "5px 11px", background: `${themeColor}1a`, border: `1px solid ${themeColor}4d`, color: themeColor, borderRadius: "999px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {agent.category || "General"}
                </span>
                <span style={{ padding: "5px 11px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: "999px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {EntityNoun}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: statusColor, fontSize: "11px", fontWeight: 600, background: `${statusColor}14`, padding: "5px 11px", borderRadius: "999px", border: `1px solid ${statusColor}33`, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <span style={{ width: "6px", height: "6px", background: statusColor, borderRadius: "50%" }} />
                  {isActive ? "Operational" : "Offline"}
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.1, textAlign: "left" }}>
                {agent.name}
              </h1>
              <p style={{ fontSize: "13px", color: C.textMuted, margin: 0, fontFamily: C.mono, wordBreak: "break-all" }}>
                <span style={{ color: C.textFaint }}>ID:</span> {agent.entity_id}
              </p>
            </div>

            <CopyEntityIdButton
              value={agent.entity_id}
              label={`Copy ${EntityNoun} ID`}
              variant="primary"
              style={{ gridColumn: "2", justifySelf: "end", height: "38px", padding: "0 16px", fontSize: "13px", fontWeight: 600, borderRadius: "8px", whiteSpace: "nowrap" }}
            />
          </header>

          {cardFetchFailed && isActive && (
            <div className="fade-in dl-3" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", marginBottom: "24px", fontSize: "13px", color: C.textMuted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>
                {isLoopbackUrl(agent.entity_url)
                  ? <>Agent registered with a loopback URL (<code style={{ fontFamily: C.mono, fontSize: "12px" }}>{agent.entity_url}</code>) — not reachable from the public registry. Expose it via a public URL (e.g. ngrok or cloudflared) to fetch its full card.</>
                  : "Agent card unavailable — showing basic entity information. The agent may be offline or its card endpoint is unreachable."}
              </span>
            </div>
          )}

          <div className="fade-in dl-3 dp-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              <BentoStat label="capabilities" value={String(card?.skills?.length || agent.tags?.length || 0)} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>} />
              <BentoStat label="registered" value={formatDate(agent.registered_at)} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
              <BentoStat label="category module" value={agent.category || "General"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }} className="dp-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

              <BentoCard className="fade-in dl-4">
                 <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    System Description
                 </h2>
                 <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.7, margin: 0 }}>
                    {card?.description || agent.summary || `This ${entityNoun} does not have a comprehensive description provided. It is designed to act on its defined capabilities and core category attributes.`}
                 </p>
              </BentoCard>

              {(agent.tags && agent.tags.length > 0 || card?.skills && card.skills.length > 0) && (
                <BentoCard className="fade-in dl-4">
                   <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      Operational Capabilities
                   </h2>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                     {(card?.skills || agent.tags)?.map(item => {
                       const tag = typeof item === "string" ? item : item.name;
                       return (
                         <span key={tag} className="tech-tag">{tag}</span>
                       );
                     })}
                   </div>
                </BentoCard>
              )}

              <BentoCard className="fade-in dl-5">
                 <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                    Configuration & Identity
                 </h2>
                 <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <DetailRow label={`${EntityNoun} ID`} value={agent.entity_id} mono />
                    <DetailRow label="Owner" value={agent.owner || "N/A"} mono={!!agent.owner} />
                    <DetailRow label="Home Registry" value={agent.home_registry || "N/A"} mono={!!agent.home_registry} />
                    {card?.url && <DetailRow label="Service URL" value={card.url} mono link />}
                    <DetailRow label="Status" value={isActive ? "ACTIVE" : "INACTIVE"} color={statusColor} />
                 </div>
              </BentoCard>

            </div>

            <div className="dp-sidebar fade-in dl-6" style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "100px" }}>
              <BentoCard>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: C.textFaint, textTransform: "uppercase", letterSpacing: "1.2px", margin: "0 0 16px" }}>Provider</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                       <SidebarField
                         label="Developer"
                         value={agent.developer_handle ? `@${agent.developer_handle}` : agent.owner ? truncateMiddle(agent.owner) : "—"}
                         copyValue={agent.owner || undefined}
                         mono={!agent.developer_handle}
                       />
                       {agent.fqan && (
                         <SidebarField
                           label="FQAN"
                           value={agent.fqan}
                           copyValue={agent.fqan}
                           mono
                           accent
                         />
                       )}
                       <SidebarField
                         label="Public Key"
                         value={truncateMiddle(agent.public_key, 16, 8)}
                         copyValue={agent.public_key}
                         mono
                       />
                       <SidebarField
                         label="Last Heartbeat"
                         value={formatRelativeTime(agent.last_heartbeat)}
                       />
                       <SidebarField
                         label="Schema"
                         value={`v${agent.schema_version || "1.0"}`}
                         mono
                       />
                  </div>
              </BentoCard>

              <BentoCard>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: C.textFaint, textTransform: "uppercase", letterSpacing: "1.2px", margin: "0 0 16px" }}>Network Status</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <span style={{ fontSize: "14px", color: C.textMuted }}>Node Uptime</span>
                           <span style={{ fontSize: "14px", color: C.text, fontWeight: 500 }}>{networkInfo?.uptime || "\u2014"}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <span style={{ fontSize: "14px", color: C.textMuted }}>Local Agents</span>
                           <span style={{ fontSize: "14px", color: C.text, fontWeight: 500 }}>{networkInfo?.local_agents ?? "\u2014"}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <span style={{ fontSize: "14px", color: C.textMuted }}>Peers Connected</span>
                           <span style={{ fontSize: "14px", color: C.green, fontWeight: 500 }}>{networkInfo?.peer_count ?? "\u2014"}</span>
                       </div>
                  </div>
              </BentoCard>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BentoCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
   return (
      <div className={`dp-bento ${className || ''}`} style={{ background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "24px", ...style }}>
          {children}
      </div>
   );
}

function BentoStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
   return (
       <div className="dp-bento dp-stat-card" style={{ display: "flex", flexDirection: "column", padding: "20px", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
           <div style={{ color: C.accent, marginBottom: "16px", opacity: 0.8 }}>{icon}</div>
           <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
           <div style={{ fontSize: "12px", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
       </div>
   );
}

function SidebarField({
  label,
  value,
  copyValue,
  mono,
  accent,
}: {
  label: string;
  value: string;
  copyValue?: string;
  mono?: boolean;
  accent?: boolean;
}): React.ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
        <span
          style={{
            fontSize: "13px",
            color: accent ? C.accent : C.text,
            fontFamily: mono ? C.mono : "inherit",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
          title={copyValue || value}
        >
          {value}
        </span>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, link, color }: { label: string; value: string; mono?: boolean; link?: boolean; color?: string }) {
    return (
        <div className="dp-detail-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "8px", margin: "0 -12px" }}>
            <span style={{ fontSize: "14px", color: C.textMuted, fontWeight: 500, minWidth: "120px" }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, overflow: "hidden" }}>
                {link ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", fontFamily: mono ? C.mono : "inherit", color: C.accent, textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="hover-underline">{value}</a>
                ) : (
                    <span style={{ fontSize: "14px", fontFamily: mono ? C.mono : "inherit", color: color || C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={value}>{value}</span>
                )}
                {value !== "N/A" && <CopyButton value={value} />}
            </div>
        </div>
    );
}

function PageStyles() {
  return (
    <style>{`
      @keyframes dp-fade-slide {
        0% { transform: translateY(12px); }
        100% { transform: translateY(0); }
      }
      @keyframes dp-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* fade-in animates the slide-in only — opacity stays at the default
         (1). If the animation never fires for any reason (hydration retry,
         browser extension cancelling animations, etc.), the element remains
         visible. */
      .fade-in {
        animation: dp-fade-slide 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .dl-1 { animation-delay: 0.05s; }
      .dl-2 { animation-delay: 0.1s; }
      .dl-3 { animation-delay: 0.15s; }
      .dl-4 { animation-delay: 0.2s; }
      .dl-5 { animation-delay: 0.25s; }
      .dl-6 { animation-delay: 0.3s; }

      .animate-pulse {
          animation: dp-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      .dp-skeleton {
          background: ${C.surfaceAlt};
      }

      .dp-bento {
          transition: border-color 0.15s ease, background-color 0.15s ease;
      }
      .dp-bento:hover {
          border-color: rgba(255,255,255,0.15);
      }

      .dp-back {
          display: inline-flex;
          align-items: center;
          background: transparent;
          border: none;
          color: ${C.textMuted};
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 12px 6px 0;
          transition: color 0.15s ease;
      }
      .dp-back:hover { color: #fff; }

      .dp-btn-primary {
          background: ${C.accent};
          color: #fff;
          border: none;
          font-weight: 600;
          transition: all 0.15s ease;
      }
      .dp-btn-primary:not(:disabled):hover {
          background: ${C.accentHover};
      }
      .dp-btn-primary:not(:disabled):active {
          transform: translateY(0);
      }

      .dp-btn-secondary {
          width: 100%;
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
      }
      .dp-btn-secondary:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
      }

      .tech-tag {
          font-family: ${C.mono};
          font-size: 12px;
          color: #cbd5e1;
          background: #111b2b;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s ease;
      }
      .tech-tag:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
          color: #fff;
      }

      .dp-detail-row:hover {
          background: rgba(255,255,255,0.02);
      }

      .dp-copy {
          background: transparent;
          border: none;
          color: ${C.textMuted};
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
      }
      .dp-copy:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
      }

      .hover-underline:hover { text-decoration: underline; text-underline-offset: 2px; }

      @media (max-width: 768px) {
          .dp-grid { grid-template-columns: 1fr !important; }
          .dp-sidebar { position: static !important; }
      }

      /* ----- Mobile (<= 640px) ----- */
      @media (max-width: 640px) {
          .dp-header {
              grid-template-columns: 1fr !important;
              row-gap: 14px !important;
              margin-bottom: 28px !important;
          }
          .dp-header .dp-btn-primary {
              grid-column: 1 !important;
              justify-self: stretch !important;
              width: 100% !important;
              justify-content: center !important;
              height: 42px !important;
          }
          .dp-stats {
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
              margin-bottom: 24px !important;
          }
          .dp-stat-card { padding: 14px !important; }
          .dp-stat-card > div:first-child { margin-bottom: 10px !important; }
          .dp-stat-card > div:nth-child(2) { font-size: 18px !important; }
          .dp-stat-card > div:last-child { font-size: 10.5px !important; letter-spacing: 0.6px !important; }
          .dp-bento { padding: 18px !important; border-radius: 10px !important; }
          .dp-detail-row {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 6px !important;
              padding: 10px 12px !important;
          }
          .dp-detail-row > span:first-child {
              min-width: 0 !important;
              font-size: 11.5px !important;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: ${C.textFaint} !important;
          }
          .dp-detail-row > div { width: 100%; overflow: visible !important; }
          .dp-detail-row > div > span,
          .dp-detail-row > div > a {
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: clip !important;
              word-break: break-all;
              font-size: 13px !important;
              flex: 1;
          }
          .dp-btn-secondary { padding: 10px 14px !important; font-size: 13px !important; }
      }
    `}</style>
  );
}
