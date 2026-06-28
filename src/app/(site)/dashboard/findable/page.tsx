"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_ZYND_API_URL || "https://api.zynd.ai";

type Fact = { predicate: string; object: string; source?: string; confidence?: number };

const LABELS: Record<string, string> = {
  is_building: "Building",
  is_learning: "Learning",
  has_expertise_in: "Expertise",
  is_seeking: "Seeking",
  open_to: "Open to",
  is_affiliated_with: "Communities & orgs",
  is_located_in: "Location",
};
const CARD_ORDER = ["is_building", "is_learning", "has_expertise_in", "is_seeking", "open_to", "is_affiliated_with", "is_located_in"];

// Free-text declarable fields.
const TEXT_FIELDS = [
  { predicate: "is_building", label: "What are you building?", ph: "AI agent marketplace" },
  { predicate: "is_learning", label: "What are you learning?", ph: "Rust async runtimes" },
  { predicate: "has_expertise_in", label: "What can you help with?", ph: "distributed systems" },
  { predicate: "is_affiliated_with", label: "Communities / orgs", ph: "YC W24, Rust Discord" },
  { predicate: "is_located_in", label: "Where are you based?", ph: "San Francisco" },
];
// Multi-select declarable fields (must mirror the backend allowed values).
const SEEKING = ["co_founder", "technical_feedback", "early_users", "mentoring", "being_mentored", "peer_review", "collaboration", "investment", "community"];
const OPEN_TO = ["coffee_chat", "collaboration", "mentoring_others", "being_mentored", "peer_review", "co_founder", "early_user_testing"];

