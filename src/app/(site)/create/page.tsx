"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Twitter, Linkedin, Globe, X as XIcon, ArrowLeft, ArrowRight, Upload } from "lucide-react";

import { CARDS_API } from "@/lib/cards";
import type { AgentProfileCard, OnboardStatus } from "@/lib/cards";

// ─── tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg:      "#eef0f6",
  surface: "#ffffff",
  accent:  "#5b7cfa",
  navy:    "#0d1b2a",
  border:  "rgba(0,0,0,0.10)",
  shadow:  "0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",
  pri:     "#0f172a",
  sec:     "#475569",
  tert:    "#94a3b8",
} as const;

type Phase   = "form" | "working" | "review" | "error";
type UrlKind = "github" | "x" | "linkedin" | "website";

// ─── chip palette ─────────────────────────────────────────────────────────────
const CHIP: Record<UrlKind, { label: string; color: string; bg: string; border: string }> = {
  github:   { label: "GitHub",   color: "#24292e", bg: "#f1f3f5", border: "rgba(36,41,46,0.18)" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", bg: "#e8f3ff", border: "rgba(10,102,194,0.20)" },
  x:        { label: "X",        color: "#0f172a", bg: "#f1f5f9", border: "rgba(15,23,42,0.12)" },
  website:  { label: "Website",  color: "#065f46", bg: "#ecfdf5", border: "rgba(6,95,70,0.18)" },
};

const QUICK_ADD: { kind: UrlKind; domain: string }[] = [
  { kind: "github",   domain: "github.com/" },
  { kind: "linkedin", domain: "linkedin.com/in/" },
  { kind: "x",        domain: "x.com/" },
  { kind: "website",  domain: "" },
];

// ─── one-at-a-time questions shown during extraction ─────────────────────────
type QuestionType = "chips" | "text";
const QUESTIONS: { id: string; label: string; type: QuestionType; options?: string[] }[] = [
  {
    id: "working_on", type: "chips",
    label: "What are you working on?",
    options: ["Building a startup", "At a company", "Doing research", "Freelancing", "Open source", "Side project", "Investing", "Job hunting"],
  },
  {
    id: "can_help", type: "chips",
    label: "What can you help people with?",
    options: ["Code review", "Fundraising", "ML / AI", "Technical interviews", "Hiring", "Design", "Go-to-market", "Investing"],
  },
  {
    id: "connect_with", type: "chips",
    label: "Who would you like to connect with?",
    options: ["Founders", "Investors", "Engineers", "ML Researchers", "Product Managers", "Designers", "Operators", "Scientists"],
  },
  {
    id: "love_talking", type: "chips",
    label: "What do you love talking about?",
    options: ["AI / ML", "Web3 / Crypto", "Startups", "Open source", "Design", "Climate tech", "Developer tools", "Research"],
  },
  {
    id: "location", type: "text",
    label: "Where are you based?",
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function detectKind(url: string): UrlKind {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "github.com" || host.endsWith(".github.com")) return "github";
    if (host === "x.com" || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  } catch { /* invalid — treat as website */ }
  return "website";
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, "").slice(0, 38);
  } catch {
    return url.slice(0, 38);
  }
}

function KindIcon({ kind, size = 12 }: { kind: UrlKind; size?: number }) {
  if (kind === "github")   return <Github   size={size} />;
  if (kind === "x")        return <Twitter  size={size} />;
  if (kind === "linkedin") return <Linkedin size={size} />;
  return <Globe size={size} />;
}

// ─── field ────────────────────────────────────────────────────────────────────
const fieldBase: React.CSSProperties = {
  width: "100%", padding: "10px 14px", fontSize: "14px",
  border: `1px solid ${T.border}`, borderRadius: "10px",
  background: "#f8fafc", color: T.pri, outline: "none",
  transition: "border-color 0.12s, background 0.12s", fontFamily: "inherit",
};

function TextField({ label, value, onChange, rows, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const style = { ...fieldBase, borderColor: focused ? "rgba(91,124,250,0.5)" : T.border };
  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.tert, marginBottom: "7px" }}>
        {label}
      </div>
      {rows ? (
        <textarea rows={rows} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...style, resize: "none" }} />
      ) : (
        <input type="text" value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={style} />
      )}
    </div>
  );
}

