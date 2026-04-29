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
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: { developerId: true },
  });

  if (!devKey) {
    // No developer key — just return local entities
    const entities = await prisma.entity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    const mapped = entities.map((e) => ({
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
      created_at: e.createdAt.toISOString(),
      updated_at: e.updatedAt.toISOString(),
    }));
    return NextResponse.json({ entities: mapped, synced: false });
  }

  // Fetch entities from agent-dns registry
  let registryEntities: RegistryEntity[] = [];
  try {
    const res = await fetch(
      `${zns()}/v1/developers/${encodeURIComponent(devKey.developerId)}/entities`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      registryEntities = data.entities || [];
    } else {
      console.error(
        "[entities/sync] Registry returned",
        res.status,
        await res.text()
      );
    }
  } catch (err) {
    console.error("[entities/sync] Failed to reach registry:", err);
  }

  // Upsert registry entities into dashboard DB
  if (registryEntities.length > 0) {
    try {
      await prisma.$transaction(
        registryEntities.map((re) =>
          prisma.entity.upsert({
            where: { entityId: re.entity_id },
            create: {
              userId: user.id,
              entityId: re.entity_id,
              name: re.name,
              entityUrl: re.entity_url || null,
              category: re.category || null,
              tags: re.tags || [],
              summary: re.summary || null,
              entityIndex: re.entity_index ?? null,
              fqan: re.fqan || null,
              entityType: re.entity_type || "agent",
              serviceEndpoint: re.service_endpoint || null,
              openapiUrl: re.openapi_url || null,
              entityPricing: (re.entity_pricing ?? undefined) as Prisma.InputJsonValue | undefined,
              status: re.status || "active",
              source: "registry",
            },
            update: {
              name: re.name,
              entityUrl: re.entity_url || null,
              category: re.category || null,
              tags: re.tags || [],
              summary: re.summary || null,
              fqan: re.fqan || null,
              entityType: re.entity_type || "agent",
              serviceEndpoint: re.service_endpoint || null,
              openapiUrl: re.openapi_url || null,
              entityPricing: (re.entity_pricing ?? undefined) as Prisma.InputJsonValue | undefined,
              status: re.status || "active",
            },
          })
        )
      );
    } catch (err) {
      console.error("[entities/sync] Upsert failed:", err);
    }
  }

  // Return all entities for this user, mapped to snake_case for frontend
  const entities = await prisma.entity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const mapped = entities.map((e) => ({
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
    created_at: e.createdAt.toISOString(),
    updated_at: e.updatedAt.toISOString(),
  }));

  return NextResponse.json({ entities: mapped, synced: true });
}