export default function FindablePage() {
  const [supabase] = useState(() => createClient());
  const [token, setToken] = useState<string | null>(null);
  const [card, setCard] = useState<Fact[]>([]);
  const [suggestions, setSuggestions] = useState<Fact[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [text, setText] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (tok: string) => {
    const [c, s] = await Promise.all([
      fetch(`${API_BASE}/me/findability`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API_BASE}/me/findability/suggestions`, { headers: { Authorization: `Bearer ${tok}` } }),
    ]);
    if (!c.ok || !s.ok) throw new Error(`Failed to load (${c.status}/${s.status})`);
    setCard(await c.json());
    setSuggestions(await s.json());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not signed in.");
        const res = await fetch(`${API_BASE}/token/exchange`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`Auth failed (${res.status})`);
        const { token: tok } = (await res.json()) as { token: string };
        await refresh(tok);
        if (!cancelled) {
          setToken(tok);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, refresh]);

  const act = useCallback(
    async (path: string, body: object) => {
      if (!token) return;
      setBusy(true);
      try {
        await fetch(`${API_BASE}/me/findability/${path}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await refresh(token);
      } finally {
        setBusy(false);
      }
    },
    [token, refresh],
  );

  const cardHas = (predicate: string, object: string) =>
    card.some((f) => f.predicate === predicate && f.object.toLowerCase() === object.toLowerCase());

  const declare = (predicate: string, value: string) => act("declare", { predicate, value });
  const approve = (f: Fact) => act("approve", { predicate: f.predicate, object: f.object });
  const revoke = (f: Fact) => act("revoke", { predicate: f.predicate, object: f.object });
  const toggleChip = (predicate: string, value: string) =>
    cardHas(predicate, value) ? revoke({ predicate, object: value }) : declare(predicate, value);

  const grouped = CARD_ORDER.map((p) => [p, card.filter((f) => f.predicate === p)] as const).filter(([, v]) => v.length);

  return (
    <div className="dashboard-page">
      <style>{CSS}</style>
      <div className="dashboard-header">
        <div>
          <h1>Be findable</h1>
          <p>Your private memory stays automatic. This is the small, public card that makes you findable to others.</p>
        </div>
      </div>

      {status === "loading" && <div className="bf-card"><p className="bf-muted">Loading your findability card…</p></div>}
      {status === "error" && <div className="bf-card"><p style={{ color: "#ff9b9b" }}>{error}</p></div>}

      {status === "ready" && (
        <>
          {suggestions.length > 0 && (
            <div className="bf-card" style={{ marginBottom: 18 }}>
              <h2 className="bf-h2">ZYND noticed these — keep them on your card?</h2>
              <p className="bf-sub">Inferred from your conversations. Nothing is public until you keep it.</p>
              <div className="bf-suggs">
                {suggestions.map((f, i) => (
                  <div key={i} className="bf-sugg">
                    <span><b>{LABELS[f.predicate] ?? f.predicate}:</b> {f.object}</span>
                    <span className="bf-actions">
                      <button className="bf-keep" disabled={busy} onClick={() => approve(f)}>Keep</button>
                      <button className="bf-dismiss" disabled={busy} onClick={() => revoke(f)}>Dismiss</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bf-card" style={{ marginBottom: 18 }}>
            <h2 className="bf-h2">You are findable for</h2>
            {grouped.length === 0 ? (
              <p className="bf-sub">Nothing public yet. Keep a suggestion above, or add details below.</p>
            ) : (
              <div className="bf-groups">
                {grouped.map(([p, facts]) => (
                  <div key={p} className="bf-group">
                    <div className="bf-glabel">{LABELS[p]}</div>
                    <div className="bf-chips">
                      {facts.map((f, i) => (
                        <span key={i} className="bf-chip">
                          {f.object}
                          <button className="bf-x" disabled={busy} onClick={() => revoke(f)} title="Remove">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bf-card">
            <h2 className="bf-h2">Add to your card</h2>
            {TEXT_FIELDS.map((field) => (
              <div key={field.predicate} className="bf-field">
                <label className="bf-label">{field.label}</label>
                <div className="bf-row">
                  <input
                    className="bf-input"
                    placeholder={field.ph}
                    value={text[field.predicate] ?? ""}
                    onChange={(e) => setText((t) => ({ ...t, [field.predicate]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (text[field.predicate] ?? "").trim()) {
                        declare(field.predicate, text[field.predicate].trim());
                        setText((t) => ({ ...t, [field.predicate]: "" }));
                      }
                    }}
                  />
                  <button
                    className="bf-add"
                    disabled={busy || !(text[field.predicate] ?? "").trim()}
                    onClick={() => {
                      declare(field.predicate, (text[field.predicate] ?? "").trim());
                      setText((t) => ({ ...t, [field.predicate]: "" }));
                    }}
                  >Add</button>
                </div>
              </div>
            ))}

            <label className="bf-label" style={{ marginTop: 18 }}>What are you seeking?</label>
            <div className="bf-chips">
              {SEEKING.map((v) => (
                <button key={v} disabled={busy} className={`bf-toggle ${cardHas("is_seeking", v) ? "on" : ""}`} onClick={() => toggleChip("is_seeking", v)}>
                  {v.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <label className="bf-label" style={{ marginTop: 16 }}>Open to</label>
            <div className="bf-chips">
              {OPEN_TO.map((v) => (
                <button key={v} disabled={busy} className={`bf-toggle ${cardHas("open_to", v) ? "on" : ""}`} onClick={() => toggleChip("open_to", v)}>
                  {v.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const CSS = `
.bf-card{background:rgba(255,255,255,.045);border:1px solid rgba(139,92,246,.16);border-radius:16px;padding:22px 22px}
.bf-h2{margin:0 0 4px;font-size:16px;font-weight:600;color:#f6f6f6}
.bf-sub{margin:0 0 14px;color:rgba(246,246,246,.7);font-size:13.5px;line-height:1.55}
.bf-muted{color:rgba(246,246,246,.6);font-size:14px;margin:0}
.bf-suggs{display:flex;flex-direction:column;gap:8px}
.bf-sugg{display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:10px 14px;font-size:13.5px;color:#e7e7ea}
.bf-actions{display:flex;gap:8px;flex-shrink:0}
.bf-keep{background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border:0;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:600;cursor:pointer}
.bf-dismiss{background:transparent;color:#9094a8;border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:6px 12px;font-size:12.5px;cursor:pointer}
.bf-groups{display:flex;flex-direction:column;gap:14px}
.bf-group{display:grid;grid-template-columns:130px 1fr;gap:10px;align-items:start}
.bf-glabel{font-size:13px;color:rgba(246,246,246,.55);padding-top:5px}
.bf-chips{display:flex;flex-wrap:wrap;gap:8px}
.bf-chip{display:inline-flex;align-items:center;gap:7px;background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.32);
  color:#dcd4ff;border-radius:999px;padding:5px 6px 5px 12px;font-size:13px}
.bf-x{background:rgba(255,255,255,.08);color:#cdd2e6;border:0;border-radius:999px;width:18px;height:18px;font-size:14px;line-height:1;cursor:pointer}
.bf-field{margin-bottom:12px}
.bf-label{display:block;font-size:13px;color:rgba(246,246,246,.7);margin:0 0 7px}
.bf-row{display:flex;gap:8px}
.bf-input{flex:1;padding:10px 13px;border-radius:10px;font-size:14px;background:#0c0c12;border:1px solid rgba(255,255,255,.1);color:#fff;outline:none}
.bf-input:focus{border-color:#8B5CF6}
.bf-add{padding:0 18px;border:0;border-radius:10px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;font-size:13.5px;font-weight:600;cursor:pointer}
.bf-add:disabled{opacity:.45;cursor:default}
.bf-toggle{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:#c7cad8;border-radius:999px;
  padding:6px 13px;font-size:13px;cursor:pointer;text-transform:capitalize}
.bf-toggle.on{background:rgba(139,92,246,.16);border-color:rgba(139,92,246,.4);color:#dcd4ff}
.bf-toggle:disabled{opacity:.6}
`;
