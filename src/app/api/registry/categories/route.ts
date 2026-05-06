import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

export const revalidate = 300;

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${zns()}/v1/categories`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { categories: [], source: "upstream-error", status: res.status },
        { status: 200, headers: { "cache-control": "public, max-age=30" } },
      );
    }

    const data = (await res.json()) as { categories?: unknown };
    const categories = Array.isArray(data.categories)
      ? data.categories.filter((c): c is string => typeof c === "string").sort()
      : [];

    return NextResponse.json(
      { categories },
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        categories: [],
        source: "exception",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 200, headers: { "cache-control": "public, max-age=30" } },
    );
  }
}
