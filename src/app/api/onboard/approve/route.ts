import { NextRequest, NextResponse } from "next/server";

const REGISTRY_URL = process.env.AGENTDNS_REGISTRY_URL;
const WEBHOOK_SECRET = process.env.AGENTDNS_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!REGISTRY_URL || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Registry not configured" },
      { status: 500 }
    );
  }

  let body: {
    name: string;
    state: string;
    callback_port: number;
    metadata?: Record<string, string>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, state, callback_port, metadata } = body;

  if (!name || !state || !callback_port) {
    return NextResponse.json(
      { error: "Missing required fields: name, state, callback_port" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${REGISTRY_URL}/v1/admin/developers/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WEBHOOK_SECRET}`,
        },
        body: JSON.stringify({ name, state, callback_port, metadata }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Registry error: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach registry: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
