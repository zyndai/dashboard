import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// M6.4: issue a replacement key; the old one keeps working for `graceHours` (default 24, 0 = at once).
// The new plaintext is in this response only.
export const POST = async (req: NextRequest, ctx: Ctx) =>
  proxyToGateway(req, "POST", `/api-keys/${encodeURIComponent((await ctx.params).id)}/rotate`, { body: true });
