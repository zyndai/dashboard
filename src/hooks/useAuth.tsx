"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface DeveloperInfo {
  developer_id: string;
  public_key: string;
  name: string;
  username?: string;
  role?: string;
  country?: string;
}

export interface AuthSnapshot {
  user: User | null;
  developer: DeveloperInfo | null;
}

interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  developer: DeveloperInfo | null;
  needsOnboarding: boolean;
  refresh: () => Promise<void>;
  login: () => void;
  loginWithGithub: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  initial?: AuthSnapshot;
  children: React.ReactNode;
}

export function AuthProvider({ initial, children }: AuthProviderProps) {
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();

  const seeded = !!initial;
  const [user, setUser] = useState<User | null>(initial?.user ?? null);
  const [developer, setDeveloper] = useState<DeveloperInfo | null>(initial?.developer ?? null);
  const [ready, setReady] = useState(seeded);
  // Tracks the user id we have a `developer` record for. Used to suppress redundant
  // refreshes — Supabase JS re-emits SIGNED_IN on tab focus, token refresh, and initial
  // subscription, so we only re-fetch when the actual user identity changes.
  const knownUserIdRef = useRef<string | null>(initial?.user?.id ?? null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/developer/keys");
      if (res.ok) {
        setDeveloper(await res.json());
      } else if (res.status === 404) {
        setDeveloper(null);
      }
    } catch (err) {
      console.error("Failed to refresh developer:", err);
    }
  }, []);

  // Fetch session on mount when not server-seeded; otherwise just subscribe to changes.
  useEffect(() => {
    let cancelled = false;

    if (!seeded) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        setReady(true);
        if (nextUser) {
          knownUserIdRef.current = nextUser.id;
          refresh();
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setReady(true);
      if (event === "SIGNED_OUT") {
        setDeveloper(null);
        knownUserIdRef.current = null;
        // Never let one user's cached dashboard data leak to the next session.
        queryClient.clear();
      } else if (nextUser && nextUser.id !== knownUserIdRef.current) {
        // A different account signed in: drop anything cached for the previous one.
        if (knownUserIdRef.current) queryClient.clear();
        else void queryClient.invalidateQueries();
        knownUserIdRef.current = nextUser.id;
        refresh();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [seeded, supabase, refresh, queryClient]);

  const login = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  const loginWithGithub = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    setDeveloper(null);
    queryClient.clear();
    window.location.href = "/";
  }, [supabase, queryClient]);

  const value = useMemo<AuthContextValue>(() => ({
    ready,
    authenticated: !!user,
    user,
    developer,
    needsOnboarding: !!user && (!developer || !developer.username),
    refresh,
    login,
    loginWithGithub,
    logout,
  }), [ready, user, developer, refresh, login, loginWithGithub, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
