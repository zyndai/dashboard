"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Twitter, Linkedin, Globe, X as XIcon, ArrowLeft, ArrowRight, Upload } from "lucide-react";

import { CARDS_API } from "@/lib/cards";
import type { AgentProfileCard, OnboardStatus } from "@/lib/cards";

// ─── tokens (mirror profile page) ─────────────────────────────────────────────
const T = {
  bg:      "#f0f2f7",
  surface: "#ffffff",
  accent:  "#5b7cfa",
  navy:    "#0d1b2a",
  border:  "rgba(0,0,0,0.07)",
  shadow:  "0 1px 2px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
  pri:     "#0f172a",
  sec:     "#475569",
  tert:    "#94a3b8",
} as const;

type Phase = "form" | "working" | "review" | "error";
type UrlKind = "github" | "x" | "linkedin" | "website";

// ─── chip palette ──────────────────────────────────────────────────────────────
const CHIP: Record<UrlKind, { label: string; color: string; bg: string; border: string }> = {
  github:   { label: "GitHub",   color: "#24292e", bg: "#f1f3f5", border: "rgba(36,41,46,0.18)" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", bg: "#e8f3ff", border: "rgba(10,102,194,0.20)" },
  x:        { label: "X",        color: "#0f172a", bg: "#f1f5f9", border: "rgba(15,23,42,0.12)" },
  website:  { label: "Website",  color: "#065f46", bg: "#ecfdf5", border: "rgba(6,95,70,0.18)" },
};

function detectKind(url: string): UrlKind {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "github.com" || host.endsWith(".github.com")) return "github";
    if (host === "x.com" || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  } catch { /* invalid — treat as website */ }
  return "website";
}

function KindIcon({ kind, size = 12 }: { kind: UrlKind; size?: number }) {
  if (kind === "github")   return <Github   size={size} />;
  if (kind === "x")        return <Twitter  size={size} />;
  if (kind === "linkedin") return <Linkedin size={size} />;
  return <Globe size={size} />;
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, "").slice(0, 38);
  } catch {
    return url.slice(0, 38);
  }
}

// ─── field component ───────────────────────────────────────────────────────────
const fieldInput: React.CSSProperties = {
  width: "100%", padding: "10px 14px", fontSize: "14px",
  border: `1px solid ${T.border}`, borderRadius: "10px",
  background: "#f8fafc", color: T.pri, outline: "none",
  transition: "border-color 0.12s, background 0.12s",
  fontFamily: "inherit",
};

