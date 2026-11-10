"use client";

import { useQuery } from "@tanstack/react-query";

export interface DevInfo {
  developer_id: string;
  public_key: string;
  name: string;
  username: string | null;
  evm_address: string | null;
}

export const DEVELOPER_INFO_KEY = ["developer-info"] as const;

/** Full developer record (includes the EVM address). Cached and shared by the Wallet and CLI tabs. */
export function useDeveloperInfo() {
  const { data } = useQuery({
    queryKey: DEVELOPER_INFO_KEY,
    queryFn: async (): Promise<DevInfo | null> => {
      const r = await fetch("/api/developer/keys");
      return r.ok ? ((await r.json()) as DevInfo) : null;
    },
    staleTime: 5 * 60_000,
  });
  return data ?? null;
}
