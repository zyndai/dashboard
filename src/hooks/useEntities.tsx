"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { EntityRecord } from "@/lib/supabase/db";
import { useAuth } from "@/hooks/useAuth";

interface EntitiesContextValue {
  entities: EntityRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EntitiesContext = createContext<EntitiesContextValue>({
  entities: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

const SYNC_INTERVAL = 30_000;

export function EntitiesProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = useAuth();
  const hasFetched = useRef(false);

  const sync = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/entities/sync", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load entities");
      const { entities: synced } = await res.json();
      setEntities(synced || []);
      setError(null);
    } catch (err) {
      setError("Failed to load entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!authenticated) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    sync(true);
  }, [authenticated, sync]);

  // Poll every 20s
  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(() => sync(false), SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [authenticated, sync]);

  return (
    <EntitiesContext.Provider value={{ entities, loading, error, refresh: () => sync(false) }}>
      {children}
    </EntitiesContext.Provider>
  );
}

export function useEntities() {
  return useContext(EntitiesContext);
}
