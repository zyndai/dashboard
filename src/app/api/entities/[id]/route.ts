import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const REGISTRY_URL =
  process.env.AGENTDNS_REGISTRY_URL || "http://localhost:8080";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try local DB first (by UUID)
  const localEntity = await prisma.entity.findUnique({
    where: { id },
  });

  if (localEntity && localEntity.userId === user.id) {
    // If we have entity_id but missing registry details, enrich from registry
    let registryData: Record<string, unknown> | null = null;
    if (localEntity.entityId) {
      try {
        const res = await fetch(
          `${REGISTRY_URL}/v1/entities/${localEntity.entityId}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          registryData = await res.json();
        }
      } catch {
        // Registry unavailable — use local data only
      }
    }

    return NextResponse.json({
      entity: {
        id: localEntity.id,
        user_id: localEntity.userId,
        entity_id: localEntity.entityId,
        name: localEntity.name,
        description: localEntity.description,
        entity_url: localEntity.entityUrl,
        category: localEntity.category,
        tags: localEntity.tags,
        summary: localEntity.summary,
        entity_index: localEntity.entityIndex,
        fqan: localEntity.fqan || registryData?.fqan || null,
        developer_handle: registryData?.developer_handle || null,
        status: localEntity.status,
        source: localEntity.source,
        created_at: localEntity.createdAt.toISOString(),
        updated_at: localEntity.updatedAt.toISOString(),
        // Registry-enriched fields
        public_key: registryData?.public_key || null,
        trust_score: registryData?.trust_score || null,
        developer_id: registryData?.developer_id || null,
        home_registry: registryData?.home_registry || null,
      },
    });
  }

  // 2. Try by entity_id (the URL param might be an entity ID like zns:...)
  const byEntityId = await prisma.entity.findUnique({
    where: { entityId: id },
  });

  if (byEntityId && byEntityId.userId === user.id) {
    let registryData: Record<string, unknown> | null = null;
    try {
      const res = await fetch(`${REGISTRY_URL}/v1/entities/${id}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        registryData = await res.json();
      }
    } catch {
      // Registry unavailable
    }

    return NextResponse.json({
      entity: {
        id: byEntityId.id,
        user_id: byEntityId.userId,
        entity_id: byEntityId.entityId,
        name: byEntityId.name,
        description: byEntityId.description,
        entity_url: byEntityId.entityUrl,
        category: byEntityId.category,
        tags: byEntityId.tags,
        summary: byEntityId.summary,
        entity_index: byEntityId.entityIndex,
        fqan: byEntityId.fqan || registryData?.fqan || null,
        developer_handle: registryData?.developer_handle || null,
        status: byEntityId.status,
        source: byEntityId.source,
        created_at: byEntityId.createdAt.toISOString(),
        updated_at: byEntityId.updatedAt.toISOString(),
        public_key: registryData?.public_key || null,
        trust_score: registryData?.trust_score || null,
        developer_id: registryData?.developer_id || null,
        home_registry: registryData?.home_registry || null,
      },
    });
  }

  return NextResponse.json({ error: "Entity not found" }, { status: 404 });
}
