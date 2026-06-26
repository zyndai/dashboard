"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Handoff page for the ChatGPT OAuth flow: api.zynd.ai/oauth/authorize redirects here
// with a signed `req`; we authenticate with the SAME Google login as the dashboard,
// then hand the verified session to api/oauth/complete, which returns ChatGPT's
// redirect URL (with the auth code). One identity across GPT, MCP, and dashboard.
const API_BASE = process.env.NEXT_PUBLIC_ZYND_API_URL || "https://api.zynd.ai";

export default function AuthorizePage() {
  const [supabase] = useState(() => createClient());
  const [error, setError] = useState("");

  useEffect(() => {
    const req = new URLSearchParams(window.location.search).get("req");
    if (!req) {
      setError("Missing authorize request. Start again from ChatGPT.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Not signed in → Google, returning here (req preserved) via the dashboard callback.
          const next = encodeURIComponent(`/authorize?req=${req}`);
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
          });
          return;
        }

        const res = await fetch(`${API_BASE}/oauth/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ req, supabase_token: session.access_token }),
        });
        if (!res.ok) throw new Error(`Authorization failed (${res.status}).`);
        const { redirect_url } = (await res.json()) as { redirect_url: string };
        window.location.href = redirect_url; // back to ChatGPT with the code
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Authorization failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <main style={S.page}>
      <div style={S.card}>
        <div style={S.brand}>
          <span style={S.z}>Z</span> ZYND
        </div>
        {error ? (
          <>
            <div style={S.title}>Couldn’t connect</div>
            <p style={S.sub}>{error}</p>
          </>
        ) : (
          <>
            <div style={S.spinner} />
            <div style={S.title}>Connecting ChatGPT to ZYND…</div>
            <p style={S.sub}>Verifying your Google identity. You’ll be sent back to ChatGPT automatically.</p>
          </>
        )}
      </div>
      <style>{`@keyframes zspin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#000",
    backgroundImage: "radial-gradient(900px 520px at 50% -8%, rgba(139,92,246,.18), transparent 60%)",
    color: "#f6f6f6",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 18,
    padding: "36px 30px",
  },
  brand: { display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 22 },
  z: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "linear-gradient(135deg,#8B5CF6,#3B82F6)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
  },
  spinner: {
    width: 34,
    height: 34,
    margin: "0 auto 18px",
    borderRadius: "50%",
    border: "3px solid rgba(139,92,246,.22)",
    borderTopColor: "#8B5CF6",
    animation: "zspin .8s linear infinite",
  },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 6 },
  sub: { color: "#9094a8", fontSize: 14, lineHeight: 1.55, margin: 0 },
};
