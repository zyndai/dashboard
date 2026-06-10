import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

export const revalidate = 300;

export async function GET() {
  try {
    const url = new URL(`${zns()}/v1/network/stats`);
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { estimated_agents: 0, estimated_registries: 0 },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[network/stats] Failed:", err);
    return NextResponse.json(
      { estimated_agents: 0, estimated_registries: 0 },
      { status: 200 }
    );
  }
}
