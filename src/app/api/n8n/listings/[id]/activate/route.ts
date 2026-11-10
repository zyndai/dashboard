import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const POST = async (req: NextRequest, ctx: Ctx) =>
  proxyToGateway(req, "POST", `/listings/${encodeURIComponent((await ctx.params).id)}/activate`);
