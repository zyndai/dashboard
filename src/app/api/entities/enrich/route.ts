import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface AgentCard {
  capabilities?: Record<string, boolean>;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  preferredTransport?: string;
  protocolVersion?: string;
  skills?: unknown[];
  url?: string;
  "x-zynd"?: {
    walletAddress?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
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

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entities = await prisma.entity.findMany({
    where: { userId: user.id, entityUrl: { not: null } },
    select: { id: true, entityId: true, entityUrl: true },
  });

  if (entities.length === 0) {
    return NextResponse.json({ enriched: 0, total: 0 });
  }

  const results = await Promise.allSettled(
    entities.map(async (e) => {
      const card = await fetchAgentCard(e.entityUrl!);
      if (!card) return null;

      const xzynd = card["x-zynd"] ?? {};
      const walletAddress =
        typeof xzynd.walletAddress === "string" && xzynd.walletAddress.startsWith("0x")
          ? xzynd.walletAddress
          : null;

      await prisma.entity.update({
        where: { id: e.id },
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
          walletAddress,
          cardSyncedAt: new Date(),
        },
      });

      return walletAddress;
    })
  );

  const enriched = results.filter(
    (r) => r.status === "fulfilled" && r.value !== null
  ).length;

  return NextResponse.json({ enriched, total: entities.length });
}
