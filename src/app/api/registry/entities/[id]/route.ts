import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing entity id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${zns()}/v1/entities/${encodeURIComponent(id)}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": "application/json",
        // Prevent browsers from caching upstream errors so a transient ZNS
        // outage doesn't surface as a permanent "not found" in the tab.
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Registry unreachable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502, headers: { "cache-control": "no-store" } }
    );
  }
}
