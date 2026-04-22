import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SearchBody {
  query?: string;
  category?: string;
  entity_type?: string;
  max_results?: number;
  offset?: number;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as SearchBody;
  const q = (body.query || "").trim();
  const limit = Math.min(body.max_results ?? 50, 200);
  const offset = body.offset ?? 0;

  const where: Record<string, unknown> = { entityId: { not: null } };
  if (body.entity_type) where.entityType = body.entity_type;
  if (body.category) where.category = body.category;

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.entity.count({ where }),
  ]);

  const results = rows.map((e) => ({
    agent_id: e.entityId!,
    name: e.name,
    summary: e.summary || "",
    category: e.category || "general",
    tags: e.tags || [],
    capability_summary: null,
    home_registry: "",
    status: e.status,
    developer_id: e.userId,
    score: 1,
    entity_type: e.entityType || "agent",
    service_endpoint: e.serviceEndpoint || undefined,
    openapi_url: e.openapiUrl || undefined,
    fqan: e.fqan || undefined,
  }));

  return NextResponse.json({
    results,
    total_found: total,
    offset,
    has_more: offset + rows.length < total,
  });
}
