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

export function useFeaturedAgents(limit = 120): {
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
