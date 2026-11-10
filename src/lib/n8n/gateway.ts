import { MIN_SESSION_SECRET_LENGTH, mintSessionToken } from "./session";

export interface GatewayResult {
  status: number;
  /** Parsed JSON body; for errors always `{ error, code, details? }`. */
  body: unknown;
}

export interface GatewayEnv {
  N8N_GATEWAY_URL?: string;
  SESSION_JWT_SECRET?: string;
}

const NOT_CONFIGURED: GatewayResult = {
  status: 503,
  body: { error: "The n8n Gateway is not configured on this server", code: "GATEWAY_UNAVAILABLE" },
};

const UNREACHABLE: GatewayResult = {
  status: 502,
  body: { error: "The n8n Gateway could not be reached", code: "GATEWAY_UNAVAILABLE" },
};

/**
 * Call the Gateway's /internal/v1 on behalf of an already-authenticated developer (M4.3).
 * The developer id comes from our own session, never from the request, so one developer cannot
 * name another. Registration can take a few seconds (it talks to AgentDNS), hence the timeout.
 */
export async function gatewayRequest(
  developerId: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  deps: { env?: GatewayEnv; fetchImpl?: typeof fetch; nowMs?: number } = {},
): Promise<GatewayResult> {
  const env = deps.env ?? (process.env as GatewayEnv);
  const base = env.N8N_GATEWAY_URL?.trim().replace(/\/+$/, "");
  const secret = env.SESSION_JWT_SECRET;
  if (!base || !secret || secret.length < MIN_SESSION_SECRET_LENGTH) return NOT_CONFIGURED;

  const token = mintSessionToken(developerId, secret, { nowMs: deps.nowMs });
  try {
    const res = await (deps.fetchImpl ?? fetch)(`${base}/internal/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      // A proxy or crash page. Never pass its HTML through.
      return { status: res.status >= 500 ? 502 : res.status, body: { error: "Unexpected response from the n8n Gateway", code: "GATEWAY_UNAVAILABLE" } };
    }
    return { status: res.status, body: parsed };
  } catch {
    return UNREACHABLE;
  }
}
