import { NextResponse } from "next/server";
import { cookieClearHeader } from "@/lib/admin-zynd-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", cookieClearHeader());
  return res;
}