// ─── apply user answers to card ───────────────────────────────────────────────
function applyAnswers(
  card: AgentProfileCard,
  selections: Record<string, Set<string>>,
  customs: Record<string, string>,
  locationInput: string,
): AgentProfileCard {
  let c = { ...card, identity: { ...card.identity }, skills: [...card.skills], searchable_facts: [...card.searchable_facts] };

  const joinAnswers = (id: string) => [
    ...(selections[id] ?? new Set<string>()),
    ...(customs[id]?.trim() ? [customs[id].trim()] : []),
  ];

  const name = c.identity.name || "This person";

  const workingOn = joinAnswers("working_on");
  if (workingOn.length > 0) {
    c.searchable_facts = [...c.searchable_facts, `${name} — working on ${workingOn.join(", ")} — Zynd`];
    if (!c.summary) c.summary = `Currently working on: ${workingOn.join(", ")}.`;
  }

  const canHelp = joinAnswers("can_help");
  if (canHelp.length > 0) {
    const newSkills = canHelp
      .map(n => ({ name: n, level: "intermediate" as const, evidence_count: 1 }))
      .filter(ns => !c.skills.find(s => s.name.toLowerCase() === ns.name.toLowerCase()));
    c.skills = [...c.skills, ...newSkills];
  }

  const connectWith = joinAnswers("connect_with");
  if (connectWith.length > 0) {
    c.searchable_facts = [...c.searchable_facts, `${name} — looking to connect with ${connectWith.join(", ")} — Zynd`];
  }

  const loveTalking = joinAnswers("love_talking");
  if (loveTalking.length > 0) {
    c.searchable_facts = [...c.searchable_facts, `${name} — loves talking about ${loveTalking.join(", ")} — Zynd`];
  }

  // Only use user-typed location if extraction didn't find one
  if (!c.identity.location && locationInput.trim()) {
    c.identity.location = locationInput.trim();
  }

  return c;
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function CreateProfilePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<AgentProfileCard | null>(null);

  // URL chip input
  const [urls, setUrls] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // One-at-a-time questions
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({
    working_on: new Set(), can_help: new Set(), connect_with: new Set(), love_talking: new Set(),
  });
  const [customs, setCustoms] = useState<Record<string, string>>({
    working_on: "", can_help: "", connect_with: "", love_talking: "",
  });
  const [locationInput, setLocationInput] = useState("");

  const [jobDone, setJobDone] = useState(false);
  const pendingCardRef = useRef<AgentProfileCard | null>(null);
  const questionIndexRef = useRef(0);
  const jobDoneRef = useRef(false);
  const selectionsRef = useRef(selections);
  const customsRef = useRef(customs);
  const locationRef = useRef(locationInput);

  // Keep refs in sync
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { customsRef.current = customs; }, [customs]);
  useEffect(() => { locationRef.current = locationInput; }, [locationInput]);

  const fileRef    = useRef<HTMLInputElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const customRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  // ── URL chip helpers ──
  function addUrl(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (!urls.includes(withProto)) setUrls(p => [...p, withProto]);
    setInputVal("");
  }

  function removeUrl(url: string) { setUrls(p => p.filter(u => u !== url)); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addUrl(inputVal); }
    else if (e.key === "Backspace" && !inputVal && urls.length > 0) setUrls(p => p.slice(0, -1));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (!pasted) return;
    e.preventDefault();
    pasted.split(/\s+/).forEach(addUrl);
  }

  // ── Option picker helpers ──
  function toggleOption(id: string, opt: string) {
    setSelections(prev => {
      const next = new Set(prev[id]);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return { ...prev, [id]: next };
    });
  }

  // ── Submit ──
  const hasSource = urls.length > 0 || resume !== null;

  async function startOnboard(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("working");
    const form = new FormData();
    urls.forEach(u => form.append("url", u));
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

  function goToReview(rawCard: AgentProfileCard) {
    const enriched = applyAnswers(rawCard, selectionsRef.current, customsRef.current, locationRef.current);
    setCard(enriched);
    setPhase("review");
  }

  async function pollJob(id: string) {
    try {
      const res = await fetch(`${CARDS_API}/onboard/${id}`);
      if (!res.ok) return;
      const status: OnboardStatus = await res.json();
      if (status.status === "ready" && status.card) {
        clearInterval(pollRef.current!);
        pendingCardRef.current = status.card;
        jobDoneRef.current = true;
        setJobDone(true);
        // If user already answered all questions, go to review immediately
        if (questionIndexRef.current >= QUESTIONS.length) {
          goToReview(status.card);
        }
        // else: user still on questions — they'll trigger goToReview via Next/Done button
      } else if (status.status === "error") {
        clearInterval(pollRef.current!);
        setError(status.error || "Unknown error");
        setPhase("error");
      }
    } catch { /* transient */ }
  }

  function advanceQuestion() {
    const next = questionIndexRef.current + 1;
    questionIndexRef.current = next;
    setQuestionIndex(next);
    if (next >= QUESTIONS.length && jobDoneRef.current && pendingCardRef.current) {
      goToReview(pendingCardRef.current);
    }
  }

  async function publish() {
    if (!card || !jobId) return;
    setError(null);
    const userAnswers: Record<string, string> = {};
    for (const q of QUESTIONS) {
      if (q.type === "chips") {
        const parts = [...(selections[q.id] ?? new Set<string>()), ...(customs[q.id]?.trim() ? [customs[q.id].trim()] : [])];
        if (parts.length > 0) userAnswers[q.id] = parts.join(", ");
      } else if (q.id === "location" && locationInput.trim()) {
        userAnswers["location"] = locationInput.trim();
      }
    }
    try {
      const res = await fetch(`${CARDS_API}/onboard/${jobId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, user_answers: userAnswers }),
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
    setCard(prev => prev ? { ...prev, ...patch } : prev);
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

        @keyframes check-pop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-pop { animation: check-pop 0.22s cubic-bezier(0.16,1,0.3,1) both; }

        .url-inner { transition: border-color 0.14s, box-shadow 0.14s; }
        .url-inner:hover { border-color: rgba(0,0,0,0.2) !important; }

        .quick-btn { transition: background 0.12s, border-color 0.12s, color 0.12s; }
        .quick-btn:hover { background: rgba(91,124,250,0.08) !important; border-color: rgba(91,124,250,0.25) !important; color: #5b7cfa !important; }

        .opt-btn { transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.1s; cursor: pointer; }
        .opt-btn:hover { border-color: rgba(91,124,250,0.4) !important; }
        .opt-btn:active { transform: scale(0.96); }

        .submit-btn { transition: opacity 0.14s, transform 0.1s, box-shadow 0.14s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; box-shadow: 0 4px 20px rgba(91,124,250,0.4) !important; }
        .submit-btn:active:not(:disabled) { transform: translateY(1px); }

        .chip-x { transition: opacity 0.12s; }
        .chip-x:hover { opacity: 1 !important; }

        @media (prefers-reduced-motion: reduce) {
          .chip-enter, .check-pop { animation: none; }
          .spin { animation: spin 1.5s linear infinite; }
        }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px 80px" }}>

          <Link href="/directory" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: T.tert, textDecoration: "none", marginBottom: "32px", fontWeight: 500 }}>
            <ArrowLeft size={13} />
            Directory
          </Link>

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
              <div style={{ background: T.surface, borderRadius: "20px", border: `1.5px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
                <div style={{ padding: "20px 20px 0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "10px" }}>
                    Profiles
                  </div>

                  {/* chip input */}
                  <div
                    className="url-inner"
                    style={{
                      background: "#f7f9fc",
                      border: `1.5px solid ${inputFocused ? T.accent : "rgba(0,0,0,0.13)"}`,
                      boxShadow: inputFocused ? "0 0 0 3px rgba(91,124,250,0.12)" : "inset 0 1px 2px rgba(0,0,0,0.04)",
                      borderRadius: "12px", padding: "10px 12px", cursor: "text",
                      minHeight: "52px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center",
                    }}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {urls.map(url => {
                      const kind = detectKind(url);
                      const c = CHIP[kind];
                      return (
                        <span key={url} className="chip-enter" style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px 5px 9px", borderRadius: "8px", background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontSize: "12px", fontWeight: 500, lineHeight: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap" }}>
                          <KindIcon kind={kind} size={12} />
                          <span style={{ fontWeight: 600 }}>{c.label}</span>
                          <span style={{ opacity: 0.65, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>{shortenUrl(url)}</span>
                          <button type="button" className="chip-x" onClick={e => { e.stopPropagation(); removeUrl(url); }} style={{ display: "flex", alignItems: "center", border: "none", background: "none", cursor: "pointer", color: "inherit", padding: "0 0 0 1px", opacity: 0.35, marginLeft: "1px" }}>
                            <XIcon size={10} />
                          </button>
                        </span>
                      );
                    })}
                    <input
                      ref={inputRef} type="text" value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown} onPaste={handlePaste}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => { setInputFocused(false); if (inputVal.trim()) addUrl(inputVal); }}
                      placeholder={urls.length === 0 ? "github.com/you  or  linkedin.com/in/you" : "Add another URL…"}
                      style={{ flex: "1 1 180px", minWidth: "180px", border: "none", outline: "none", background: "transparent", fontSize: "13px", color: T.pri, fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      {QUICK_ADD.filter(q => q.domain).map(({ kind, domain }) => (
                        <button key={kind} type="button" className="quick-btn"
                          onClick={() => { setInputVal(domain); inputRef.current?.focus(); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.10)", background: "transparent", cursor: "pointer", color: T.sec, fontSize: "11px", fontWeight: 500 }}>
                          <KindIcon kind={kind} size={11} />
                          {CHIP[kind].label}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: T.tert }}>Space or Enter to add</span>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "10px" }}>
                    Résumé <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: "11px" }}>— optional</span>
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "9px 12px", borderRadius: "10px", border: `1px dashed ${resume ? "rgba(91,124,250,0.3)" : "rgba(0,0,0,0.12)"}`, background: resume ? "rgba(91,124,250,0.04)" : "transparent", cursor: "pointer", color: resume ? T.accent : T.tert, fontSize: "13px", fontWeight: 500, transition: "all 0.12s" }}>
                    <Upload size={13} />
                    {resume ? resume.name : "Upload PDF or DOCX"}
                    {resume && (
                      <button type="button" onClick={e => { e.stopPropagation(); setResume(null); }}
                        style={{ marginLeft: "auto", display: "flex", alignItems: "center", color: T.tert, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <XIcon size={12} />
                      </button>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,application/pdf" onChange={e => setResume(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                </div>
              </div>

              <button type="submit" disabled={!hasSource} className="submit-btn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px 20px", borderRadius: "14px", background: T.accent, opacity: hasSource ? 1 : 0.35, border: "none", cursor: hasSource ? "pointer" : "not-allowed", color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em", boxShadow: hasSource ? "0 4px 16px rgba(91,124,250,0.3)" : "none" }}>
                Build my card
                <ArrowRight size={16} />
              </button>

              <p style={{ textAlign: "center", fontSize: "11px", color: T.tert, margin: 0 }}>
                Publishes at{" "}
                <code style={{ padding: "1px 5px", borderRadius: "4px", background: "rgba(0,0,0,0.05)", fontSize: "10px" }}>zynd.ai/p/you</code>
                {" "}after your review
              </p>
            </form>
          )}

          {/* ── WORKING ── */}
          {phase === "working" && (() => {
            const q = QUESTIONS[questionIndex];
            const isLast = questionIndex === QUESTIONS.length - 1;
            const isDone = questionIndex >= QUESTIONS.length;

            // "Finishing up" screen — user answered all questions, waiting for job
            if (isDone) {
              return (
                <div style={{ background: T.surface, borderRadius: "20px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "48px 32px", textAlign: "center" }}>
                  <div className="spin" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2.5px solid rgba(91,124,250,0.15)", borderTopColor: T.accent, margin: "0 auto 20px" }} />
                  <div style={{ fontSize: "16px", fontWeight: 600, color: T.pri, marginBottom: "6px" }}>Finishing up…</div>
                  <div style={{ fontSize: "13px", color: T.tert }}>Building your card, almost there</div>
                </div>
              );
            }

            return (
              <div style={{ background: T.surface, borderRadius: "20px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "32px 28px" }}>
                {/* Progress dots */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
                  {QUESTIONS.map((_, i) => (
                    <div key={i} style={{
                      width: i === questionIndex ? "20px" : "6px", height: "6px",
                      borderRadius: "3px", background: i <= questionIndex ? T.accent : "rgba(0,0,0,0.10)",
                      transition: "all 0.25s",
                    }} />
                  ))}
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: T.tert, fontWeight: 500 }}>
                    {questionIndex + 1} of {QUESTIONS.length}
                  </span>
                </div>

                {/* Question */}
                <div style={{ fontSize: "22px", fontWeight: 700, color: T.navy, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: "24px" }}>
                  {q.label}
                </div>

                {/* Chips question */}
                {q.type === "chips" && q.options && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginBottom: "24px" }}>
                    {q.options.map(opt => {
                      const selected = (selections[q.id] ?? new Set<string>()).has(opt);
                      return (
                        <button key={opt} type="button" className="opt-btn"
                          onClick={() => toggleOption(q.id, opt)}
                          style={{
                            padding: "10px 18px", borderRadius: "100px",
                            border: `1.5px solid ${selected ? T.accent : "rgba(0,0,0,0.10)"}`,
                            background: selected ? "rgba(91,124,250,0.08)" : T.surface,
                            color: selected ? T.accent : T.sec,
                            fontSize: "14px", fontWeight: selected ? 600 : 400,
                            userSelect: "none",
                          }}>
                          {opt}
                        </button>
                      );
                    })}
                    {/* Custom "Other" input */}
                    <input
                      ref={el => { customRefs.current[q.id] = el; }}
                      type="text"
                      value={customs[q.id] ?? ""}
                      onChange={e => setCustoms(p => ({ ...p, [q.id]: e.target.value }))}
                      placeholder="Other…"
                      style={{
                        padding: "10px 16px", borderRadius: "100px",
                        border: `1.5px solid ${customs[q.id] ? T.accent : "rgba(0,0,0,0.10)"}`,
                        background: T.surface, color: T.pri, fontSize: "14px",
                        outline: "none", fontFamily: "inherit", width: "100px",
                        transition: "border-color 0.12s, width 0.2s",
                      }}
                      onFocus={e => (e.target.style.width = "160px")}
                      onBlur={e => (e.target.style.width = customs[q.id] ? "160px" : "100px")}
                    />
                  </div>
                )}

                {/* Text question (location) */}
                {q.type === "text" && (
                  <div style={{ marginBottom: "24px" }}>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      autoFocus
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: "12px",
                        border: `1.5px solid ${locationInput ? T.accent : "rgba(0,0,0,0.10)"}`,
                        background: "#f8fafc", color: T.pri, fontSize: "15px",
                        outline: "none", fontFamily: "inherit",
                        transition: "border-color 0.12s",
                        boxSizing: "border-box",
                      }}
                      onKeyDown={e => { if (e.key === "Enter") advanceQuestion(); }}
                    />
                    <div style={{ fontSize: "12px", color: T.tert, marginTop: "6px" }}>optional — skip if you prefer</div>
                  </div>
                )}

                {/* Nav buttons */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                  <button type="button" onClick={advanceQuestion}
                    style={{ padding: "9px 16px", borderRadius: "10px", border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", color: T.tert, fontSize: "13px", fontWeight: 500 }}>
                    Skip
                  </button>
                  <button type="button" className="submit-btn" onClick={advanceQuestion}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: T.accent, border: "none", cursor: "pointer", color: "#fff", fontSize: "13px", fontWeight: 700, boxShadow: "0 4px 14px rgba(91,124,250,0.3)" }}>
                    {isLast ? "Done" : "Next"}
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Subtle source chips at bottom */}
                {urls.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "24px", paddingTop: "18px", borderTop: `1px solid ${T.border}` }}>
                    {urls.map(url => {
                      const kind = detectKind(url);
                      const c = CHIP[kind];
                      return (
                        <span key={url} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px 3px 7px", borderRadius: "6px", background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontSize: "11px", fontWeight: 500 }}>
                          <KindIcon kind={kind} size={10} />
                          <span style={{ opacity: 0.7 }}>{shortenUrl(url)}</span>
                        </span>
                      );
                    })}
                    <span style={{ fontSize: "11px", color: T.tert, alignSelf: "center", marginLeft: "4px" }}>
                      {jobDone ? "✓ scraped" : "scraping…"}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── ERROR ── */}
          {phase === "error" && (
            <div style={{ background: "#fff5f5", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "20px 22px", boxShadow: T.shadow }}>
              <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>
              <button onClick={() => setPhase("form")} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: "13px", fontWeight: 600, color: T.sec }}>
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

              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>Identity</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <TextField label="Name" value={card.identity.name} onChange={v => updateCard({ identity: { ...card.identity, name: v } })} />
                  <TextField label="Headline" value={card.identity.headline} onChange={v => updateCard({ identity: { ...card.identity, headline: v } })} />
                  <TextField label="Location" value={card.identity.location} placeholder="e.g. San Francisco, CA" onChange={v => updateCard({ identity: { ...card.identity, location: v } })} />
                </div>
              </div>

              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>About</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <TextField label="Summary" value={card.summary} rows={4} onChange={v => updateCard({ summary: v })} />
                  <TextField label="Citation snippet" value={card.citation_snippet} rows={2} onChange={v => updateCard({ citation_snippet: v })} />
                </div>
              </div>

              <div style={{ background: T.surface, borderRadius: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.tert, marginBottom: "16px" }}>Skills</div>
                <TextField label="One per line" value={card.skills.map(s => s.name).join("\n")} rows={5}
                  onChange={v => updateCard({
                    skills: v.split("\n").map(n => n.trim()).filter(Boolean)
                      .map((name, i) => card.skills[i] ?? { name, level: "intermediate", evidence_count: 0 }),
                  })}
                />
              </div>

              <button onClick={publish} className="submit-btn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px 20px", borderRadius: "12px", background: T.accent, border: "none", cursor: "pointer", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
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
