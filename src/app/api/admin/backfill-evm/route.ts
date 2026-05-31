import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptPrivateKey, deriveEvmAddress } from "@/lib/pki";

export async function POST(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKeys = await prisma.developerKey.findMany({
    where: { evmAddress: null },
    select: { userId: true, privateKeyEnc: true },
  });

  if (devKeys.length === 0) {
    return NextResponse.json({ skipped: 0, updated: 0, failed: 0, message: "All developers already have EVM addresses" });
  }

  const results = await Promise.allSettled(
    devKeys.map(async ({ userId, privateKeyEnc }) => {
      const privateKey = decryptPrivateKey(privateKeyEnc);
      const evmAddress = deriveEvmAddress(privateKey);
      await prisma.developerKey.update({
        where: { userId },
        data: { evmAddress },
      });
      return evmAddress;
    })
  );

  const updated = results.filter((r) => r.status === "fulfilled").length;
  const failures = results
    .map((r, i) =>
      r.status === "rejected"
        ? { userId: devKeys[i].userId, reason: (r as PromiseRejectedResult).reason?.message }
        : null
    )
    .filter(Boolean);

  if (failures.length) console.error("[backfill-evm] failures:", failures);

  return NextResponse.json({
    updated,
    failed: failures.length,
    failures,
    total: devKeys.length,
  });
}
