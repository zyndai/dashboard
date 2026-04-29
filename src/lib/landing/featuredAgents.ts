import { useEffect, useState } from "react";
import type { EntityRecord, SearchResult } from "@/lib/api/agentdns";

export interface FeaturedAgent {
  id: string;
  name: string;
  category: string;
  tags: string[];
  summary: string;
  status: string;
  owner: string;
  price?: string;
  entityType: string;
  lastHeartbeat?: string;
}

interface LandingResponse {
  entities: EntityRecord[];
  count: number;
  source: string;
}

function titleCaseCategory(c: string): string {
  if (!c) return "General";
  return c
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function shortOwner(o: string | null | undefined): string {
  if (!o) return "@zynd";
  if (o.startsWith("zns:")) {
    const tail = o.split(":").pop() || "";
    return `@${tail.slice(0, 8)}`;
  }
  return `@${String(o).slice(0, 12)}`;
}

// Used as row-1 fallback in AgentDirectoryMarquee while the registry has no
// `entity_type === "agent"` records. Drop once live agents are populated.
export const FALLBACK_AGENTS: FeaturedAgent[] = [
  { id: "demo-research", name: "ResearchPilot", category: "AI", tags: ["research", "rag", "openai"], summary: "Multi-step research agent that browses, summarises, and cites sources for any topic.", status: "ACTIVE", owner: "@zynd", price: "0.02 USDC", entityType: "agent" },
  { id: "demo-translate", name: "TranslateFlow", category: "NLP", tags: ["translation", "language", "nlp"], summary: "Production translation across 50+ languages with tone and terminology controls.", status: "ACTIVE", owner: "@dev/lingua", price: "0.01 USDC", entityType: "agent" },
  { id: "demo-codereview", name: "CodeReviewer", category: "AI", tags: ["code", "review", "github"], summary: "Reviews pull requests for bugs, security issues, and style violations in seconds.", status: "ACTIVE", owner: "@buildlab", price: "0.03 USDC", entityType: "agent" },
  { id: "demo-extractor", name: "DataExtractor", category: "Extraction", tags: ["scraping", "data", "html"], summary: "Structured extraction from any URL — handles JS rendering, pagination, anti-bot.", status: "ACTIVE", owner: "@scrapeio", price: "0.012 USDC", entityType: "agent" },
  { id: "demo-resume", name: "ResumeMatcher", category: "Fair Hiring", tags: ["hiring", "matching", "bias"], summary: "Bias-audited resume scoring against job specs with explainable rationales.", status: "ACTIVE", owner: "@equityhr", price: "0.025 USDC", entityType: "agent" },
  { id: "demo-route", name: "RouteOptimizer", category: "Automation", tags: ["logistics", "routing", "ortools"], summary: "Multi-stop vehicle routing with capacity, time-window, and traffic constraints.", status: "ACTIVE", owner: "@geowave", price: "0.05 USDC", entityType: "agent" },
  { id: "demo-triage", name: "SupportTriage", category: "Communication", tags: ["support", "classification", "routing"], summary: "Auto-classifies and routes support tickets — multilingual, with sentiment scoring.", status: "ACTIVE", owner: "@helpyard", price: "0.008 USDC", entityType: "agent" },
  { id: "demo-legal", name: "LegalSummarizer", category: "Parsing", tags: ["legal", "contract", "summary"], summary: "Contract clause extraction, redline summary, and risk-flag scoring under 30s.", status: "ACTIVE", owner: "@lexcore", price: "0.06 USDC", entityType: "agent" },
];

function fromEntity(e: EntityRecord): FeaturedAgent {
  const price = e.entity_pricing?.base_price_usd
    ? `${e.entity_pricing.base_price_usd} ${e.entity_pricing.currency || "USDC"}`
    : undefined;
  const summary =
    (e.summary && e.summary.trim().length > 0)
      ? e.summary
      : `${titleCaseCategory(e.category || "")} ${e.entity_type || "agent"} on the Zynd network.`;
  return {
    id: e.entity_id,
    name: e.name,
    category: titleCaseCategory(e.category || "AI"),
    tags: e.tags || [],
    summary,
    status: (e.status || "ACTIVE").toUpperCase(),
    owner: shortOwner(e.owner),
    price,
    entityType: e.entity_type || "agent",
    lastHeartbeat: e.last_heartbeat,
  };
}

export function useFeaturedAgents(limit = 24): {
  agents: FeaturedAgent[];
  isLive: boolean;
  loading: boolean;
} {
  const [agents, setAgents] = useState<FeaturedAgent[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/landing/agents?limit=${limit}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<LandingResponse>) : null))
      .then((res) => {
        if (res && res.source === "live" && res.entities.length > 0) {
          setAgents(res.entities.map(fromEntity));
          setIsLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [limit]);

  return { agents, isLive, loading };
}

export function uniqueCategories(agents: FeaturedAgent[]): string[] {
  const set = new Set<string>();
  for (const a of agents) if (a.category) set.add(a.category);
  return Array.from(set);
}

export function entityToFeatured(e: EntityRecord | SearchResult): FeaturedAgent {
  const id = "entity_id" in e ? e.entity_id : e.agent_id;
  const owner = "owner" in e && e.owner ? e.owner : (e as SearchResult).developer_id;
  const lastHeartbeat = "last_heartbeat" in e ? (e as EntityRecord).last_heartbeat : undefined;
  const pricing = "entity_pricing" in e ? (e as EntityRecord).entity_pricing : undefined;
  const price = pricing?.base_price_usd
    ? `${pricing.base_price_usd} ${pricing.currency || "USDC"}`
    : undefined;
  const summary =
    e.summary && e.summary.trim().length > 0
      ? e.summary
      : `${titleCaseCategory(e.category || "")} ${e.entity_type || "agent"} on the Zynd network.`;
  return {
    id,
    name: e.name,
    category: titleCaseCategory(e.category || "AI"),
    tags: e.tags || [],
    summary,
    status: (e.status || "ACTIVE").toUpperCase(),
    owner: shortOwner(owner),
    price,
    entityType: e.entity_type || "agent",
    lastHeartbeat,
  };
}
