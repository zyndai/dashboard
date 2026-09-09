import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.zynd.ai";

export async function POST(req: NextRequest) {
  try {
    const { handle, messages } = await req.json();

    if (!handle || !Array.isArray(messages)) {
      return NextResponse.json({ error: "handle and messages required" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/v1/chat/${handle}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => "unknown");
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
