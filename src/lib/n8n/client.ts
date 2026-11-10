"use client";

import { useCallback } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

export class N8nApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string, readonly details?: unknown) {
    super(message);
  }
}

/** Call a dashboard `/api/n8n/*` route. Throws N8nApiError with the Gateway's own message. */
export async function n8nFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/n8n${path}`, {
      method: init.method ?? "GET",
      credentials: "same-origin",
      ...(init.body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(init.body) } : {}),
    });
  } catch {
    throw new N8nApiError("Could not reach the dashboard server", 0);
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    const e = (data ?? {}) as { error?: string; code?: string; details?: unknown };
    throw new N8nApiError(e.error ?? `Request failed (${res.status})`, res.status, e.code, e.details);
  }
  return data as T;
}

/** Cache key for a Gateway path. Components sharing a path share one cached request. */
export const n8nKey = (path: string) => ["n8n", path] as const;

/**
 * Cached GET with optional background polling. Data survives tab switches: `loading` is true
 * only when nothing is cached yet, and stale data is refetched silently (`fetching`).
 * Polling pauses while the browser tab is hidden. `keepPrevious` keeps the old result visible while
 * a changed path (e.g. a new date range) loads.
 */
export function useN8nData<T>(path: string, opts: { pollMs?: number; keepPrevious?: boolean } = {}) {
  const q = useQuery({
    queryKey: n8nKey(path),
    queryFn: () => n8nFetch<T>(path),
    refetchInterval: opts.pollMs,
    placeholderData: opts.keepPrevious ? keepPreviousData : undefined,
  });
  const { refetch } = q;
  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);
  return {
    data: q.data ?? null,
    error: q.error ? (q.error as Error).message : null,
    loading: q.isPending,
    fetching: q.isFetching,
    reload,
  };
}

/** Mark cached n8n data stale so mounted views refetch right away (call after a mutation). */
export function useInvalidateN8n() {
  const qc = useQueryClient();
  return useCallback(
    (...prefixes: string[]) =>
      Promise.all(
        prefixes.map((p) =>
          qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "n8n" && String(query.queryKey[1]).startsWith(p) }),
        ),
      ),
    [qc],
  );
}
