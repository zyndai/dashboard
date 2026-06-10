import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptPrivateKey } from "@/lib/pki";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * CLI onboard flow — retrieves existing developer PKI from DB.
 *
 * The developer must have already signed up via the dashboard (frontend login),
 * which creates the PKI via /api/developer/register.
 * This route only re-encrypts the stored key with the CLI's session state.
 */

function encryptForCLI(privateKeyB64: string, state: string): string {
  const key = crypto.createHash("sha256").update(state).digest();
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([cipher.update(privateKeyB64, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Go format: base64(nonce || ciphertext || authTag)
  const combined = Buffer.concat([nonce, encrypted, authTag]);
  return combined.toString("base64");
}

export async function POST(req: NextRequest) {
  // Verify Supabase session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    state: string;
    callback_port?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { state } = body;
  if (!state) {
    return NextResponse.json(
      { error: "Missing required field: state" },
      { status: 400 }
    );
  }

  // Look up existing developer key — must already exist from frontend registration
  const existing = await prisma.developerKey.findUnique({
    where: { userId: user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "No developer key found. Please complete registration on the dashboard first." },
      { status: 404 }
    );
  }

  // Decrypt stored key with master key, re-encrypt with CLI session state
  const rawPrivKey = decryptPrivateKey(existing.privateKeyEnc);
  const cliEncrypted = encryptForCLI(rawPrivKey, state);

  return NextResponse.json({
    developer_id: existing.developerId,
    private_key_enc: cliEncrypted,
  });
}
