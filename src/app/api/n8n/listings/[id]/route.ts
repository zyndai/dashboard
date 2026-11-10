import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const path = async (ctx: Ctx) => `/listings/${encodeURIComponent((await ctx.params).id)}`;

export const GET = async (req: NextRequest, ctx: Ctx) => proxyToGateway(req, "GET", await path(ctx));
// Edit name, summary, tags, workflowId and price.
export const PATCH = async (req: NextRequest, ctx: Ctx) => proxyToGateway(req, "PATCH", await path(ctx), { body: true });
// Stop the heartbeat and delete.
export const DELETE = async (req: NextRequest, ctx: Ctx) => proxyToGateway(req, "DELETE", await path(ctx));
