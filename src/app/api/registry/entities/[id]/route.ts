import { NextResponse } from "next/server";

const REGISTRY_URL =
  process.env.AGENTDNS_REGISTRY_URL || "http://localhost:8080";

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
      `${REGISTRY_URL}/v1/entities/${encodeURIComponent(id)}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Registry unreachable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
