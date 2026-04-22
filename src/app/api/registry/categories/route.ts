import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.entity.findMany({
    where: { entityId: { not: null }, category: { not: null } },
    distinct: ["category"],
    select: { category: true },
  });

  const categories = rows
    .map((r) => r.category)
    .filter((c): c is string => !!c)
    .sort();

  return NextResponse.json({ categories });
}
