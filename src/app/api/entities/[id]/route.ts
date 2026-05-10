import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { zns } from "@/lib/zns";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(`${zns()}/v1/entities/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const entity = await res.json();

    return NextResponse.json({ entity });
  } catch (err) {
    console.error("[entities/[id]] Failed to fetch from registry:", err);
    return NextResponse.json({ error: "Failed to fetch entity" }, { status: 500 });
  }
}
