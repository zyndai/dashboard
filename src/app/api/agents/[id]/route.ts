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
  const localAgent = await prisma.agent.findUnique({
    where: { id },
  });

  if (localAgent && localAgent.userId === user.id) {
    // If we have agent_id but missing registry details, enrich from registry
    let registryData: Record<string, unknown> | null = null;
    if (localAgent.agentId) {
      try {
        const res = await fetch(
          `${REGISTRY_URL}/v1/entities/${localAgent.agentId}`,
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
      agent: {
        id: localAgent.id,
        user_id: localAgent.userId,
        agent_id: localAgent.agentId,
        name: localAgent.name,
        description: localAgent.description,
        agent_url: localAgent.agentUrl,
        category: localAgent.category,
        tags: localAgent.tags,
        summary: localAgent.summary,
        agent_index: localAgent.agentIndex,
        fqan: localAgent.fqan || registryData?.fqan || null,
        developer_handle: registryData?.developer_handle || null,
        status: localAgent.status,
        source: localAgent.source,
        created_at: localAgent.createdAt.toISOString(),
        updated_at: localAgent.updatedAt.toISOString(),
        // Registry-enriched fields
        public_key: registryData?.public_key || null,
        trust_score: registryData?.trust_score || null,
        developer_id: registryData?.developer_id || null,
        home_registry: registryData?.home_registry || null,
      },
    });
  }

  // 2. Try by agent_id (the URL param might be an entity ID like zns:...)
  const byAgentId = await prisma.agent.findUnique({
    where: { agentId: id },
  });

  if (byAgentId && byAgentId.userId === user.id) {
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
      agent: {
        id: byAgentId.id,
        user_id: byAgentId.userId,
        agent_id: byAgentId.agentId,
        name: byAgentId.name,
        description: byAgentId.description,
        agent_url: byAgentId.agentUrl,
        category: byAgentId.category,
        tags: byAgentId.tags,
        summary: byAgentId.summary,
        agent_index: byAgentId.agentIndex,
        fqan: byAgentId.fqan || registryData?.fqan || null,
        developer_handle: registryData?.developer_handle || null,
        status: byAgentId.status,
        source: byAgentId.source,
        created_at: byAgentId.createdAt.toISOString(),
        updated_at: byAgentId.updatedAt.toISOString(),
        public_key: registryData?.public_key || null,
        trust_score: registryData?.trust_score || null,
        developer_id: registryData?.developer_id || null,
        home_registry: registryData?.home_registry || null,
      },
    });
  }

  return NextResponse.json({ error: "Agent not found" }, { status: 404 });
}
