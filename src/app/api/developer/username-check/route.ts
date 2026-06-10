import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { zns } from "@/lib/zns";

/**
 * GET /api/developer/username-check?username=acme-corp
 *
 * Checks username availability in both the local DB and the registry.
 * Returns { available: boolean, reason?: string }
 */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { available: false, reason: "Username is required" },
      { status: 400 }
    );
  }

  // Validate format: 3-40 chars, lowercase alphanumeric + hyphens, starts with letter
  const handleRegex = /^[a-z][a-z0-9-]{2,39}$/;
  if (!handleRegex.test(username)) {
    return NextResponse.json({
      available: false,
      reason:
        "Username must be 3-40 lowercase letters, numbers, or hyphens, starting with a letter",
    });
  }

  if (username.endsWith("-") || username.includes("--")) {
    return NextResponse.json({
      available: false,
      reason: "Username must not end with a hyphen or contain consecutive hyphens",
    });
  }

  const reserved = [
    "zynd", "system", "admin", "test", "root",
    "registry", "anonymous", "unknown",
  ];
  if (reserved.includes(username)) {
    return NextResponse.json({
      available: false,
      reason: `"${username}" is a reserved name`,
    });
  }

  // Check local DB first
  try {
    const localExisting = await prisma.developerKey.findFirst({
      where: { username },
    });
    if (localExisting) {
      return NextResponse.json({
        available: false,
        reason: "Username is already taken",
      });
    }
  } catch (err) {
    console.error("[username-check] DB error:", err);
    // DB unavailable — fall through to registry check
  }

  // Cross-check the registry. Failures are swallowed so registry downtime
  // doesn't block sign-ups when the local DB has already cleared the name.
  try {
    const res = await fetch(
      `${zns()}/v1/handles/${encodeURIComponent(username)}/available`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const data = await res.json();
      if (!data.available) {
        return NextResponse.json({
          available: false,
          reason: data.reason || "Username is already taken on the registry",
        });
      }
    }
  } catch {
    // Registry check failed — don't block, local check passed
  }

  return NextResponse.json({ available: true });
}
