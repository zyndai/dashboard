const AGENTDNS_BASE = "/api/registry";

export interface CapabilitySummary {
  skills: string[];
  protocols: string[];
  languages: string[];
  models: string[];
  input_types?: string[];
  output_types?: string[];
}

export interface EntityPricing {
  model: string;
  base_price_usd: number;
  currency: string;
  payment_methods: string[];
  rates?: Record<string, number>;
}

export interface EntityRecord {
  entity_id: string;
  name: string;
  owner: string;
  entity_url: string;
  category: string;
  tags: string[];
  summary: string;
  capability_summary: CapabilitySummary | null;
  public_key: string;
  home_registry: string;
  schema_version: string;
  registered_at: string;
  updated_at: string;
  ttl: number;
  status: string;
  last_heartbeat: string;
  entity_type: string;
  service_endpoint?: string;
  openapi_url?: string;
  entity_pricing?: EntityPricing | null;
  developer_id?: string;
}

export interface SearchResult {
  agent_id: string;
  name: string;
  summary: string;
  category: string;
  tags: string[];
  capability_summary: CapabilitySummary | null;
  home_registry: string;
  status: string;
  developer_id: string;
  score: number;
  entity_type: string;
  service_endpoint?: string;
  openapi_url?: string;
  fqan?: string;
  developer_handle?: string;
}

export interface ListEntitiesResponse {
  entities: EntityRecord[];
  count: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total_found: number;
  offset: number;
  has_more: boolean;
}

export interface NetworkStatus {
  registry_id: string;
  name: string;
  version: string;
  uptime: string;
  peer_count: number;
  local_agents: number;
  gossip_entries: number;
  cached_cards: number;
  node_type: string;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = `${AGENTDNS_BASE}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AgentDNS ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listEntities(
  params?: { type?: string; category?: string; limit?: number; offset?: number },
  signal?: AbortSignal,
): Promise<ListEntitiesResponse> {
  const url = buildUrl("/entities", {
    type: params?.type,
    category: params?.category,
    limit: params?.limit,
    offset: params?.offset,
  });
  return fetchJSON<ListEntitiesResponse>(url, { signal });
}

export async function getEntity(entityId: string, signal?: AbortSignal): Promise<EntityRecord> {
  // Next 16's useParams() surfaces the URL-encoded id (e.g. `zns%3A…`);
  // re-encoding that produces `zns%253A…` and the upstream then 404s.
  // Normalize so the URL is encoded exactly once regardless of how the
  // caller obtained the id.
  let normalized = entityId;
  try {
    normalized = decodeURIComponent(entityId);
  } catch {
    // entityId already contained a literal `%` — fall back to the raw form.
  }
  return fetchJSON<EntityRecord>(
    `${AGENTDNS_BASE}/entities/${encodeURIComponent(normalized)}`,
    { signal },
  );
}

export async function searchAgents(
  query: string,
  params?: { category?: string; entity_type?: string; max_results?: number; offset?: number },
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return fetchJSON<SearchResponse>(`${AGENTDNS_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      category: params?.category || undefined,
      entity_type: params?.entity_type || undefined,
      max_results: params?.max_results ?? undefined,
      offset: params?.offset ?? undefined,
    }),
    signal,
  });
}

export async function getCategories(signal?: AbortSignal): Promise<string[]> {
  const res = await fetchJSON<{ categories: string[] }>(`${AGENTDNS_BASE}/categories`, { signal });
  return res.categories;
}

export async function getTags(signal?: AbortSignal): Promise<string[]> {
  const res = await fetchJSON<{ tags: string[] }>(`${AGENTDNS_BASE}/tags`, { signal });
  return res.tags;
}

export async function getNetworkStatus(signal?: AbortSignal): Promise<NetworkStatus> {
  return fetchJSON<NetworkStatus>(`${AGENTDNS_BASE}/network/status`, { signal });
}
