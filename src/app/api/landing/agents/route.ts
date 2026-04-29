import { NextResponse } from "next/server";

const UPSTREAM =
  process.env.AGENTDNS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_AGENTDNS_URL ||
  "https://dns01.zynd.ai";

export const revalidate = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30", 10), 100);

  try {
    const res = await fetch(`${UPSTREAM}/v1/entities?limit=${limit * 2}`, {
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

    const cleaned = raw
      .filter((e: unknown) => {
        if (!e || typeof e !== "object") return false;
        const r = e as Record<string, unknown>;
        return typeof r.entity_id === "string" && typeof r.name === "string";
      })
      .slice(0, limit);

    return NextResponse.json(
      { entities: cleaned, count: cleaned.length, source: "live" },
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
