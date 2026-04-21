"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  listEntities,
  searchAgents,
  getCategories,
  type EntityRecord,
  type SearchResult,
} from "../lib/api/agentdns";

type DisplayAgent = EntityRecord | SearchResult;

function entityId(a: DisplayAgent): string {
  return "entity_id" in a ? a.entity_id : a.agent_id;
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  data: "Data", database: "Data", storage: "Data", extraction: "Extraction", extract: "Extraction",
  ai: "AI", llm: "AI", ml: "AI", model: "AI", intelligence: "AI",
  analysis: "Analysis", analytics: "Analysis", scoring: "Scoring", score: "Scoring", ranking: "Scoring",
  integration: "Integration", api: "Integration", webhook: "Integration", connect: "Integration",
  automation: "Automation", workflow: "Automation", pipeline: "Automation",
  verification: "Verification", verify: "Verification", validate: "Verification", compliance: "Verification",
  parsing: "Parsing", parse: "Parsing", nlp: "NLP", language: "NLP", text: "NLP",
  orchestration: "Orchestration", agent: "Orchestration", multi: "Orchestration",
  hiring: "Fair Hiring", recruitment: "Fair Hiring", resume: "Fair Hiring", candidate: "Fair Hiring",
  bias: "Bias Detection", fairness: "Bias Detection", equity: "Bias Detection",
  search: "Search", rag: "Search", retrieval: "Search",
  security: "Security", auth: "Security",
  communication: "Communication", email: "Communication", chat: "Communication",
  finance: "Finance", payment: "Finance", crypto: "Finance",
};

import { COLOR_MAP } from "../lib/categoryTheme";

function resolveIconCategory(category: string | null, tags: string[] | null): string {
  if (category && COLOR_MAP[category]) return category;
  if (!tags || tags.length === 0) return category || "AI";
  for (const tag of tags) {
    const lower = tag.toLowerCase().replace(/[^a-z]/g, "");
    for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lower.includes(keyword)) return cat;
    }
  }
  return category || "AI";
}

