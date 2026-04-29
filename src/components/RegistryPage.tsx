"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  listEntities,
  searchAgents,
  getCategories,
  type EntityRecord,
  type SearchResult,
} from "../lib/api/agentdns";
import { AgentCard, AgentCardStyles, dotColorFor } from "./landing/AgentCard";
import { entityToFeatured, type FeaturedAgent } from "@/lib/landing/featuredAgents";

type DisplayAgent = EntityRecord | SearchResult;

export function RegistryPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"all" | "agent" | "service">("all");
  const [agents, setAgents] = useState<DisplayAgent[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then((cats) => setCategories(["All", ...cats]))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        setError(null);
        setLoading(true);
        const catParam = selectedCategory !== "All" ? selectedCategory : undefined;
        const typeParam = typeFilter !== "all" ? typeFilter : undefined;

        if (debouncedQuery) {
          const res = await searchAgents(
            debouncedQuery,
            { category: catParam, entity_type: typeParam, max_results: 200 },
            signal,
          );
          setAgents(res.results);
        } else {
          const res = await listEntities(
            { type: typeParam, category: catParam, limit: 200 },
            signal,
          );
          setAgents(res.entities);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Registry fetch failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load agents");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery, selectedCategory, typeFilter, retryKey]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const agentStatus = (agent.status || "active").toUpperCase();
      if (statusFilter === "All") return true;
      if (statusFilter === "Active") return agentStatus === "ACTIVE";
      if (statusFilter === "Inactive") return agentStatus !== "ACTIVE";
      return true;
    });
  }, [agents, statusFilter]);

  const featured: FeaturedAgent[] = useMemo(
    () => filteredAgents.map(entityToFeatured),
    [filteredAgents],
  );

  const counts = useMemo(() => {
    const a = agents.filter((x) => (x.entity_type || "agent") === "agent").length;
    const s = agents.filter((x) => x.entity_type === "service").length;
    return { agents: a, services: s };
  }, [agents]);

  return (
    <div className="reg-page">
      <AgentCardStyles />
      <style>{`
        .reg-page {
          background: #060912; min-height: 100vh; color: #e2e8f0;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
        }
        .reg-page::before {
          content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(50% 40% at 50% 0%, rgba(99,102,241,0.07), transparent 60%),
            radial-gradient(60% 50% at 100% 100%, rgba(192,132,252,0.04), transparent 60%);
        }
        .reg-wrap {
          position: relative; z-index: 1;
          max-width: 1320px; margin: 0 auto;
          padding: 0 28px 72px;
        }

        @keyframes regSpin { to { transform: rotate(360deg); } }
        @keyframes regPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.7); opacity: 0.55; }
        }

        .reg-hero { margin: 0 0 32px; }
        .reg-title-row {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .reg-title {
          font-size: clamp(36px, 5vw, 56px) !important;
          line-height: 1.05;
          color: #fff; margin: 0;
        }
        .reg-stats {
          display: flex; align-items: center; gap: 14px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px; color: rgba(255,255,255,0.55);
          letter-spacing: 0.04em;
          flex-wrap: wrap;
        }
        .reg-stat {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .reg-stat strong { color: #fff; font-weight: 600; }
        .reg-stat-dot { width: 6px; height: 6px; border-radius: 50%; }
        .reg-stat-dot.live { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.6); animation: regPulse 2.4s ease-in-out infinite; }
        .reg-stat-dot.idle { background: #818cf8; }
        .reg-stat-dot.svc  { background: #c084fc; }

        /* Filter strip */
        .reg-controls {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          margin-bottom: 14px;
        }
        .reg-search {
          position: relative;
        }
        .reg-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.32); pointer-events: none;
        }
        .reg-input {
          width: 100%; box-sizing: border-box;
          background: rgba(8,11,22,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f8fafc; font-size: 15px;
          padding: 12px 40px;
          outline: none; font-family: inherit;
          transition: border-color 0.18s ease, background 0.18s ease;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.3); }
        .reg-input:focus { border-color: rgba(99,102,241,0.55); background: rgba(10,13,24,0.85); }
        .reg-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          display: flex; color: rgba(255,255,255,0.32);
        }
        .reg-clear:hover { color: #fff; }

        .reg-select {
          background: rgba(8,11,22,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f8fafc; font-size: 13px;
          font-family: inherit;
          padding: 0 36px 0 14px; height: 45px;
          outline: none; cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          letter-spacing: 0.02em;
          transition: border-color 0.18s ease;
        }
        .reg-select:focus { border-color: rgba(99,102,241,0.55); }

        /* Category pill row */
        .reg-pills {
          display: flex; gap: 8px;
          overflow-x: auto;
          padding-bottom: 16px; margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          scrollbar-width: none;
        }
        .reg-pills::-webkit-scrollbar { display: none; }
        .reg-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.7);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: 0.02em;
          white-space: nowrap; flex-shrink: 0;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .reg-pill:hover { color: #fff; border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); }
        .reg-pill.active {
          background: rgba(99,102,241,0.14);
          border-color: rgba(99,102,241,0.45);
          color: #fff;
          box-shadow: 0 0 24px rgba(99,102,241,0.2);
        }
        .reg-pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* Grid */
        .reg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        /* Loading / error / empty */
        .reg-loading {
          text-align: center; padding: 80px 20px;
        }
        .reg-spin {
          width: 28px; height: 28px;
          border: 2px solid rgba(255,255,255,0.08);
          border-top: 2px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          animation: regSpin 1s linear infinite;
          margin: 0 auto;
        }
        .reg-loading p { margin-top: 14px; color: rgba(255,255,255,0.32); font-size: 13px; font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.04em; }

        .reg-error {
          text-align: center; padding: 60px 20px;
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 12px;
          background: rgba(239,68,68,0.04);
        }
        .reg-error p { font-size: 14px; color: rgba(248,113,113,0.85); margin: 0 0 14px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .reg-retry {
          padding: 9px 22px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: all 0.18s ease;
        }
        .reg-retry:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); }

        .reg-empty {
          text-align: center; padding: 100px 20px;
          color: rgba(255,255,255,0.32); font-size: 14px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: 0.04em;
        }

        @media (max-width: 768px) {
          .reg-wrap { padding: 18px 16px 56px; }
          .reg-controls { grid-template-columns: 1fr; }
          .reg-stats { font-size: 11px; }
        }
      `}</style>

      <Navbar />

      <div className="reg-wrap">
        <div className="reg-hero">
          <div className="reg-title-row">
            <h1 className="reg-title">Registry</h1>

            <div className="reg-stats">
              <span className="reg-stat">
                <span className="reg-stat-dot live" />
                <strong>{filteredAgents.length}</strong> visible
              </span>
              <span className="reg-stat">
                <span className="reg-stat-dot idle" />
                <strong>{counts.agents}</strong> agents
              </span>
              <span className="reg-stat">
                <span className="reg-stat-dot svc" />
                <strong>{counts.services}</strong> services
              </span>
            </div>
          </div>
        </div>

        <div className="reg-controls">
          <div className="reg-search">
            <svg
              className="reg-search-icon"
              width="16" height="16"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="reg-input"
              type="text"
              placeholder="Search agents and services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="reg-clear" aria-label="Clear">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "agent" | "service")}
            className="reg-select"
          >
            <option value="all">All Types</option>
            <option value="agent">Agents</option>
            <option value="service">Services</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="reg-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Idle</option>
          </select>
        </div>

        <div className="reg-pills">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            const dot = cat === "All" ? "#818cf8" : dotColorFor(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`reg-pill ${active ? "active" : ""}`}
              >
                <span className="reg-pill-dot" style={{ background: dot }} />
                {cat}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="reg-loading">
            <div className="reg-spin" />
            <p>LOADING REGISTRY…</p>
          </div>
        )}

        {error && (
          <div className="reg-error">
            <p>{error}</p>
            <button onClick={() => setRetryKey((k) => k + 1)} className="reg-retry">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="reg-grid">
            {featured.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        )}

        {!loading && !error && featured.length === 0 && (
          <div className="reg-empty">No agents match your search.</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
