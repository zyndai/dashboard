"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

/** GET + reload + optional polling. Polling keeps status badges within one beat of the truth (M4.6). */
export function useN8nData<T>(path: string, opts: { pollMs?: number } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await n8nFetch<T>(path);
      if (!alive.current) return;
      setData(d);
      setError(null);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    void load();
    const t = opts.pollMs ? setInterval(() => void load(), opts.pollMs) : undefined;
    return () => {
      alive.current = false;
      if (t) clearInterval(t);
    };
  }, [load, opts.pollMs]);

  return { data, error, loading, reload: load };
}
