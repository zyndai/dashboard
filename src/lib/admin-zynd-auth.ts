import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ZYND_COOKIE = "zynd_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_ZYND_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_ZYND_SESSION_SECRET missing or too short (need 32+ chars)");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function checkCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_ZYND_USERNAME ?? "";
  const p = process.env.ADMIN_ZYND_PASSWORD ?? "";
  if (!u || !p) return false;
  return safeEqual(username, u) && safeEqual(password, p);
}

/** token = "<issuedAt>.<nonce>.<hmac>" */
export function issueToken(): string {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  const hmac = sign(payload);
  return `${payload}.${hmac}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, hmac] = parts;
  const expected = sign(`${issuedAt}.${nonce}`);
  if (!safeEqual(hmac, expected)) return false;
  const ts = Number(issuedAt);
  if (!Number.isFinite(ts)) return false;
  if (Date.now() - ts > SESSION_TTL_MS) return false;
  return true;
}

export async function isZyndAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(ZYND_COOKIE)?.value);
}

export async function requireZyndAdminApi(): Promise<NextResponse | null> {
  if (await isZyndAdmin()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function cookieSetHeader(token: string): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ZYND_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function cookieClearHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ZYND_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
