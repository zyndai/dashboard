"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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

type DisplayService = EntityRecord | SearchResult;

function serviceId(s: DisplayService): string {
  return "entity_id" in s ? s.entity_id : s.agent_id;
}

import { COLOR_MAP } from "../lib/categoryTheme";

const ICONS: Record<string, React.ReactElement> = {
  Discovery: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Payments: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Identity: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Communication: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  AI: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14Z"/></svg>,
  "Developer Tools": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Integration: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg>,
};

const DEFAULT_ICON = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>;

function getStatusConfig(status: string): { label: string; dot: string } {
  const s = status.toUpperCase();
  if (s === "ACTIVE" || s === "ONLINE") return { label: "Available", dot: "#4ade80" };
  if (s === "INACTIVE" || s === "OFFLINE") return { label: "Inactive", dot: "#ef4444" };
  return { label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), dot: "#94a3b8" };
}

function endpointPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + (u.search ? u.search : "");
  } catch {
    return url;
  }
}

export function ServicesPage(): React.ReactElement {
  const [services, setServices] = useState<DisplayService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const router = useRouter();
  const [backendCategories, setBackendCategories] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getCategories().then(cats => setBackendCategories(cats)).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadServices = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const catParam = category !== "All" ? category : undefined;

      if (debouncedSearch) {
        const res = await searchAgents(debouncedSearch, {
          entity_type: "service",
          category: catParam,
          max_results: 100,
        }, signal);
        setServices(res.results);
      } else {
        const res = await listEntities({
          type: "service",
          category: catParam,
          limit: 100,
        }, signal);
        setServices(res.entities);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    const controller = new AbortController();
    loadServices(controller.signal);
    return () => controller.abort();
  }, [loadServices]);

  const serviceCategories = useMemo(() => {
    const fromData = new Set(services.map(s => s.category).filter((c): c is string => !!c));
    const merged = new Set([...backendCategories, ...fromData]);
    return ["All", ...Array.from(merged).sort()];
  }, [services, backendCategories]);

  return (
    <div style={{ background: "#080f1a", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        .pg-input { background: #0d1522; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; font-size: 15px; width: 100%; padding: 12px 40px; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color .15s ease; }
        .pg-input::placeholder { color: rgba(255,255,255,.3); }
        .pg-input:focus { border-color: #5b7cfa; }
        .pg-pill { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-family: inherit; transition: all .15s ease; }

        .pg-card { background: #0c1421; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; transition: all .15s ease; }
        .pg-card:hover { border-color: rgba(255,255,255,0.12); background: #111b2b; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

        .pg-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; background: #152033; color: #94a3b8; border: 1px solid rgba(255,255,255,0.04); transition: background .15s; }
        .pg-card:hover .pg-tag { background: #1e2c44; color: #cbd5e1; }

        .pg-btn { width: 100%; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s ease; background: #152033; border: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; margin-top: auto; text-decoration: none; display: block; text-align: center; box-sizing: border-box; }
        .pg-card:hover .pg-btn { background: #5b7cfa; border-color: #5b7cfa; color: #fff; }

        .pg-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: none; }

        .pg-endpoint { display: flex; align-items: center; gap: 6px; background: #0a1220; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 10px; margin-bottom: 16px; overflow: hidden; }
        .pg-endpoint-path { font-size: 12px; font-family: ui-monospace, monospace; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pg-card:hover .pg-endpoint { border-color: rgba(255,255,255,0.09); background: #0d1728; }
        .pg-card:hover .pg-endpoint-path { color: #94a3b8; }

        .pg-skeleton { background: linear-gradient(90deg,#0c1421 25%,#111b2b 50%,#0c1421 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <Navbar />

      <div className="page-padd" style={{ padding: "32px 0 80px" }}>
        <div className="page-container">

          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              Services
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(226,232,240,.5)", margin: 0 }}>
              {loading ? "Loading\u2026" : `Browse ${services.length} services on the ZyndAI network`}
            </p>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(226,232,240,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input className="pg-input" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "rgba(226,232,240,.3)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Category Pills */}
          {!loading && serviceCategories.length > 1 && (
            <div className="hide-scrollbar" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "20px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {serviceCategories.map(cat => {
                const active = category === cat;
                return (
                  <button key={cat} onClick={() => setCategory(cat)} className="pg-pill" style={{
                    background: active ? "#5b7cfa" : "#0d1522",
                    border: active ? "1px solid #5b7cfa" : "1px solid rgba(255,255,255,0.1)",
                    color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
                  }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: "#0c1421", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
                  <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                    <div className="pg-skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="pg-skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
                      <div className="pg-skeleton" style={{ height: 12, width: "30%" }} />
                    </div>
                  </div>
                  <div className="pg-skeleton" style={{ height: 12, marginBottom: 6 }} />
                  <div className="pg-skeleton" style={{ height: 12, marginBottom: 6, width: "90%" }} />
                  <div className="pg-skeleton" style={{ height: 12, width: "70%", marginBottom: 20 }} />
                  <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                    {[40, 55, 45].map((w, j) => <div key={j} className="pg-skeleton" style={{ height: 24, width: w, borderRadius: 6 }} />)}
                  </div>
                  <div className="pg-skeleton" style={{ height: 36, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ color: "rgba(226,232,240,.4)", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
              <button
                onClick={() => { const c = new AbortController(); loadServices(c.signal); }}
                style={{ padding: "8px 20px", background: "#5b7cfa", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
              {services.map(service => {
                const st = getStatusConfig(service.status || "active");
                const themeColor = COLOR_MAP[service.category ?? ""] || "#5b7cfa";
                const icon = ICONS[service.category ?? ""] ?? DEFAULT_ICON;
                const epPath = service.service_endpoint ? endpointPath(service.service_endpoint) : null;

                return (
                  <div key={serviceId(service)} className="pg-card" style={{ cursor: "pointer" }} onClick={() => router.push(`/services/${serviceId(service)}`)}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div className="pg-icon" style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px", color: "#f8fafc", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {service.name}
                        </h3>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                          {st.label}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                      {service.summary ?? "\u2014"}
                    </p>

                    {epPath && (
                      <div className="pg-endpoint">
                        <span className="pg-endpoint-path">{epPath}</span>
                      </div>
                    )}

                    {service.tags && service.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                        {service.tags.slice(0, 5).map(tag => <span key={tag} className="pg-tag">{tag}</span>)}
                      </div>
                    )}

                    <button className="pg-btn" onClick={e => { e.stopPropagation(); router.push(`/services/${serviceId(service)}`); }}>
                      View Service
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && services.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(226,232,240,.25)", fontSize: "14px" }}>
              No services registered yet.
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
