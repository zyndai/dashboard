import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const where: Record<string, unknown> = { entityId: { not: null } };
  if (type) where.entityType = type;
  if (category) where.category = category;

  const [rows, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.entity.count({ where }),
  ]);

  const entities = rows.map((e) => ({
    entity_id: e.entityId!,
    name: e.name,
    owner: e.userId,
    entity_url: e.entityUrl || "",
    category: e.category || "general",
    tags: e.tags || [],
    summary: e.summary || "",
    capability_summary: null,
    public_key: "",
    home_registry: "",
    schema_version: "1.0",
    registered_at: e.createdAt.toISOString(),
    updated_at: e.updatedAt.toISOString(),
    ttl: 0,
    status: e.status,
    last_heartbeat: e.updatedAt.toISOString(),
    entity_type: e.entityType || "agent",
    service_endpoint: e.serviceEndpoint || undefined,
    openapi_url: e.openapiUrl || undefined,
    entity_pricing: e.entityPricing || null,
    developer_id: null,
    fqan: e.fqan || null,
  }));

  return NextResponse.json({ entities, count: total });
}
