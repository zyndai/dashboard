import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Server-only env var — NEXT_PUBLIC_ prefix would expose this in the JS bundle
  const token = process.env.REVALIDATE_AGENTS_TOKEN;
  if (token) {
    const incoming = req.headers.get("x-revalidate-token");
    if (incoming !== token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  revalidatePath("/registry");
  return NextResponse.json({ revalidated: true });
}
