import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { zns } from "@/lib/zns";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[zns/resolve GET] Auth error:", authError.message);
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const REGISTRY_URL = zns();

  const { searchParams } = new URL(req.url);
  let developer = searchParams.get("developer");
  let entity = searchParams.get("entity");

  // Support ?fqan=registry/developer/entity or registry.zynd.ai/developer/entity
  const fqan = searchParams.get("fqan");
  if (fqan) {
    const parts = fqan.split("/");
    if (parts.length === 3) {
      // registry/developer/entity
      developer = parts[1];
      entity = parts[2];
    } else if (parts.length === 2) {
      // developer/entity (no registry prefix)
      developer = parts[0];
      entity = parts[1];
    }
  }

  if (!developer || !entity) {
    return NextResponse.json(
      { error: "Provide ?fqan=developer/entity or ?developer=...&entity=..." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${REGISTRY_URL}/v1/resolve/${encodeURIComponent(developer)}/${encodeURIComponent(entity)}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Name not found" }, { status: 404 });
      }
      const text = await res.text();
      console.error("[zns/resolve GET] Registry error:", res.status, text);
      return NextResponse.json({ error: "Registry error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[zns/resolve GET] Error:", (err as Error).message);
    return NextResponse.json({ error: "Failed to resolve name" }, { status: 502 });
  }
}
