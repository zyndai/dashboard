import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { gatewayRequest } from "./gateway";

const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Resolve the signed-in user's developer id, or null. */
async function currentDeveloperId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dev = await prisma.developerKey.findUnique({ where: { userId: user.id }, select: { developerId: true } });
  return dev?.developerId ?? null;
}

/**
 * CSRF guard for state-changing calls. Cookies authenticate these routes, so require a same-origin
 * `Origin` (when the browser sends one) and a JSON body, which a cross-site form cannot send.
 */
export function csrfProblem(req: Pick<NextRequest, "method" | "headers">): string | null {
  if (req.method === "GET" || req.method === "HEAD") return null;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    let originHost = "";
    try { originHost = new URL(origin).host; } catch { /* falls through to the mismatch below */ }
    if (!host || originHost !== host) return "Cross-origin request refused";
  }
  const type = req.headers.get("content-type") ?? "";
  if (req.headers.get("content-length") !== "0" && req.headers.has("content-type") && !type.toLowerCase().startsWith("application/json")) {
    return "Content-Type must be application/json";
  }
  return null;
}

/**
 * Proxy a dashboard API call to the Gateway as the signed-in developer (M4.1, M4.2, M4.3).
 * `path` is built by the caller from fixed strings plus encoded ids; the body is forwarded as is,
 * and the Gateway validates it.
 */
export async function proxyToGateway(
  req: NextRequest,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  opts: { body?: boolean } = {},
): Promise<NextResponse> {
  const problem = csrfProblem(req);
  if (problem) return json({ error: problem, code: "BAD_REQUEST" }, 403);

  const developerId = await currentDeveloperId();
  if (!developerId) return json({ error: "Unauthorized", code: "AUTH_INVALID" }, 401);

  let body: unknown;
  if (opts.body) {
    try {
      body = await req.json();
    } catch {
      return json({ error: "Expected a JSON body", code: "BAD_REQUEST" }, 400);
    }
  }
  const res = await gatewayRequest(developerId, method, path, body);
  return json(res.body, res.status);
}

/** Copy only the query parameters a route allows. */
export function pickQuery(req: NextRequest, allowed: string[]): string {
  const out = new URLSearchParams();
  for (const k of allowed) {
    const v = req.nextUrl.searchParams.get(k);
    if (v !== null && v !== "") out.set(k, v);
  }
  const s = out.toString();
  return s ? `?${s}` : "";
}
