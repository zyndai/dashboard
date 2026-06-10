import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { syncUserEntities } from "@/app/api/entities/sync/route";

export const maxDuration = 300;

async function syncAll() {
  const devKeys = await prisma.developerKey.findMany({
    select: { userId: true, developerId: true },
  });

  const results = await Promise.allSettled(
    devKeys.map(async ({ userId, developerId }) => {
      await syncUserEntities(userId, developerId);
      return developerId;
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failures = results
    .map((r, i) =>
      r.status === "rejected"
        ? {
            developerId: devKeys[i].developerId,
            reason:
              (r as PromiseRejectedResult).reason?.message ??
              String((r as PromiseRejectedResult).reason),
          }
        : null
    )
    .filter(Boolean);

  if (failures.length) console.error("[cron/registry-sync] failures:", failures);
  console.log(
    `[cron/registry-sync] done — ${succeeded}/${devKeys.length} synced, ${failures.length} failed`
  );
}

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;

  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return immediately — sync runs in background
  waitUntil(syncAll());

  return NextResponse.json({
    status: "processing",
    message: "Sync started in background",
    timestamp: new Date().toISOString(),
  });
}
