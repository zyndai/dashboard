"use client";

import { useMemo, useState } from "react";
import { useFeaturedAgents, uniqueCategories, type FeaturedAgent } from "@/lib/landing/featuredAgents";
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
  const { agents } = useFeaturedAgents(120);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => uniqueCategories(agents).slice(0, 10), [agents]);

  const filtered = useMemo(
    () => (activeCategory ? agents.filter((a) => a.category === activeCategory) : agents),
    [agents, activeCategory],
  );

  const { agentRow, serviceRow } = useMemo(() => {
    const liveAgents = filtered.filter((x) => x.entityType === "agent");
    const liveServices = filtered.filter((x) => x.entityType === "service");
    return {
      agentRow: padRow(liveAgents),
      serviceRow: padRow(liveServices),
    };
  }, [filtered]);

  if (agents.length === 0) return null;
  const noResults = agentRow.length === 0 && serviceRow.length === 0;

  // When a category filter is active and the result set is small, switch
  // from a looping marquee to a static centered grid — repeating the same
  // 1-3 cards in an animated loop reads as broken, not "live".
  const STATIC_GRID_THRESHOLD = 6;
  const useStaticGrid = activeCategory !== null && filtered.length > 0 && filtered.length < STATIC_GRID_THRESHOLD;

  // Visual marquee speed is `pixels per duration`. Scaling duration linearly
  // with item count keeps on-screen px/s constant — no minimum, otherwise
  // smaller (filtered) rows scroll noticeably slower than the full set.
  const SECONDS_PER_CARD = 4;
  const agentDur = `${Math.max(1, agentRow.length) * SECONDS_PER_CARD}s`;
  const serviceDur = `${Math.max(1, serviceRow.length) * SECONDS_PER_CARD}s`;

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
          cursor: pointer;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .adm-cat-tab:hover {
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.05);
        }
        .adm-cat-tab.active {
          border-color: rgba(99,102,241,0.55);
          color: #fff;
          background: rgba(99,102,241,0.12);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.25) inset;
        }
        .adm-cat-tab.all {
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.85);
        }
        .adm-cat-tab.all.active {
          border-color: rgba(99,102,241,0.55);
          background: rgba(99,102,241,0.12);
        }
        .adm-cat-dot-tab { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }

        .adm-empty {
          text-align: center;
          padding: 36px 20px;
          color: rgba(255,255,255,0.45);
          font-size: 13.5px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: 0.02em;
        }

        .adm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 360px));
          gap: 16px;
          justify-content: center;
          padding: 12px 8px;
        }
        @media (max-width: 640px) {
          .adm-grid { grid-template-columns: 1fr; gap: 12px; padding: 8px; }
        }

        .adm-marquee-wrap {
          position: relative;
          overflow: hidden;
          padding: 6px 0;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%);
        }

        .adm-row { display: flex; width: max-content; gap: 16px; padding: 8px 0; }
        .adm-row.row-a { animation: admScrollA var(--row-dur, 120s) linear infinite; }
        .adm-row.row-b { animation: admScrollB var(--row-dur, 200s) linear infinite; }
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
            margin: 16px -18px 8px;
            padding: 4px 18px;
            gap: 8px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            justify-content: flex-start;
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x proximity;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%);
          }
          .adm-cat-row::-webkit-scrollbar { display: none; }
          .adm-cat-tab { flex: 0 0 auto; scroll-snap-align: start; }
          .adm-cat-tab {
            font-size: 10.5px; padding: 4px 9px;
          }

          .adm-row { gap: 12px; }

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
            <button
              type="button"
              className={`adm-cat-tab all${activeCategory === null ? " active" : ""}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                className={`adm-cat-tab${activeCategory === c ? " active" : ""}`}
                onClick={() => setActiveCategory((prev) => (prev === c ? null : c))}
              >
                <CategoryDot category={c} />
                {c}
              </button>
            ))}
          </div>
        </div>

        {noResults ? (
          <div className="adm-empty">No entities in {activeCategory} yet.</div>
        ) : useStaticGrid ? (
          <div className="adm-grid">
            {filtered.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        ) : (
          <div className="adm-marquee-wrap">
            {agentRow.length > 0 && (
              <div
                className="adm-row row-a"
                style={{ ["--row-dur" as string]: agentDur }}
              >
                {[...agentRow, ...agentRow].map((a, i) => (
                  <div key={`a-${a.id}-${i}`} className="adm-cell">
                    <AgentCard agent={a} />
                  </div>
                ))}
              </div>
            )}
            {serviceRow.length > 0 && (
              <div
                className="adm-row row-b"
                style={{ ["--row-dur" as string]: serviceDur }}
              >
                {[...serviceRow, ...serviceRow].map((a, i) => (
                  <div key={`b-${a.id}-${i}`} className="adm-cell">
                    <AgentCard agent={a} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
