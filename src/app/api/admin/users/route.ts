import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email?.toLowerCase() ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // Count agents per user
  const agentCounts = await prisma.agent.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  const countMap = new Map(
    agentCounts.map((a) => [a.userId, a._count.id])
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
