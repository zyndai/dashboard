import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.zynd.ai";
// Only allow slug-safe handles — prevents path traversal / URL injection
const HANDLE_RE = /^[a-zA-Z0-9_-]{1,80}$/;

export async function POST(req: NextRequest) {
  try {
    const { handle, messages } = await req.json();

    if (!handle || !HANDLE_RE.test(handle) || !Array.isArray(messages)) {
      return NextResponse.json({ error: "handle and messages required" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/v1/chat/${handle}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) {
      // Map backend status codes without leaking internal error details
      const status = res.status === 404 ? 404 : res.status === 503 ? 503 : 502;
      const msg = status === 404 ? "Card not found" : status === 503 ? "Chatbot unavailable" : "Upstream error";
      return NextResponse.json({ error: msg }, { status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
