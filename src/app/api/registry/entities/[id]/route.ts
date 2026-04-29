import { NextResponse } from "next/server";

// Prefer the public AgentDNS endpoint (the same one the marquee reads from).
// AGENTDNS_REGISTRY_URL points at an internal registry that isn't reachable
// in dev/prod, so falling back to it would serve stale "Agent not found".
const REGISTRY_URL =
  process.env.AGENTDNS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_AGENTDNS_URL ||
  process.env.AGENTDNS_REGISTRY_URL ||
  "https://dns01.zynd.ai";

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
      headers: {
        "content-type": "application/json",
        // Prevent browsers from caching upstream errors (e.g. an old 502 from
        // when AGENTDNS_REGISTRY_URL pointed at localhost). Detail pages must
        // always reflect the current state of dns01.
        "cache-control": "no-store",
      },
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
