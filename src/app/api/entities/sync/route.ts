import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { zns } from "@/lib/zns";

interface RegistryEntity {
  entity_id: string;
  name: string;
  entity_url?: string;
  category?: string;
  tags?: string[];
  summary?: string;
  entity_index?: number;
  status?: string;
  fqan?: string;
  developer_handle?: string;
  entity_type?: string;
  service_endpoint?: string;
  openapi_url?: string;
  entity_pricing?: Record<string, unknown>;
  pricing_model?: {
    base_price?: number;
    currency?: string;
    details?: string;
    type?: string;
    unit?: string;
  };
  capability_summary?: {
    input_types?: string[];
    languages?: string[];
    models?: string[];
    output_types?: string[];
    protocols?: string[];
    skills?: string[];
  };
  developer_id?: string;
  home_registry?: string;
  last_heartbeat?: string;
  public_key?: string;
  registered_at?: string;
  schema_version?: string;
  signature?: string;
  ttl?: number;
  type?: string;
  updated_at?: string;
}

interface AgentCard {
  capabilities?: Record<string, boolean>;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  description?: string;
  name?: string;
  preferredTransport?: string;
  protocolVersion?: string;
  skills?: unknown[];
  url?: string;
  version?: string;
  "x-zynd"?: {
    walletAddress?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    lastUpdatedAt?: string;
    status?: string;
    [key: string]: unknown;
  };
}

