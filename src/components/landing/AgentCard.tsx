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

export function AgentCard({ agent }: { agent: FeaturedAgent }): React.ReactElement {
  const active = isAgentActive(agent.status);
  const age = relativeAge(agent.lastHeartbeat);
  const iconColor = dotColorFor(agent.category);
  return (
    <Link
      href={`/registry/${encodeURIComponent(agent.id)}`}
      className="zac-card"
      style={{ ["--icon-accent" as string]: iconColor }}
    >
      <span className="zac-card-grid" aria-hidden />
      <span className="zac-card-glow" aria-hidden />

      <div className="zac-card-top">
        <div className="zac-icon">
          <CategoryGlyph category={agent.category} size={18} />
        </div>
        <div className="zac-meta">
          <div className="zac-name">{agent.name}</div>
          <div className="zac-owner">{agent.owner}</div>
        </div>
        <div className="zac-chips">
          <span className={`zac-type ${agent.entityType === "service" ? "service" : "agent"}`}>
            <span className="zac-type-dot" aria-hidden />
            {agent.entityType.toUpperCase()}
          </span>
          <span className={`zac-status ${active ? "active" : "idle"}`}>
            <span className="zac-status-dot" />
            <span>{active ? "LIVE" : "IDLE"}</span>
          </span>
        </div>
      </div>

      <p className="zac-summary">{agent.summary}</p>

      <div className="zac-card-foot">
        <div className="zac-cat-pill">
          <CategoryDot category={agent.category} />
          {agent.category}
        </div>
        <div className="zac-foot-right">
          {age && <span className="zac-age">↻ {age}</span>}
          {agent.price && <span className="zac-price">{agent.price}</span>}
        </div>
      </div>
    </Link>
  );
}

export function AgentCardStyles(): React.ReactElement {
  return (
    <style>{`
      .zac-card {
        position: relative;
        background:
          linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%),
          rgba(8,11,22,0.55);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 16px 18px 14px;
        display: flex; flex-direction: column; gap: 10px;
        text-decoration: none;
        isolation: isolate;
        overflow: hidden;
        transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.3, 1),
                    border-color 0.28s ease,
                    background 0.28s ease;
        will-change: transform;
        font-family: 'Space Grotesk', sans-serif;
        box-sizing: border-box;
        height: 100%;
      }
      .zac-card-grid {
        position: absolute; inset: 0; pointer-events: none; z-index: -1;
        background:
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/22px 22px,
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/22px 22px;
        mask-image: radial-gradient(80% 80% at 100% 0%, #000, transparent 80%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .zac-card-glow {
        position: absolute; inset: -40%; pointer-events: none; z-index: -1;
        background: radial-gradient(35% 50% at 80% 0%, rgba(99,102,241,0.22), transparent 70%);
        filter: blur(20px); opacity: 0;
        transition: opacity 0.3s ease;
      }
      .zac-card:hover {
        transform: translateY(-3px);
        border-color: rgba(255,255,255,0.14);
        background:
          linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%),
          rgba(10,13,24,0.7);
      }
      .zac-card:hover .zac-card-grid { opacity: 1; }
      .zac-card:hover .zac-card-glow { opacity: 0.7; }

      .zac-card-top { display: flex; align-items: center; gap: 12px; }
      .zac-icon {
        --icon-accent: #818cf8;
        width: 38px; height: 38px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: var(--icon-accent);
        background: color-mix(in oklab, var(--icon-accent) 12%, rgba(255,255,255,0.02));
        border: 1px solid color-mix(in oklab, var(--icon-accent) 24%, transparent);
        flex-shrink: 0;
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1),
                    background 0.3s ease, border-color 0.3s ease;
      }
      .zac-card:hover .zac-icon {
        transform: scale(1.04);
        background: color-mix(in oklab, var(--icon-accent) 20%, rgba(255,255,255,0.02));
        border-color: color-mix(in oklab, var(--icon-accent) 40%, transparent);
      }

      .zac-meta { flex: 1; min-width: 0; }
      .zac-name {
        font-family: 'Chakra Petch', 'Space Grotesk', sans-serif;
        font-size: 16px; font-weight: 700;
        color: #fff; letter-spacing: 0.005em;
        line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        text-transform: uppercase;
      }
      .zac-owner {
        font-size: 11px; color: rgba(255,255,255,0.42);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        margin-top: 2px; letter-spacing: 0.02em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .zac-chips {
        display: inline-flex; align-items: center; gap: 8px;
        flex-shrink: 0;
      }
      .zac-type {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 9.5px; font-family: 'JetBrains Mono', ui-monospace, monospace;
        letter-spacing: 0.14em; font-weight: 500;
        color: rgba(255,255,255,0.42);
      }
      .zac-type-dot { width: 4px; height: 4px; border-radius: 50%; }
      .zac-type.agent .zac-type-dot { background: #818cf8; }
      .zac-type.service .zac-type-dot { background: #c084fc; }

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
        margin: 0; font-size: 13px; line-height: 1.5;
        color: rgba(255,255,255,0.55);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 39px;
      }

      .zac-card-foot {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.04);
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
      }
      .zac-cat-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
      .zac-foot-right {
        display: flex; align-items: center; gap: 10px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      .zac-age {
        font-size: 10.5px; color: rgba(255,255,255,0.32);
        letter-spacing: 0.04em;
      }
      .zac-price {
        font-size: 11.5px; color: #34d399;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .zac-card { padding: 14px 14px 12px; gap: 8px; }
        .zac-name { font-size: 15px; }
        .zac-summary { font-size: 12.5px; min-height: 36px; }
        .zac-icon { width: 34px; height: 34px; border-radius: 9px; }
        .zac-status { padding: 3px 6px; }
        .zac-cat-pill { font-size: 10.5px; padding: 3px 8px; }
        .zac-age { font-size: 10px; }
        .zac-price { font-size: 11px; }
        .zac-chips { gap: 6px; }
        .zac-type { font-size: 9px; }
      }
    `}</style>
  );
}
