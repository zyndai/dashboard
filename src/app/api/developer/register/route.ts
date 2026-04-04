import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptPrivateKey } from "@/lib/pki";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const REGISTRY_URL = process.env.AGENTDNS_REGISTRY_URL;
const WEBHOOK_SECRET = process.env.AGENTDNS_WEBHOOK_SECRET;

async function getClientIp(req: NextRequest): Promise<string | null> {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

async function lookupCountry(ip: string | null): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return null;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.status === "success" ? data.country : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  console.log("[developer/register] called");

  if (!REGISTRY_URL || !WEBHOOK_SECRET) {
    console.error("[developer/register] Registry not configured");
    return NextResponse.json({ error: "Registry not configured" }, { status: 500 });
  }

  // Verify Supabase session
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("[developer/register] Auth error:", authError.message);
  }

  if (!user) {
    console.error("[developer/register] No user in session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[developer/register] User:", user.id, user.email);

  const clientIp = await getClientIp(req);
  const country = await lookupCountry(clientIp);
  console.log("[developer/register] IP:", clientIp, "Country:", country);

  let body: { name: string; username?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name || user.email || "Developer";
  const username = body.username || undefined;
  const role = body.role || undefined;

  // Check if user already has a developer key
  const existing = await prisma.developerKey.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    console.log("[developer/register] Existing key found for", user.id);

    // If existing but missing username/role, update them (one-time profile completion)
    if (!existing.username && username) {
      await prisma.developerKey.update({
        where: { userId: user.id },
        data: { username, role },
      });
    }

    return NextResponse.json({
      developer_id: existing.developerId,
      public_key: existing.publicKey,
      name: existing.name,
      username: existing.username || username,
      role: existing.role || role,
    });
  }

  // Validate username is provided for new registrations
  if (!username) {
    return NextResponse.json(
      { error: "Username is required for new developer registration" },
      { status: 400 }
    );
  }

  // Check username uniqueness locally
  const usernameExists = await prisma.developerKey.findFirst({
    where: { username },
  });
  if (usernameExists) {
    return NextResponse.json(
      { error: "Username is already taken" },
      { status: 409 }
    );
  }

  // Generate a state for encryption (registry API compatibility)
  const stateBytes = crypto.randomBytes(16);
  const state = stateBytes.toString("hex");

  console.log("[developer/register] Calling registry at", REGISTRY_URL);

  try {
    const res = await fetch(`${REGISTRY_URL}/v1/admin/developers/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        name,
        state,
        metadata: {
          username: username || "",
          role: role || "",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[developer/register] Registry error:", res.status, text);
      return NextResponse.json({ error: `Registry error: ${text}` }, { status: res.status });
    }

    const data = await res.json();
    const { developer_id, private_key_enc: registryEncKey, public_key } = data;
    console.log("[developer/register] Registry returned developer_id:", developer_id);

    // Decrypt from registry (SHA256(state)), re-encrypt with master key
    const aesKey = crypto.createHash("sha256").update(state).digest();
    const ciphertextBuf = Buffer.from(registryEncKey, "base64");
    const nonce = ciphertextBuf.subarray(0, 12);
    const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
    const encrypted = ciphertextBuf.subarray(12, ciphertextBuf.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, nonce);
    decipher.setAuthTag(authTag);
    const rawPrivKey = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    const masterEncrypted = encryptPrivateKey(rawPrivKey);

    // Store in DB with username, role, IP, and country
    await prisma.developerKey.create({
      data: {
        userId: user.id,
        developerId: developer_id,
        publicKey: public_key || "",
        privateKeyEnc: masterEncrypted,
        name,
        username,
        role,
        registrationIp: clientIp,
        country,
      },
    });

    console.log("[developer/register] Stored key for", user.id, developer_id, "username:", username);

    return NextResponse.json({ developer_id, public_key, name, username, role });
  } catch (err) {
    console.error("[developer/register] Error:", (err as Error).message);
    return NextResponse.json(
      { error: `Failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
