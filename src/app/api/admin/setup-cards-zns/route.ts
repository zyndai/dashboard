/**
 * One-time setup: export the calling user's developer seed for the cards backend.
 *
 * GET /api/admin/setup-cards-zns
 * Requires: valid Supabase session (logged-in user)
 *
 * Returns { developer_id, seed_b64, env_vars } — add env_vars to
 * EC2 /home/ubuntu/zynd-cards/.env.prod, then rebuild the cards container.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptPrivateKey } from "@/lib/pki";
import { prisma } from "@/lib/prisma";
import { zns } from "@/lib/zns";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKey = await prisma.developerKey.findUnique({ where: { userId: user.id } });
  if (!devKey) {
    return NextResponse.json({ error: "No developer key found for this user" }, { status: 404 });
  }

  // Decrypt the stored key — raw value is base64 of NaCl 64-byte secret key
  // (seed || pubkey). First 32 bytes are the Ed25519 seed.
  const rawPrivKey = decryptPrivateKey(devKey.privateKeyEnc);
  const privBytes = Buffer.from(rawPrivKey, "base64");
  const seedBytes = privBytes.subarray(0, 32);
  const seedB64 = seedBytes.toString("base64");

  const ZNS_URL = zns();

  return NextResponse.json({
    developer_id: devKey.developerId,
    public_key: devKey.publicKey,
    seed_b64: seedB64,
    env_vars: [
      `ZNS_URL=${ZNS_URL}`,
      `ZNS_DEVELOPER_SEED_B64=${seedB64}`,
    ],
    note: "Add env_vars to EC2 /home/ubuntu/zynd-cards/.env.prod then rebuild cards container.",
  });
}
