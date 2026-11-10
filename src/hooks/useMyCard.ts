"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getMyCard } from "@/lib/cards";
import { getQueryClient } from "@/lib/query-client";

export const MY_CARD_KEY = ["my-card"] as const;

async function fetchMyCard(): Promise<{ authenticated: boolean; handle: string | null }> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session?.access_token) return { authenticated: false, handle: null };
  try {
    const mine = await getMyCard(session.access_token);
    return { authenticated: true, handle: mine?.handle ?? null };
  } catch (err) {
    console.error("[useMyCard] failed:", err);
    return { authenticated: true, handle: null };
  }
}

/**
 * The signed-in user's card handle. Cached and shared, so the sidebar, navbar and dashboard home
 * make one request between them and show the last known value instantly on revisits.
 * Uses the shared client explicitly because it is also used outside <Providers> (/agent-card).
 */
export function useMyCard() {
  const queryClient = getQueryClient();
  const { data, isPending, refetch } = useQuery(
    { queryKey: MY_CARD_KEY, queryFn: fetchMyCard },
    queryClient,
  );

  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(MY_CARD_KEY, { authenticated: false, handle: null });
      } else if (event === "USER_UPDATED") {
        void refetch();
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient, refetch]);

  return { ready: !isPending, authenticated: data?.authenticated ?? false, handle: data?.handle ?? null };
}
