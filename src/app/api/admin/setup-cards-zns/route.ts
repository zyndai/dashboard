/**
 * One-time setup: provision a ZNS developer account for the cards backend.
 *
 * POST /api/admin/setup-cards-zns
 * Header: Authorization: Bearer <AGENTDNS_WEBHOOK_SECRET>
 *
 * ZNS generates the keypair server-side, returns it AES-GCM encrypted
 * with sha256(state) as key. We decrypt and return the seed (first 32 bytes
 * of the raw key) as ZNS_DEVELOPER_SEED_B64 for EC2 .env.prod.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { zns } from "@/lib/zns";

const WEBHOOK_SECRET = process.env.AGENTDNS_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!WEBHOOK_SECRET || auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ZNS_URL = zns();
  const state = crypto.randomBytes(16).toString("hex");

  const res = await fetch(`${ZNS_URL}/v1/admin/developers/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({
      name: "zynd-cards",
      state,
      metadata: { username: "zynd-cards", role: "cards-backend" },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `ZNS error: ${text}` }, { status: res.status });
  }

  const data = (await res.json()) as {
    developer_id: string;
    public_key: string;
    private_key_enc: string;
  };
  const { developer_id, public_key, private_key_enc } = data;

  // Decrypt AES-256-GCM with sha256(state) as key — same as developer/register/route.ts
  const aesKey = crypto.createHash("sha256").update(state).digest();
  const ciphertextBuf = Buffer.from(private_key_enc, "base64");
  const nonce = ciphertextBuf.subarray(0, 12);
  const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
  const encrypted = ciphertextBuf.subarray(12, ciphertextBuf.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, nonce);
  decipher.setAuthTag(authTag);
  const rawPrivKey = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");

  // rawPrivKey is base64 of the private key bytes. ZNS may return 64-byte NaCl
  // secret key (seed + pubkey) or 32-byte seed — take first 32 bytes (the seed).
  const privBytes = Buffer.from(rawPrivKey, "base64");
  const seedBytes = privBytes.subarray(0, 32);
  const seedB64 = seedBytes.toString("base64");

  return NextResponse.json({
    developer_id,
    public_key,
    seed_b64: seedB64,
    env_vars: [
      `ZNS_URL=${ZNS_URL}`,
      `ZNS_DEVELOPER_SEED_B64=${seedB64}`,
    ],
    note: "Add env_vars to EC2 /home/ubuntu/memory-layer/.env.prod, then rebuild cards container.",
  });
}
