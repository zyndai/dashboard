import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

export const revalidate = 60;

function intParam(raw: string | null, fallback: number, min: number, max: number): number {
  const n = raw === null ? NaN : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const limit = intParam(url.searchParams.get("limit"), 200, 1, 500);
  const offset = intParam(url.searchParams.get("offset"), 0, 0, 100_000);
  const type = url.searchParams.get("type") || "";
  const category = url.searchParams.get("category") || "";

  const upstream = new URL(`${zns()}/v1/entities`);
  upstream.searchParams.set("limit", String(limit));
  if (offset > 0) upstream.searchParams.set("offset", String(offset));
  if (type) upstream.searchParams.set("type", type);
  if (category) upstream.searchParams.set("category", category);

  try {
    const res = await fetch(upstream, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { entities: [], count: 0, source: "upstream-error", status: res.status },
        { status: 200, headers: { "cache-control": "public, max-age=10" } },
      );
    }

    const data = (await res.json()) as { entities?: unknown[]; count?: number };
    const raw = Array.isArray(data.entities) ? data.entities : [];

    const entities = raw.filter((e: unknown): e is Record<string, unknown> => {
      if (!e || typeof e !== "object") return false;
      const r = e as Record<string, unknown>;
      return typeof r.entity_id === "string" && typeof r.name === "string";
    });

    return NextResponse.json(
      { entities, count: data.count ?? entities.length },
      { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        entities: [],
        count: 0,
        source: "exception",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 200, headers: { "cache-control": "public, max-age=10" } },
    );
  }
}
