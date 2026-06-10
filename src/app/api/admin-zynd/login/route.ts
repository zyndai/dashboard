import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkCredentials, issueToken, cookieSetHeader } from "@/lib/admin-zynd-auth";

const Body = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { username, password } = parsed.data;
  if (!checkCredentials(username, password)) {
    // Constant-ish delay to slow brute force
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = issueToken();
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", cookieSetHeader(token));
  return res;
}
