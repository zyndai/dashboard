import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// Revoke. The key stops working on its next request.
export const DELETE = async (req: NextRequest, ctx: Ctx) =>
  proxyToGateway(req, "DELETE", `/api-keys/${encodeURIComponent((await ctx.params).id)}`);
