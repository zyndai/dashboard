import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

interface SearchBody {
  query?: string;
  category?: string;
  entity_type?: string;
  max_results?: number;
  offset?: number;
}

interface UpstreamResult {
  entity_id?: string;
  agent_id?: string;
  [k: string]: unknown;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => ({}))) as SearchBody;
  const max = clampInt(body.max_results, 50, 1, 200);
  const offset = clampInt(body.offset, 0, 0, 100_000);
  const query = typeof body.query === "string" ? body.query.slice(0, 500) : "";

  try {
    const res = await fetch(`${zns()}/v1/search`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      body: JSON.stringify({
        query,
        category: body.category || undefined,
        entity_type: body.entity_type || undefined,
        max_results: max,
        offset,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { results: [], total_found: 0, offset: 0, has_more: false, source: "upstream-error", status: res.status },
        { status: 200, headers: { "cache-control": "no-store" } },
      );
    }

    const data = (await res.json()) as {
      results?: UpstreamResult[];
      total_found?: number;
      offset?: number;
      has_more?: boolean;
    };

    // Upstream returns `entity_id` on search hits; the dashboard's SearchResult
    // contract still uses `agent_id`. Carry both so existing consumers and
    // entityToFeatured (which prefers entity_id) both work.
    const results = (data.results ?? []).map((r) => ({
      ...r,
      agent_id: r.agent_id ?? r.entity_id ?? "",
      entity_id: r.entity_id ?? r.agent_id ?? "",
    }));

    return NextResponse.json(
      {
        results,
        total_found: data.total_found ?? results.length,
        offset: data.offset ?? 0,
        has_more: data.has_more ?? false,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        results: [],
        total_found: 0,
        offset: 0,
        has_more: false,
        source: "exception",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }
}
