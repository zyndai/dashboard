import type { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/n8n/route";

// M4.2: POST returns the plaintext key once; GET never does (prefix only).
export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) => proxyToGateway(req, "GET", "/api-keys");
export const POST = (req: NextRequest) => proxyToGateway(req, "POST", "/api-keys", { body: true });