async function fetchAgentCard(entityUrl: string): Promise<AgentCard | null> {
  try {
    const cardUrl = `${entityUrl.replace(/\/$/, "")}/.well-known/agent-card.json`;
    const res = await fetch(cardUrl, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json() as AgentCard;
  } catch {
    return null;
  }
}

function mapEntityToResponse(e: {
  id: string;
  userId: string;
  entityId: string | null;
  name: string;
  description: string | null;
  entityUrl: string | null;
  category: string | null;
  tags: string[];
  summary: string | null;
  entityIndex: number | null;
  fqan: string | null;
  entityType: string | null;
  serviceEndpoint: string | null;
  openapiUrl: string | null;
  entityPricing: Prisma.JsonValue | null;
  status: string;
  source: string;
  walletAddress: string | null;
  a2aUrl: string | null;
  capabilities: Prisma.JsonValue | null;
  protocolVersion: string | null;
  preferredTransport: string | null;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  cardSkills: Prisma.JsonValue | null;
  inputSchema: Prisma.JsonValue | null;
  outputSchema: Prisma.JsonValue | null;
  homeRegistry: string | null;
  agentPublicKey: string | null;
  lastHeartbeat: Date | null;
  registeredAt: Date | null;
  cardSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: e.id,
    user_id: e.userId,
    entity_id: e.entityId,
    name: e.name,
    description: e.description,
    entity_url: e.entityUrl,
    category: e.category,
    tags: e.tags,
    summary: e.summary,
    entity_index: e.entityIndex,
    fqan: e.fqan,
    entity_type: e.entityType,
    service_endpoint: e.serviceEndpoint,
    openapi_url: e.openapiUrl,
    entity_pricing: e.entityPricing,
    status: e.status,
    source: e.source,
    wallet_address: e.walletAddress,
    a2a_url: e.a2aUrl,
    capabilities: e.capabilities,
    protocol_version: e.protocolVersion,
    preferred_transport: e.preferredTransport,
    default_input_modes: e.defaultInputModes,
    default_output_modes: e.defaultOutputModes,
    card_skills: e.cardSkills,
    input_schema: e.inputSchema,
    output_schema: e.outputSchema,
    home_registry: e.homeRegistry,
    agent_public_key: e.agentPublicKey,
    last_heartbeat: e.lastHeartbeat?.toISOString() ?? null,
    registered_at: e.registeredAt?.toISOString() ?? null,
    card_synced_at: e.cardSyncedAt?.toISOString() ?? null,
    created_at: e.createdAt.toISOString(),
    updated_at: e.updatedAt.toISOString(),
  };
}

export async function syncUserEntities(userId: string, developerId: string): Promise<void> {
  const res = await fetch(
    `${zns()}/v1/developers/${encodeURIComponent(developerId)}/entities`,
    { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) }
  );

  if (!res.ok) {
    throw new Error(`Registry ${res.status}: ${await res.text()}`);
  }

  const data = await res.json() as { agents?: RegistryEntity[] };
  const registryEntities = Array.isArray(data.agents) ? data.agents : [];

  if (registryEntities.length === 0) return;

  // Upsert registry data — run in parallel, no transaction needed
  await Promise.allSettled(
    registryEntities.map((re) =>
      prisma.entity.upsert({
        where: { entityId: re.entity_id },
        create: {
          userId,
          entityId: re.entity_id,
          name: re.name,
          entityUrl: re.entity_url ?? null,
          category: re.category ?? null,
          tags: re.tags ?? [],
          summary: re.summary ?? null,
          entityIndex: re.entity_index ?? null,
          fqan: re.fqan ?? null,
          entityType: re.entity_type ?? "agent",
          serviceEndpoint: re.service_endpoint ?? null,
          openapiUrl: re.openapi_url ?? null,
          entityPricing: (re.pricing_model ?? undefined) as Prisma.InputJsonValue | undefined,
          status: re.status ?? "active",
          source: "registry",
          homeRegistry: re.home_registry ?? null,
          agentPublicKey: re.public_key ?? null,
          lastHeartbeat: re.last_heartbeat ? new Date(re.last_heartbeat) : null,
          registeredAt: re.registered_at ? new Date(re.registered_at) : null,
        },
        update: {
          name: re.name,
          entityUrl: re.entity_url ?? null,
          category: re.category ?? null,
          tags: re.tags ?? [],
          summary: re.summary ?? null,
          fqan: re.fqan ?? null,
          entityType: re.entity_type ?? "agent",
          serviceEndpoint: re.service_endpoint ?? null,
          openapiUrl: re.openapi_url ?? null,
          entityPricing: (re.pricing_model ?? undefined) as Prisma.InputJsonValue | undefined,
          status: re.status ?? "active",
          homeRegistry: re.home_registry ?? null,
          agentPublicKey: re.public_key ?? null,
          lastHeartbeat: re.last_heartbeat ? new Date(re.last_heartbeat) : null,
        },
      })
    )
  );

  // Enrich with agent cards concurrently
  await Promise.allSettled(
    registryEntities
      .filter((re) => re.entity_url)
      .map(async (re) => {
        const card = await fetchAgentCard(re.entity_url!);
        if (!card) return;
        const xzynd = card["x-zynd"] ?? {};
        await prisma.entity.update({
          where: { entityId: re.entity_id },
          data: {
            capabilities: (card.capabilities ?? undefined) as Prisma.InputJsonValue | undefined,
            protocolVersion: card.protocolVersion ?? null,
            preferredTransport: card.preferredTransport ?? null,
            defaultInputModes: card.defaultInputModes ?? [],
            defaultOutputModes: card.defaultOutputModes ?? [],
            cardSkills: (card.skills ?? undefined) as Prisma.InputJsonValue | undefined,
            inputSchema: (xzynd.inputSchema ?? undefined) as Prisma.InputJsonValue | undefined,
            outputSchema: (xzynd.outputSchema ?? undefined) as Prisma.InputJsonValue | undefined,
            a2aUrl: card.url ?? null,
            walletAddress: typeof xzynd.walletAddress === "string" && xzynd.walletAddress.startsWith("0x")
              ? xzynd.walletAddress
              : undefined,
            cardSyncedAt: new Date(),
          },
        });
      })
  );
}

const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS ?? "300000", 10);

// GET — return from DB; auto-sync if data is stale
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: { developerId: true },
  });

  if (!devKey) {
    return NextResponse.json({ entities: [], count: 0, developerId: null });
  }

  // Check staleness
  const latest = await prisma.entity.findFirst({
    where: { userId: user.id, source: "registry" },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });

  const isStale = !latest || Date.now() - latest.updatedAt.getTime() > SYNC_INTERVAL_MS;

  if (isStale) {
    try {
      await syncUserEntities(user.id, devKey.developerId);
    } catch (err) {
      console.error("[entities/sync GET] Sync failed:", err);
    }
  }

  const entities = await prisma.entity.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    entities: entities.map(mapEntityToResponse),
    count: entities.length,
    developerId: devKey.developerId,
    synced: isStale,
  });
}

// POST — force sync from registry + agent cards, return from DB
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: { developerId: true },
  });

  if (!devKey) {
    const entities = await prisma.entity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ entities: entities.map(mapEntityToResponse), synced: false });
  }

  try {
    await syncUserEntities(user.id, devKey.developerId);
  } catch (err) {
    console.error("[entities/sync POST] Sync failed:", err);
  }

  const entities = await prisma.entity.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    entities: entities.map(mapEntityToResponse),
    count: entities.length,
    developerId: devKey.developerId,
    synced: true,
  });
}
