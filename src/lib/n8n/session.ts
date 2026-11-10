import { createHmac } from "crypto";

/** Gateway rejects secrets shorter than this (HS256 key strength). */
export const MIN_SESSION_SECRET_LENGTH = 32;

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

/**
 * Mint the Session JWT the n8n Gateway expects on /internal/v1 (LLD > Dashboard → Gateway
 * internal API, G9): HS256, `sub` = the developer id, mandatory `exp`. Minted per request
 * after the user is authenticated, so a leaked token dies in minutes.
 */
export function mintSessionToken(
  developerId: string,
  secret: string,
  opts: { ttlSeconds?: number; nowMs?: number } = {},
): string {
  if (!developerId) throw new Error("developerId is required");
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(`SESSION_JWT_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters`);
  }
  const iat = Math.floor((opts.nowMs ?? Date.now()) / 1000);
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ sub: developerId, iat, exp: iat + (opts.ttlSeconds ?? 300) }));
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
