import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

// M4.10: public EVM addresses: the payer for outbound calls and one receiving address per listing.
export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) => proxyToGateway(req, "GET", "/wallet");
