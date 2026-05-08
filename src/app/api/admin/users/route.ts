import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireZyndAdminApi } from "@/lib/admin-zynd-auth";

export async function GET() {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;

  // Fetch all developers
  const developers = await prisma.developerKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      developerId: true,
      name: true,
      username: true,
      role: true,
      country: true,
      createdAt: true,
    },
  });

  // Count entities per user
  const entityCounts = await prisma.entity.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  const countMap = new Map(
    entityCounts.map((e) => [e.userId, e._count.id])
  );

  // Get emails from Supabase auth (service role)
  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = createServiceClient();
  const { data: authUsers } = await service.auth.admin.listUsers({
    perPage: 1000,
  });

  const emailMap = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const users = developers.map((dev) => ({
    id: dev.id,
    userId: dev.userId,
    developerId: dev.developerId,
    name: dev.name,
    username: dev.username,
    email: emailMap.get(dev.userId) ?? "—",
    role: dev.role ?? "—",
    country: dev.country ?? "—",
    agentCount: countMap.get(dev.userId) ?? 0,
    createdAt: dev.createdAt.toISOString(),
  }));

  return NextResponse.json({ users, total: users.length });
}
