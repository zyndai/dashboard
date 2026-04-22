import { NextResponse } from "next/server";

const REGISTRY_URL =
  process.env.AGENTDNS_REGISTRY_URL || "http://localhost:8080";

export async function GET() {
  try {
    const res = await fetch(`${REGISTRY_URL}/v1/network/status`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Registry unreachable" }, { status: 502 });
  }
}
