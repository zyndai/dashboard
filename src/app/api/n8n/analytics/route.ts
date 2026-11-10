import type { NextRequest } from "next/server";
import { pickQuery, proxyToGateway } from "@/lib/n8n/route";

// M6.2: listing analytics. ?days(1-365)&listingId
export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) => proxyToGateway(req, "GET", `/analytics${pickQuery(req, ["days", "listingId"])}`);
