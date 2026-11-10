import type { NextRequest } from "next/server";
import { pickQuery, proxyToGateway } from "@/lib/n8n/route";

// M4.9: task history, newest first. ?listingId&direction&limit&offset
export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) =>
  proxyToGateway(req, "GET", `/tasks${pickQuery(req, ["listingId", "direction", "limit", "offset"])}`);
