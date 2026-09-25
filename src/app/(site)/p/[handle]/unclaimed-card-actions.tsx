"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { claimHeaders, forgetClaimToken } from "@/lib/claim-tokens";

const STORAGE_KEY = "zynd_my_handles";

export function UnclaimedCardActions({ handle }: { handle: string }) {
  const { authenticated, ready } = useAuth();
  const [isCreator, setIsCreator] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setIsCreator(stored.includes(handle));
    } catch { /* non-fatal */ }
  }, [handle]);

  // Once user signs in after creating, auto-claim (PATCH card with their email)
  // then remove handle from localStorage since it's now officially owned.
  useEffect(() => {
    if (!authenticated || !isCreator || claimed) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://api.zynd.ai"}/cards/by-handle/${encodeURIComponent(handle)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...claimHeaders(handle) },
            body: JSON.stringify({}),
          }
        );
        if (res.ok) {
          forgetClaimToken(handle);
          setClaimed(true);
          try {
            const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.filter(h => h !== handle)));
          } catch { /* non-fatal */ }
        }
      } catch { /* non-fatal */ }
    });
  }, [authenticated, isCreator, claimed, handle]);

  async function claimCard() {
    setClaiming(true);
    // Store intended destination, then trigger LinkedIn OAuth
    document.cookie = `zynd_next=/p/${handle}; path=/; samesite=lax`;
    const loginRedirect = `${window.location.origin}/auth/callback`;
    await createClient().auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: loginRedirect },
    });
  }

  if (!ready || (!isCreator && !claimed)) return null;
  if (claimed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-[11px] font-semibold text-emerald-600">
        ✓ Card claimed
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <a
        href={`/create?edit=${encodeURIComponent(handle)}`}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#7B72E9]/40 bg-[#7B72E9]/10 font-mono text-[12px] font-semibold text-[#7B72E9] hover:bg-[#7B72E9]/20 transition-colors"
      >
        Edit my card →
      </a>
      {!authenticated && (
        <button
          type="button"
          onClick={claimCard}
          disabled={claiming}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B0B0B] font-mono text-[12px] font-semibold text-white hover:bg-[#333] transition-colors disabled:opacity-60"
        >
          {claiming ? "Redirecting…" : "Claim this card"}
        </button>
      )}
    </div>
  );
}
