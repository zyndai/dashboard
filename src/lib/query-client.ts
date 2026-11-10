import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cached data is shown instantly; it is refetched in the background once stale.
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** One client per browser tab (so hooks used outside <Providers> share the same cache); fresh per server render. */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  return (browserClient ??= makeQueryClient());
}