function TextField({
  label, value, onChange, rows, hint,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  rows?: number; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const style = { ...fieldInput, borderColor: focused ? "rgba(91,124,250,0.5)" : T.border };
  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.tert, marginBottom: "7px" }}>
        {label}
      </div>
      {rows ? (
        <textarea
          rows={rows} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...style, resize: "none" }}
        />
      ) : (
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={style}
        />
      )}
      {hint && <div style={{ fontSize: "11px", color: T.tert, marginTop: "5px" }}>{hint}</div>}
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────────
export default function CreateProfilePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<AgentProfileCard | null>(null);

  const [urls, setUrls] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function addUrl(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (!urls.includes(withProto)) setUrls((p) => [...p, withProto]);
    setInputVal("");
  }

  function removeUrl(url: string) {
    setUrls((p) => p.filter((u) => u !== url));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addUrl(inputVal); }
    else if (e.key === "Backspace" && !inputVal && urls.length > 0) {
      setUrls((p) => p.slice(0, -1));
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted) { e.preventDefault(); addUrl(pasted); }
  }

  const hasSource = urls.length > 0 || resume !== null;

  async function startOnboard(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("working");
    const form = new FormData();
    urls.forEach((u) => form.append("url", u));
    if (resume) form.append("resume", resume);
    try {
      const res = await fetch(`${CARDS_API}/onboard/start`, { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.text()) || `Status ${res.status}`);
      const data = await res.json();
      setJobId(data.job_id);
      pollRef.current = setInterval(() => pollJob(data.job_id), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
      setPhase("error");
    }
  }

  async function pollJob(id: string) {
    try {
      const res = await fetch(`${CARDS_API}/onboard/${id}`);
      if (!res.ok) return;
      const status: OnboardStatus = await res.json();
      if (status.status === "ready" && status.card) {
        if (pollRef.current) clearInterval(pollRef.current);
        setCard(status.card);
        setPhase("review");
      } else if (status.status === "error") {
        if (pollRef.current) clearInterval(pollRef.current);
        setError(status.error || "Unknown error");
        setPhase("error");
      }
    } catch { /* transient */ }
  }

  async function publish() {
    if (!card || !jobId) return;
    setError(null);
    try {
      const res = await fetch(`${CARDS_API}/onboard/${jobId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Status ${res.status}`);
      const published = await res.json();
      router.push(`/p/${published.handle || published.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
      setPhase("error");
    }
  }

  function updateCard(patch: Partial<AgentProfileCard>) {
    setCard((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <>
      <style>{`
        @keyframes chip-in {
          from { opacity: 0; transform: scale(0.85) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .chip-enter { animation: chip-in 0.18s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .url-box { transition: border-color 0.14s, box-shadow 0.14s; }
        .url-box:hover { border-color: rgba(91,124,250,0.25) !important; }

        .submit-btn { transition: background 0.14s, transform 0.1s; }
        .submit-btn:hover:not(:disabled) { background: #4a67e0 !important; }
        .submit-btn:active:not(:disabled) { transform: translateY(1px); }

        .chip-x { transition: opacity 0.12s; }
        .chip-x:hover { opacity: 1 !important; }

        @media (prefers-reduced-motion: reduce) {
          .chip-enter { animation: none; }
          .spin { animation: spin 1.5s linear infinite; }
        }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* back */}
          <Link href="/directory" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: T.tert, textDecoration: "none", marginBottom: "32px", fontWeight: 500 }}>
            <ArrowLeft size={13} />
            Directory
          </Link>

          {/* header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.accent, marginBottom: "12px", padding: "4px 10px", borderRadius: "20px", background: "rgba(91,124,250,0.08)", border: "1px solid rgba(91,124,250,0.15)" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.accent }} />
              AI-discoverable · You review first
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: T.navy, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "10px" }}>
              Add your profiles
            </div>
            <p style={{ fontSize: "14px", color: T.sec, lineHeight: 1.65, margin: 0 }}>
              Paste links to your GitHub, LinkedIn, X, or any website.
              Zynd scrapes what&apos;s public and builds your card — you approve before anything goes live.
            </p>
          </div>

          {/* ── FORM ── */}
          {phase === "form" && (
            <form onSubmit={startOnboard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* URL chip input */}
              <div
                className="url-box"
                style={{
                  background: T.surface,
                  borderRadius: "16px",
                  border: `1px solid ${inputFocused ? "rgba(91,124,250,0.4)" : T.border}`,
                  boxShadow: inputFocused ? `0 0 0 3px rgba(91,124,250,0.1), ${T.shadow}` : T.shadow,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 18px 0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "12px" }}>
                    Profiles
                  </div>

                  {/* chips + input */}
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", minHeight: "36px", cursor: "text" }}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {urls.map((url) => {
                      const kind = detectKind(url);
                      const c = CHIP[kind];
                      return (
                        <span
                          key={url}
                          className="chip-enter"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "5px 8px 5px 9px", borderRadius: "8px",
                            background: c.bg, border: `1px solid ${c.border}`,
                            color: c.color, fontSize: "12px", fontWeight: 600, lineHeight: 1,
                          }}
                        >
                          <KindIcon kind={kind} size={11} />
                          <span style={{ opacity: 0.55, fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {c.label}
                          </span>
                          <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "11px", fontWeight: 500, opacity: 0.75 }}>
                            {shortenUrl(url)}
                          </span>
                          <button
                            type="button"
                            className="chip-x"
                            onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                            style={{ display: "flex", alignItems: "center", border: "none", background: "none", cursor: "pointer", color: "inherit", padding: "0 0 0 2px", opacity: 0.35 }}
                          >
                            <XIcon size={10} />
                          </button>
                        </span>
                      );
                    })}

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => { setInputFocused(false); if (inputVal.trim()) addUrl(inputVal); }}
                      placeholder={urls.length === 0 ? "github.com/you, linkedin.com/in/you…" : "Add another…"}
                      style={{
                        flex: "1 1 160px", minWidth: "160px", border: "none", outline: "none",
                        background: "transparent", fontSize: "13px", color: T.pri,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div style={{ fontSize: "11px", color: T.tert, marginTop: "10px", paddingBottom: "14px" }}>
                    Press <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.1)", background: "#f1f5f9", fontSize: "10px", color: T.sec }}>Enter</kbd> after each URL · Backspace removes the last one
                  </div>
                </div>

                {/* divider + resume */}
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "10px" }}>
                    Résumé <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: "11px" }}>— optional</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px", width: "100%",
                      padding: "9px 12px", borderRadius: "10px",
                      border: `1px dashed ${resume ? "rgba(91,124,250,0.3)" : "rgba(0,0,0,0.12)"}`,
                      background: resume ? "rgba(91,124,250,0.04)" : "transparent",
                      cursor: "pointer", color: resume ? T.accent : T.tert,
                      fontSize: "13px", fontWeight: 500, transition: "all 0.12s",
                    }}
                  >
                    <Upload size={13} />
                    {resume ? resume.name : "Upload PDF or DOCX"}
                    {resume && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setResume(null); }}
                        style={{ marginLeft: "auto", display: "flex", alignItems: "center", color: T.tert, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        <XIcon size={12} />
                      </button>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf"
                    onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={!hasSource}
                className="submit-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", padding: "14px 20px", borderRadius: "12px",
                  background: hasSource ? T.accent : "#c7d0e8",
                  border: "none", cursor: hasSource ? "pointer" : "not-allowed",
                  color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em",
                }}
              >
                Build my card
                <ArrowRight size={16} />
              </button>

              <p style={{ textAlign: "center", fontSize: "11px", color: T.tert, margin: 0 }}>
                Publishes at{" "}
                <code style={{ padding: "1px 5px", borderRadius: "4px", background: "rgba(0,0,0,0.05)", fontSize: "10px" }}>
                  zynd.ai/p/you
                </code>{" "}
                after your review
              </p>
            </form>
          )}

          {/* ── WORKING ── */}
          {phase === "working" && (
            <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "28px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div className="spin" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2.5px solid rgba(91,124,250,0.15)", borderTopColor: T.accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: T.pri, marginBottom: "2px" }}>
                    Building your profile
                  </div>
                  <div style={{ fontSize: "12px", color: T.tert }}>Scraping sources · takes 10–30 seconds</div>
                </div>
              </div>
              {urls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {urls.map((url) => {
                    const kind = detectKind(url);
                    const c = CHIP[kind];
                    return (
                      <span key={url} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 9px", borderRadius: "6px", background: c.bg, color: c.color, fontSize: "11px", fontWeight: 600 }}>
                        <KindIcon kind={kind} size={10} />
                        {c.label}
                      </span>
                    );
                  })}
                  {resume && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 9px", borderRadius: "6px", background: "#f8fafc", color: T.sec, fontSize: "11px", fontWeight: 600 }}>
                      <Upload size={10} />
                      Résumé
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === "error" && (
            <div style={{ background: "#fff5f5", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "20px 22px", boxShadow: T.shadow }}>
              <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>
              <button
                onClick={() => setPhase("form")}
                style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: "13px", fontWeight: 600, color: T.sec }}
              >
                Try again
              </button>
            </div>
          )}

          {/* ── REVIEW ── */}
          {phase === "review" && card && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              <div style={{ background: "rgba(91,124,250,0.06)", border: "1px solid rgba(91,124,250,0.15)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#1e40af", lineHeight: 1.5 }}>
                Review your card — nothing goes live until you publish.
              </div>

              {/* identity fields */}
              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>
                  Identity
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <TextField label="Name" value={card.identity.name}
                    onChange={(v) => updateCard({ identity: { ...card.identity, name: v } })} />
                  <TextField label="Headline" value={card.identity.headline}
                    onChange={(v) => updateCard({ identity: { ...card.identity, headline: v } })} />
                  <TextField label="Location" value={card.identity.location}
                    onChange={(v) => updateCard({ identity: { ...card.identity, location: v } })} />
                </div>
              </div>

              {/* about */}
              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>
                  About
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <TextField label="Summary" value={card.summary} rows={4}
                    onChange={(v) => updateCard({ summary: v })} />
                  <TextField label="Citation snippet" value={card.citation_snippet} rows={2}
                    onChange={(v) => updateCard({ citation_snippet: v })} />
                </div>
              </div>

              {/* skills */}
              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>
                  Skills
                </div>
                <TextField label="One per line" value={card.skills.map((s) => s.name).join("\n")} rows={5}
                  onChange={(v) =>
                    updateCard({
                      skills: v.split("\n").map((n) => n.trim()).filter(Boolean)
                        .map((name, i) => card.skills[i] ?? { name, level: "intermediate", evidence_count: 0 }),
                    })
                  }
                />
              </div>

              {/* publish */}
              <button
                onClick={publish}
                className="submit-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", padding: "14px 20px", borderRadius: "12px",
                  background: T.accent, border: "none", cursor: "pointer",
                  color: "#fff", fontSize: "14px", fontWeight: 700,
                }}
              >
                Publish my card
                <ArrowRight size={16} />
              </button>
              <p style={{ textAlign: "center", fontSize: "11px", color: T.tert, margin: 0 }}>
                Creates a public page at <code style={{ padding: "1px 5px", borderRadius: "4px", background: "rgba(0,0,0,0.05)", fontSize: "10px" }}>zynd.ai/p/handle</code> and pings search engines
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
