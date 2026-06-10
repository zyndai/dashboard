import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

export async function GET() {
  try {
    const res = await fetch(`${zns()}/v1/network/status`, {
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
