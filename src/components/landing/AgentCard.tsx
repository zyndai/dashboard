"use client";

import Link from "next/link";
import type { FeaturedAgent } from "@/lib/landing/featuredAgents";

const DOT_PALETTE: string[] = [
  "#818cf8", // indigo
  "#34d399", // emerald
  "#22d3ee", // cyan
  "#f59e0b", // amber
  "#c084fc", // violet
];

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function dotColorFor(category: string): string {
  return DOT_PALETTE[hashStr((category || "").toLowerCase()) % DOT_PALETTE.length];
}

export function isAgentActive(status: string): boolean {
  return (status || "").toUpperCase() === "ACTIVE";
}

export function relativeAge(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const diff = Date.now() - t;
  if (diff < 0) return "now";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function CategoryGlyph({ category, size = 18 }: { category: string; size?: number }): React.ReactElement {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  const k = (category || "").toLowerCase();

  if (k.includes("ai") || k.includes("intelligence") || k.includes("research")) {
    return (
      <svg {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14Z" /></svg>
    );
  }
  if (k.includes("data") || k.includes("extraction") || k.includes("scraping")) {
    return (
      <svg {...props}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
    );
  }
  if (k.includes("nlp") || k.includes("language") || k.includes("text") || k.includes("translation") || k.includes("parsing")) {
    return (
      <svg {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
    );
  }
  if (k.includes("finance") || k.includes("payment") || k.includes("crypto")) {
    return (
      <svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    );
  }
  if (k.includes("analy") || k.includes("scor")) {
    return (
      <svg {...props}><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m7 16 4-8 4 5 4-7" /></svg>
    );
  }
  if (k.includes("automation") || k.includes("workflow") || k.includes("pipeline")) {
    return (
      <svg {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="3" /></svg>
    );
  }
  if (k.includes("verif") || k.includes("compliance") || k.includes("identity") || k.includes("kyc")) {
    return (
      <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    );
  }
  if (k.includes("security")) {
    return (
      <svg {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    );
  }
  if (k.includes("communication") || k.includes("chat") || k.includes("email")) {
    return (
      <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    );
  }
  if (k.includes("hiring") || k.includes("hr") || k.includes("recruit")) {
    return (
      <svg {...props}><circle cx="9" cy="7" r="4" /><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    );
  }
  if (k.includes("supply") || k.includes("logistics") || k.includes("ecommerce")) {
    return (
      <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
    );
  }
  if (k.includes("devops") || k.includes("github") || k.includes("ci")) {
    return (
      <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    );
  }
  if (k.includes("search") || k.includes("discovery")) {
    return (
      <svg {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    );
  }
  if (k.includes("orchestr")) {
    return (
      <svg {...props}><circle cx="12" cy="12" r="2" /><circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" /><circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" /><path d="M6 6h4M14 6h4M6 18h4M14 18h4M12 10v4" /></svg>
    );
  }
  return (
    <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  );
}

export function CategoryDot({ category }: { category: string }): React.ReactElement {
  const c = dotColorFor(category);
  return <span className="zac-cat-dot" style={{ background: c }} aria-hidden />;
}

export function AgentCard({
  agent,
  interactive = true,
}: {
  agent: FeaturedAgent;
  interactive?: boolean;
}): React.ReactElement {
  const active = isAgentActive(agent.status);
  const age = relativeAge(agent.lastHeartbeat);
  const iconColor = dotColorFor(agent.category);
  const className = `zac-card${interactive ? "" : " zac-card--static"}`;
  const style = { ["--icon-accent" as string]: iconColor };

  const tags = (agent.tags || []).slice(0, 3);

  const inner = (
    <>
      <span className="zac-card-grid" aria-hidden />
      <span className="zac-card-glow" aria-hidden />
      <span className="zac-card-ring" aria-hidden />

      <div className="zac-card-top">
        <div className="zac-icon">
          <CategoryGlyph category={agent.category} size={20} />
          <span className="zac-icon-shine" aria-hidden />
        </div>
        <div className="zac-meta">
          <div className="zac-name-row">
            <div className="zac-name">{agent.name}</div>
            <span className={`zac-type-tag ${agent.entityType === "service" ? "service" : "agent"}`}>
              {agent.entityType === "service" ? "SVC" : "AGT"}
            </span>
          </div>
          <div className="zac-owner">{agent.owner}</div>
        </div>
        {interactive && (
          <span className="zac-arrow" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="9 7 17 7 17 15" />
            </svg>
          </span>
        )}
      </div>

      <p className="zac-summary">{agent.summary}</p>

      {tags.length > 0 && (
        <div className="zac-tags">
          {tags.map((t) => (
            <span key={t} className="zac-tag">{t}</span>
          ))}
        </div>
      )}

      <div className="zac-card-foot">
        <div className="zac-foot-left">
          <div className="zac-cat-pill">
            <CategoryDot category={agent.category} />
            {agent.category}
          </div>
          <span className={`zac-status ${active ? "active" : "idle"}`}>
            <span className="zac-status-dot" />
            <span>{active ? "LIVE" : "IDLE"}</span>
          </span>
        </div>
        <div className="zac-foot-right">
          {age && <span className="zac-age">↻ {age}</span>}
          {agent.price && <span className="zac-price">{agent.price}</span>}
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return (
      <article className={className} style={style}>
        {inner}
      </article>
    );
  }

  return (
    <Link
      href={`/registry/${encodeURIComponent(agent.id)}`}
      className={className}
      style={style}
    >
      {inner}
    </Link>
  );
}

export function AgentCardStyles(): React.ReactElement {
  return (
    <style>{`
      .zac-card {
        --icon-accent: #818cf8;
        position: relative;
        background: rgba(8,11,22,0.55);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 16px 18px 14px;
        display: flex; flex-direction: column; gap: 12px;
        text-decoration: none;
        font-family: 'Space Grotesk', sans-serif;
        box-sizing: border-box;
        height: 100%;
        transition: border-color 0.18s ease, background 0.18s ease;
      }
      .zac-card:hover {
        border-color: rgba(255,255,255,0.14);
        background: rgba(10,13,24,0.7);
      }
      .zac-card-grid,
      .zac-card-glow,
      .zac-card-ring,
      .zac-icon-shine { display: none; }

      .zac-card--static { cursor: default; }

      .zac-card-top {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center; gap: 12px;
      }
      .zac-icon {
        width: 38px; height: 38px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        color: var(--icon-accent);
        background: color-mix(in oklab, var(--icon-accent) 10%, rgba(255,255,255,0.02));
        border: 1px solid color-mix(in oklab, var(--icon-accent) 22%, transparent);
        flex-shrink: 0;
      }

      .zac-meta { min-width: 0; }
      .zac-name-row {
        display: flex; align-items: center; gap: 8px; min-width: 0;
      }
      .zac-name {
        font-family: 'Chakra Petch', 'Space Grotesk', sans-serif;
        font-size: 15.5px; font-weight: 700;
        color: #fff;
        letter-spacing: 0.005em;
        line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        text-transform: uppercase;
        min-width: 0;
      }
      .zac-type-tag {
        flex-shrink: 0;
        font-size: 8.5px; font-weight: 600;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        letter-spacing: 0.14em;
        padding: 3px 6px;
        border-radius: 4px;
        line-height: 1;
        border: 1px solid;
      }
      .zac-type-tag.agent {
        color: rgba(165,180,252,0.85);
        background: rgba(99,102,241,0.07);
        border-color: rgba(99,102,241,0.2);
      }
      .zac-type-tag.service {
        color: rgba(216,180,254,0.85);
        background: rgba(168,85,247,0.07);
        border-color: rgba(168,85,247,0.2);
      }
      .zac-owner {
        font-size: 11px; color: rgba(255,255,255,0.42);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        margin-top: 3px; letter-spacing: 0.02em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .zac-arrow {
        flex-shrink: 0;
        width: 26px; height: 26px;
        display: flex; align-items: center; justify-content: center;
        color: rgba(255,255,255,0.28);
        transition: color 0.18s ease;
      }
      .zac-card:hover .zac-arrow { color: rgba(255,255,255,0.7); }

      .zac-status {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 9.5px; font-family: 'JetBrains Mono', ui-monospace, monospace;
        letter-spacing: 0.14em; font-weight: 600;
        padding: 4px 7px;
        border-radius: 5px; flex-shrink: 0;
        border: 1px solid;
      }
      .zac-status.active {
        color: #34d399;
        background: rgba(16,185,129,0.08);
        border-color: rgba(16,185,129,0.25);
      }
      .zac-status.idle {
        color: rgba(255,255,255,0.45);
        background: rgba(255,255,255,0.03);
        border-color: rgba(255,255,255,0.1);
      }
      .zac-status-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
      }
      .zac-status.active .zac-status-dot { animation: zacDotPulse 2.4s ease-in-out infinite; }
      @keyframes zacDotPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.7); opacity: 0.55; }
      }

      .zac-summary {
        margin: 0; font-size: 13px; line-height: 1.55;
        color: rgba(255,255,255,0.62);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 40px;
      }

      .zac-tags {
        display: flex; flex-wrap: wrap; gap: 5px;
      }
      .zac-tag {
        font-size: 10.5px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        color: rgba(255,255,255,0.55);
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        padding: 3px 7px;
        border-radius: 4px;
        letter-spacing: 0.02em;
        white-space: nowrap;
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .zac-card-foot {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .zac-foot-left {
        display: inline-flex; align-items: center; gap: 8px;
        min-width: 0;
      }
      .zac-cat-pill {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 500;
        padding: 3px 9px; border-radius: 5px;
        color: rgba(255,255,255,0.65);
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        letter-spacing: 0.04em;
        white-space: nowrap;
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .zac-cat-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
      .zac-foot-right {
        display: flex; align-items: center; gap: 10px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        flex-shrink: 0;
      }
      .zac-age {
        font-size: 10.5px; color: rgba(255,255,255,0.36);
        letter-spacing: 0.04em;
      }
      .zac-price {
        font-size: 11.5px; color: #34d399;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .zac-card { padding: 14px 14px 12px; gap: 10px; border-radius: 14px; }
        .zac-name { font-size: 15px; }
        .zac-summary { font-size: 12.5px; min-height: 36px; }
        .zac-icon { width: 38px; height: 38px; border-radius: 10px; }
        .zac-status { padding: 3px 7px; }
        .zac-cat-pill { font-size: 10.5px; padding: 3px 8px; max-width: 110px; }
        .zac-age { font-size: 10px; }
        .zac-price { font-size: 11px; }
        .zac-tag { font-size: 10px; max-width: 110px; }
        .zac-arrow { width: 26px; height: 26px; }
      }
    `}</style>
  );
}
