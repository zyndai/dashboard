import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decryptPrivateKey, deriveEvmAddress } from "@/lib/pki";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("[developer/keys] Auth error:", authError.message);
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: {
      developerId: true,
      publicKey: true,
      privateKeyEnc: true,
      name: true,
      username: true,
      role: true,
      country: true,
      evmAddress: true,
    },
  });

  if (!devKey) {
    return NextResponse.json(null, { status: 404 });
  }

  // Derive + persist EVM address on first call if not yet stored
  let evmAddress = devKey.evmAddress;
  if (!evmAddress) {
    try {
      const privateKey = decryptPrivateKey(devKey.privateKeyEnc);
      evmAddress = deriveEvmAddress(privateKey);
      await prisma.developerKey.update({
        where: { userId: user.id },
        data: { evmAddress },
      });
    } catch (err) {
      console.error("[developer/keys] EVM derive failed:", err);
    }
  }

  return NextResponse.json({
    developer_id: devKey.developerId,
    public_key: devKey.publicKey,
    name: devKey.name,
    username: devKey.username,
    role: devKey.role,
    country: devKey.country,
    evm_address: evmAddress ?? null,
  });
}
