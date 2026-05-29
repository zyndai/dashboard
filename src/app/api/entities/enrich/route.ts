import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function fetchWalletAddress(entityUrl: string): Promise<string | null> {
  try {
    const cardUrl = `${entityUrl.replace(/\/$/, "")}/.well-known/agent-card.json`;
    const res = await fetch(cardUrl, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const card = await res.json();
    const addr = card?.["x-zynd"]?.walletAddress;
    return typeof addr === "string" && addr.startsWith("0x") ? addr : null;
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
    select: { id: true, entityUrl: true },
  });

  if (entities.length === 0) {
    return NextResponse.json({ enriched: 0 });
  }

  const results = await Promise.allSettled(
    entities.map(async (e) => {
      const walletAddress = await fetchWalletAddress(e.entityUrl!);
      await prisma.entity.update({
        where: { id: e.id },
        data: { walletAddress, cardSyncedAt: new Date() },
      });
      return walletAddress;
    })
  );

  const enriched = results.filter(
    (r) => r.status === "fulfilled" && r.value !== null
  ).length;

  return NextResponse.json({ enriched, total: entities.length });
}