function CategoryIcon({ category, size = 22 }: { category: string; size?: number }): React.ReactElement {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.5,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const
  };

  switch (category) {
    case "Extraction":
    case "Data":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "AI":
      return (
        <svg {...props}>
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14Z" />
        </svg>
      );
    case "Analysis":
    case "Scoring":
      return (
        <svg {...props}>
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="m7 16 4-8 4 5 4-7" />
        </svg>
      );
    case "Integration":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <path d="M6 6h.01M6 18h.01" />
        </svg>
      );
    case "Automation":
      return (
        <svg {...props}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "Verification":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "Parsing":
    case "NLP":
      return (
        <svg {...props}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "Orchestration":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
          <circle cx="4" cy="6" r="2" />
          <circle cx="20" cy="6" r="2" />
          <circle cx="4" cy="18" r="2" />
          <circle cx="20" cy="18" r="2" />
          <path d="M6 6h4M14 6h4M6 18h4M14 18h4M12 10v4" />
        </svg>
      );
    case "Fair Hiring":
    case "Bias Detection":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "Security":
      return (
        <svg {...props}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "Communication":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "Finance":
      return (
        <svg {...props}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
  }
}

export function RegistryPage(): React.ReactElement {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [agents, setAgents] = useState<DisplayAgent[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(cats => {
      setCategories(["All", ...cats]);
    }).catch(() => {});
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

        if (debouncedQuery) {
          const res = await searchAgents(debouncedQuery, {
            category: catParam,
            entity_type: "agent",
            max_results: 200,
          }, signal);
          setAgents(res.results);
        } else {
          const res = await listEntities({
            type: "agent",
            category: catParam,
            limit: 200,
          }, signal);
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
  }, [debouncedQuery, selectedCategory, retryKey]);

  const filteredAgents = agents.filter((agent) => {
    const agentStatus = (agent.status || "active").toUpperCase();
    const statusMap: Record<string, string> = { "All": "All", "Active": "ACTIVE", "Inactive": "INACTIVE" };
    return statusFilter === "All" || agentStatus === statusMap[statusFilter];
  });

  return (
    <div style={{ background: "#080f1a", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pg-input { background: #0d1522; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; font-size: 15px; width: 100%; padding: 12px 40px; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color .15s ease; }
        .pg-input::placeholder { color: rgba(255,255,255,.3); }
        .pg-input:focus { border-color: #5b7cfa; }

        .pg-select { background: #0d1522; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; font-size: 14px; padding: 0 36px 0 16px; outline: none; font-family: inherit; transition: border-color .15s ease; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; cursor: pointer; height: 45px; }
        .pg-select:focus { border-color: #5b7cfa; }

        .pg-pill { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-family: inherit; transition: all .15s ease; }

        .reg-card { background: #0c1421; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; transition: all .15s ease; cursor: pointer; }
        .reg-card:hover { border-color: rgba(255,255,255,0.12); background: #111b2b; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

        .pg-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; background: #152033; color: #94a3b8; border: 1px solid rgba(255,255,255,0.04); transition: background .15s; }
        .reg-card:hover .pg-tag { background: #1e2c44; color: #cbd5e1; }
        .pg-tag.a2a { background: rgba(91,124,250,0.15); color: #5b7cfa; border: none; }

        .reg-btn { width: 100%; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s ease; background: #152033; border: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; margin-top: auto; }
        .reg-card:hover .reg-btn { background: #5b7cfa; border-color: #5b7cfa; color: #fff; }

        .pg-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: none; }
      `}</style>

      <Navbar />

      <div className="page-padd" style={{ padding: "32px 0 80px" }}>
        <div className="page-container">

          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              Agent Registry
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(226,232,240,.5)", margin: 0 }}>
              Discover and connect with {agents.length} agents on the ZyndAI network
            </p>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(226,232,240,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input className="pg-input" type="text" placeholder="Search agents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "rgba(226,232,240,.3)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pg-select"
            >
              <option value="All">All Agents</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Pills */}
          <div className="hide-scrollbar" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "20px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="pg-pill" style={{
                  background: active ? "#5b7cfa" : "#0d1522",
                  border: active ? "1px solid #5b7cfa" : "1px solid rgba(255,255,255,0.1)",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
                }}>
                  {cat}
                </button>
              );
            })}
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ width: "28px", height: "28px", border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <p style={{ marginTop: "14px", color: "rgba(226,232,240,.3)", fontSize: "13px" }}>Loading agents...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "60px 20px", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", background: "#0d1625" }}>
              <p style={{ fontSize: "14px", color: "rgba(239,68,68,0.7)", margin: "0 0 14px" }}>{error}</p>
              <button onClick={() => setRetryKey(k => k + 1)} style={{ padding: "8px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#e2e8f0", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
              {filteredAgents.map(agent => {
                const cat = resolveIconCategory(agent.category, agent.tags);
                const themeColor = COLOR_MAP[cat] || "#5b7cfa";
                const id = entityId(agent);

                return (
                <div key={id} className="reg-card" onClick={() => router.push(`/registry/${id}`)}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div className="pg-icon" style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}>
                      <CategoryIcon category={cat} size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px", color: "#f8fafc", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {agent.name}
                      </h3>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{agent.category || "General"}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 20px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                    {agent.summary || "No description provided"}
                  </p>

                  {agent.tags && agent.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                      {agent.tags.slice(0, 5).map(tag => (
                        <span key={tag} className={`pg-tag${tag.toLowerCase() === "a2a" ? " a2a" : ""}`}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <button className="reg-btn" onClick={e => { e.stopPropagation(); router.push(`/registry/${id}`); }}>
                    View Agent
                  </button>
                </div>
              )})}
            </div>
          )}

          {!loading && !error && filteredAgents.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(226,232,240,.25)", fontSize: "14px" }}>
              No agents match your search.
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
