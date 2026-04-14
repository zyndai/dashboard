"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AgentRecord } from "@/lib/supabase/db";
import { useAuth } from "@/hooks/useAuth";

interface AgentsContextValue {
  agents: AgentRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AgentsContext = createContext<AgentsContextValue>({
  agents: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

const SYNC_INTERVAL = 20_000;

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = useAuth();
  const hasFetched = useRef(false);

  const sync = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/agents/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const { agents: synced } = await res.json();
      setAgents(synced || []);
      setError(null);
    } catch (err) {
      setError("Failed to load agents");
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
    <AgentsContext.Provider value={{ agents, loading, error, refresh: () => sync(false) }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  return useContext(AgentsContext);
}
