"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_ZYND_API_URL || "https://api.zynd.ai";

export type ZyndTokenResult = { token: string; mcp_url: string; email: string };

/**
 * Exchanges the Supabase session for a Zynd API token. Kept in the in-memory query cache only
 * (never written to storage) and reused for a few minutes instead of re-exchanging on every visit.
 */
export function useZyndToken() {
  return useQuery({
    queryKey: ["zynd-token"],
    queryFn: async (): Promise<ZyndTokenResult> => {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session?.access_token) throw new Error("No active session. Please sign in again.");
      const res = await fetch(`${API_BASE}/token/exchange`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(`Token exchange failed (${res.status}). Try again.`);
      return (await res.json()) as ZyndTokenResult;
    },
    staleTime: 4 * 60_000,
    gcTime: 5 * 60_000,
  });
}
