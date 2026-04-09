import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const REGISTRY_URL =
  process.env.AGENTDNS_REGISTRY_URL || "http://localhost:8080";

interface RegistryAgent {
  agent_id: string;
  name: string;
  agent_url?: string;
  category?: string;
  tags?: string[];
  summary?: string;
  agent_index?: number;
  status?: string;
  fqan?: string;
  developer_handle?: string;
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
    // No developer key — just return local agents
    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    const mapped = agents.map((a) => ({
      id: a.id,
      user_id: a.userId,
      agent_id: a.agentId,
      name: a.name,
      description: a.description,
      agent_url: a.agentUrl,
      category: a.category,
      tags: a.tags,
      summary: a.summary,
      agent_index: a.agentIndex,
      fqan: a.fqan,
      status: a.status,
      source: a.source,
      created_at: a.createdAt.toISOString(),
      updated_at: a.updatedAt.toISOString(),
    }));
    return NextResponse.json({ agents: mapped, synced: false });
  }

  // Fetch agents from agent-dns registry
  let registryAgents: RegistryAgent[] = [];
  try {
    const res = await fetch(
      `${REGISTRY_URL}/v1/developers/${devKey.developerId}/entities`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      registryAgents = data.agents || [];
    } else {
      console.error(
        "[agents/sync] Registry returned",
        res.status,
        await res.text()
      );
    }
  } catch (err) {
    console.error("[agents/sync] Failed to reach registry:", err);
  }

  // Upsert registry agents into dashboard DB
  if (registryAgents.length > 0) {
    try {
      await prisma.$transaction(
        registryAgents.map((ra) =>
          prisma.agent.upsert({
            where: { agentId: ra.agent_id },
            create: {
              userId: user.id,
              agentId: ra.agent_id,
              name: ra.name,
              agentUrl: ra.agent_url || null,
              category: ra.category || null,
              tags: ra.tags || [],
              summary: ra.summary || null,
              agentIndex: ra.agent_index ?? null,
              fqan: ra.fqan || null,
              status: ra.status || "active",
              source: "registry",
            },
            update: {
              name: ra.name,
              agentUrl: ra.agent_url || null,
              category: ra.category || null,
              tags: ra.tags || [],
              summary: ra.summary || null,
              fqan: ra.fqan || null,
              status: ra.status || "active",
            },
          })
        )
      );
    } catch (err) {
      console.error("[agents/sync] Upsert failed:", err);
    }
  }

  // Return all agents for this user, mapped to snake_case for frontend
  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const mapped = agents.map((a) => ({
    id: a.id,
    user_id: a.userId,
    agent_id: a.agentId,
    name: a.name,
    description: a.description,
    agent_url: a.agentUrl,
    category: a.category,
    tags: a.tags,
    summary: a.summary,
    agent_index: a.agentIndex,
    fqan: a.fqan,
    status: a.status,
    source: a.source,
    created_at: a.createdAt.toISOString(),
    updated_at: a.updatedAt.toISOString(),
  }));

  return NextResponse.json({ agents: mapped, synced: true });
}
