import { NextResponse } from "next/server";
import { zns } from "@/lib/zns";

interface TestRequestBody {
  entityId: string;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: string;
}

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const FETCH_TIMEOUT_MS = 30_000;

function pickEndpoint(card: Record<string, unknown>): string | null {
  // ZNS agent cards expose the callable URL on `url` (A2A spec). Fall through
  // to legacy fields just in case.
  const candidates = [card.url, card.service_endpoint, card.entity_url, card.openapi_url];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}

export async function POST(req: Request) {
  let payload: TestRequestBody;
  try {
    payload = (await req.json()) as TestRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { entityId, method = "GET", path = "", headers = {}, body } = payload;
  if (!entityId) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 });
  }

  const upperMethod = method.toUpperCase();
  if (!ALLOWED_METHODS.has(upperMethod)) {
    return NextResponse.json(
      { error: `Method ${method} not allowed. Use one of: ${[...ALLOWED_METHODS].join(", ")}` },
      { status: 400 }
    );
  }

  // 1. Resolve the entity's endpoint via the agent card (has `url`).
  let entityEndpoint: string | null;
  try {
    const cardRes = await fetch(
      `${zns()}/v1/entities/${encodeURIComponent(entityId)}/card`,
      { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10_000), cache: "no-store" }
    );
    if (!cardRes.ok) {
      return NextResponse.json(
        { error: `Entity card lookup failed: ${cardRes.status}` },
        { status: 502 }
      );
    }
    const card = (await cardRes.json()) as Record<string, unknown>;
    entityEndpoint = pickEndpoint(card);
  } catch (err) {
    return NextResponse.json(
      { error: "Registry unreachable", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  if (!entityEndpoint) {
    return NextResponse.json(
      { error: "Entity has no callable endpoint (entity_url, service_endpoint, openapi_url all missing)" },
      { status: 422 }
    );
  }

  // 2. Compose the target URL.
  let target: URL;
  try {
    target = new URL(path || "", entityEndpoint);
  } catch {
    return NextResponse.json({ error: `Invalid path: ${path}` }, { status: 400 });
  }
  // Block obvious SSRF — scheme must be http(s) and host must not be localhost/loopback.
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) endpoints are callable" }, { status: 400 });
  }

  // 3. Forward the request.
  const fwdHeaders = new Headers();
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === "string") fwdHeaders.set(k, v);
  }
  if (!fwdHeaders.has("accept")) fwdHeaders.set("accept", "application/json, */*");
  if (body && upperMethod !== "GET" && !fwdHeaders.has("content-type")) {
    fwdHeaders.set("content-type", "application/json");
  }

  const startedAt = Date.now();
  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: upperMethod,
      headers: fwdHeaders,
      body: upperMethod === "GET" || upperMethod === "DELETE" ? undefined : body,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Upstream call failed",
        detail: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 502 }
    );
  }
  const durationMs = Date.now() - startedAt;

  const responseText = await upstream.text();
  const responseHeaders: Record<string, string> = {};
  upstream.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return NextResponse.json({
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
    body: responseText,
    target: target.toString(),
    method: upperMethod,
    durationMs,
  });
}
