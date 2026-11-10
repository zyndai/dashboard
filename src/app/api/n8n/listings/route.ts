import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

// M4.1: GET lists the developer's listings (with heartbeat status); POST creates a DRAFT.
export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) => proxyToGateway(req, "GET", "/listings");
export const POST = (req: NextRequest) => proxyToGateway(req, "POST", "/listings", { body: true });
