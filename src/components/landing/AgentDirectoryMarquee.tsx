"use client";

import { useMemo } from "react";
import { useFeaturedAgents, uniqueCategories, FALLBACK_AGENTS, type FeaturedAgent } from "@/lib/landing/featuredAgents";
import { AgentCard, AgentCardStyles, dotColorFor } from "./AgentCard";

function CategoryDot({ category }: { category: string }): React.ReactElement {
  const c = dotColorFor(category);
  return <span className="adm-cat-dot-tab" style={{ background: c }} aria-hidden />;
}

function padRow(arr: FeaturedAgent[], min = 6): FeaturedAgent[] {
  if (arr.length === 0 || arr.length >= min) return arr;
  const factor = Math.ceil(min / arr.length);
  const out: FeaturedAgent[] = [];
  for (let i = 0; i < factor; i++) out.push(...arr);
  return out;
}

export function AgentDirectoryMarquee(): React.ReactElement | null {
  const { agents } = useFeaturedAgents(28);
  const categories = useMemo(() => uniqueCategories(agents).slice(0, 8), [agents]);

  const { agentRow, serviceRow } = useMemo(() => {
    const liveAgents = agents.filter((x) => x.entityType === "agent");
    const liveServices = agents.filter((x) => x.entityType === "service");
    return {
      // Row 1: real agents from the registry, fall back to demos until we
      // have agent-type entities live (services keep using real data only).
      agentRow: padRow(liveAgents.length > 0 ? liveAgents : FALLBACK_AGENTS),
      serviceRow: padRow(liveServices),
    };
  }, [agents]);

  return (
    <section className="adm">
      <AgentCardStyles />
      <style>{`
        .adm {
          padding: 100px 0;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
        }
        .adm::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.08), transparent 60%),
            radial-gradient(70% 60% at 100% 100%, rgba(192,132,252,0.05), transparent 60%);
          z-index: 0;
        }
        .adm-inner { position: relative; max-width: 1320px; margin: 0 auto; padding: 0 28px; z-index: 1; }

        .adm-header { text-align: center; margin-bottom: 26px; }
        .adm-eyebrow {
          display: inline-block;
          font-size: 13px; font-weight: 400;
          letter-spacing: 0.05em; text-transform: uppercase;
          font-style: italic; font-family: ui-monospace, monospace;
          color: #6366f1; margin-bottom: 16px;
        }

        .adm-heading {
          font-size: clamp(28px, 3.2vw, 42px);
          line-height: 1.05; color: #fff;
          margin: 0 auto 12px;
          max-width: 26ch;
        }
        .adm-heading-em {
          font-family: 'JetBrains Mono', ui-monospace, monospace !important;
          font-style: italic; font-weight: 400 !important;
          font-size: 0.78em; letter-spacing: 0 !important;
          color: #c084fc;
          padding: 0 0.18em;
          background: linear-gradient(120deg, rgba(192,132,252,0.16), rgba(99,102,241,0.1));
          border-radius: 6px;
          text-transform: lowercase !important;
          vertical-align: 0.06em;
        }
        .adm-body {
          font-size: 14.5px; line-height: 1.55;
          color: rgba(255,255,255,0.5);
          max-width: 60ch; margin: 0 auto;
          text-wrap: balance;
        }

        .adm-cat-row {
          display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
          margin: 18px auto 4px; max-width: 920px;
        }
        .adm-cat-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 11px; border-radius: 6px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.65);
          font-size: 11px; font-weight: 500;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: 0.04em;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .adm-cat-tab:hover {
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.05);
        }
        .adm-cat-dot-tab { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }

        .adm-marquee-wrap {
          position: relative;
          overflow: hidden;
          padding: 6px 0;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
        }

        .adm-row { display: flex; width: max-content; gap: 16px; padding: 8px 0; }
        .adm-row.row-a { animation: admScrollA 90s linear infinite; }
        .adm-row.row-b { animation: admScrollB 110s linear infinite; }
        .adm-marquee-wrap:hover .adm-row { animation-play-state: paused; }
        @keyframes admScrollA {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes admScrollB {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }

        .adm-cell { flex: 0 0 360px; }

        @media (max-width: 768px) {
          .adm { padding: 80px 0 60px; }
          .adm-inner { padding: 0 18px; }

          .adm-heading {
            font-size: clamp(24px, 7vw, 30px);
            line-height: 1.15;
            max-width: 100%;
          }
          .adm-heading-em {
            display: inline-block;
            margin: 0 0.15em;
            font-size: 0.7em;
          }
          .adm-body {
            font-size: 13.5px;
            max-width: 36ch;
          }
          .adm-cat-row {
            margin: 16px auto 8px;
            gap: 5px;
          }
          .adm-cat-tab {
            font-size: 10.5px; padding: 4px 9px;
          }

          .adm-row { gap: 12px; }
          .adm-row.row-a { animation-duration: 75s; }
          .adm-row.row-b { animation-duration: 90s; }

          .adm-cell { flex-basis: 78vw; max-width: 300px; }

          .adm-marquee-wrap {
            -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%);
          }
        }
        @media (max-width: 480px) {
          .adm { padding: 64px 0 48px; }
          .adm-cell { flex-basis: 84vw; max-width: 320px; }
        }
      `}</style>

      <div className="adm-inner">
        <div className="adm-header">
          <div className="adm-eyebrow">// AGENT DIRECTORY</div>

          <h2 className="adm-heading">
            One network — every <span className="adm-heading-em">agent &amp; service</span> you need
          </h2>
          <p className="adm-body">
            Live from the Zynd registry. Agents and services — discoverable, callable, and paid per request across {categories.length || 12} categories of work.
          </p>

          <div className="adm-cat-row">
            {categories.map((c) => (
              <span key={c} className="adm-cat-tab">
                <CategoryDot category={c} />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="adm-marquee-wrap">
          <div className="adm-row row-a">
            {[...agentRow, ...agentRow].map((a, i) => (
              <div key={`a-${a.id}-${i}`} className="adm-cell">
                <AgentCard agent={a} interactive={false} />
              </div>
            ))}
          </div>
          {serviceRow.length > 0 && (
            <div className="adm-row row-b">
              {[...serviceRow, ...serviceRow].map((a, i) => (
                <div key={`b-${a.id}-${i}`} className="adm-cell">
                  <AgentCard agent={a} interactive={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
