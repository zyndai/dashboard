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

const SYNC_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_SYNC_INTERVAL_MS ?? "300000",
  10
);

export function EntitiesProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = useAuth();
  const hasFetched = useRef(false);

  // Full sync from registry + agent cards → DB → return
  const syncFromRegistry = useCallback(async () => {
    try {
      const res = await fetch("/api/entities/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const { entities: synced } = await res.json();
      setEntities(synced ?? []);
      setError(null);
    } catch (err) {
      console.error("[useEntities] Background sync failed:", err);
    }
  }, []);

  // Fast load from DB (returns immediately; triggers auto-sync if stale)
  const loadFromDb = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entities/sync", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load entities");
      const { entities: loaded } = await res.json();
      setEntities(loaded ?? []);
      setError(null);
    } catch (err) {
      setError("Failed to load entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: show DB data immediately, then kick off a background POST sync
  useEffect(() => {
    if (!authenticated || hasFetched.current) return;
    hasFetched.current = true;
    loadFromDb().then(() => syncFromRegistry());
  }, [authenticated, loadFromDb, syncFromRegistry]);

  // Poll: re-sync from registry on interval
  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(() => syncFromRegistry(), SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [authenticated, syncFromRegistry]);

  const refresh = useCallback(async () => {
    await syncFromRegistry();
  }, [syncFromRegistry]);

  return (
    <EntitiesContext.Provider value={{ entities, loading, error, refresh }}>
      {children}
    </EntitiesContext.Provider>
  );
}

export function useEntities() {
  return useContext(EntitiesContext);
}
