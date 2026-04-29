import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { zns } from "@/lib/zns";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[zns/names GET] Auth error:", authError.message);
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const REGISTRY_URL = zns();

  // Get developer key
  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: { developerId: true },
  });

  if (!devKey) {
    return NextResponse.json({ error: "Developer not registered" }, { status: 404 });
  }

  // First get the developer to find their handle
  try {
    const devRes = await fetch(`${REGISTRY_URL}/v1/developers/${encodeURIComponent(devKey.developerId)}`);
    if (!devRes.ok) {
      if (devRes.status === 404) {
        return NextResponse.json({ names: [], count: 0 });
      }
      return NextResponse.json({ error: "Failed to fetch developer" }, { status: devRes.status });
    }

    const devData = await devRes.json();

    if (!devData.dev_handle) {
      // No handle — no names
      return NextResponse.json({ names: [], count: 0 });
    }

    const handle = devData.dev_handle;

    // Fetch agent names for this handle
    const namesRes = await fetch(`${REGISTRY_URL}/v1/handles/${encodeURIComponent(handle)}/agents`);
    if (!namesRes.ok) {
      if (namesRes.status === 404) {
        return NextResponse.json({ names: [], count: 0 });
      }
      const text = await namesRes.text();
      console.error("[zns/names GET] Registry error:", namesRes.status, text);
      return NextResponse.json({ error: "Registry error" }, { status: namesRes.status });
    }

    const namesData = await namesRes.json();
    const names = Array.isArray(namesData) ? namesData : (namesData.names ?? []);

    return NextResponse.json({ names, count: names.length, handle });
  } catch (err) {
    console.error("[zns/names GET] Error:", (err as Error).message);
    return NextResponse.json({ error: "Failed to fetch names" }, { status: 502 });
  }
}
