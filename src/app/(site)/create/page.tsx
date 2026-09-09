"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

import { CARDS_API } from "@/lib/cards";
import type { AgentProfileCard, OnboardStatus, Project, WritingSample } from "@/lib/cards";

// ─── tokens (from the Zynd Create Profile design) ────────────────────────────
const T = {
  page:     "#E6E6E3",
  shell:    "#F7F7F4",
  card:     "#EFEFEB",
  surface:  "#F7F7F4",
  accent:   "#7B72E9",
  accentHi: "#6157DE",
  ink:      "#0B0B0B",
  soft:     "#6E6E68",
  muted:    "#8E8E88",
  faint:    "#A8A8A2",
  border:   "#DEDED8",
  dashed:   "#CFCFC8",
  dotOff:   "#D6D6D0",
  onPanel:  "#DCD8FF",
  onPanel2: "#C9C3FF",
  ctaOffBg: "#DDDAF8",
  ctaOffInk:"#9A94D8",
} as const;

// Geist / Geist Mono / Space Grotesk are the design's three faces. Loaded via
// next/font so they self-host and don't fight the site-wide Webflow CSS.
const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--zc-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--zc-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--zc-display" });
const FONT_VARS = `${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`;

const SANS = "var(--zc-sans), system-ui, -apple-system, sans-serif";
const DISPLAY = "var(--zc-display), system-ui, sans-serif";
const MONO = "var(--zc-mono), ui-monospace, monospace";

type Phase   = "form" | "working" | "review" | "error";
type UrlKind = "github" | "x" | "linkedin" | "website";

// ─── source palette (small colour square per source, per the design) ─────────
const CHIP: Record<UrlKind, { label: string; swatch: string }> = {
  github:   { label: "GitHub",   swatch: "#0B0B0B" },
  linkedin: { label: "LinkedIn", swatch: "#0A66C2" },
  x:        { label: "X",        swatch: "#1C1C1C" },
  website:  { label: "Website",  swatch: "#7B72E9" },
};

const QUICK_ADD: { kind: UrlKind; domain: string }[] = [
  { kind: "github",   domain: "github.com/" },
  { kind: "linkedin", domain: "linkedin.com/in/" },
  { kind: "x",        domain: "x.com/" },
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
  {
    id: "calendly_url", type: "text",
    label: "Got a Calendly?",
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

function KindSquare({ kind, size = 13 }: { kind: UrlKind; size?: number }) {
  const bg = CHIP[kind].swatch;
  const r = Math.max(3, Math.round(size * 0.3));
  const p = size * 0.15;
  const inner = size - p * 2;
  return (
    <span style={{ width: size, height: size, borderRadius: r, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={inner} height={inner} viewBox="0 0 16 16" fill="none" aria-hidden>
        {kind === "github" && (
          <path fill="#fff" fillRule="evenodd" d="M8 .5C3.858.5.5 3.882.5 8.056a7.56 7.56 0 0 0 5.129 7.17c.374.077.51-.163.51-.363 0-.175-.012-.775-.012-1.4-2.085.45-2.52-.9-2.52-.9-.337-.875-.832-1.1-.832-1.1-.682-.463.05-.463.05-.463.757.05 1.156.775 1.156.775.67 1.15 1.75.825 2.184.625.062-.487.261-.825.473-1.012-1.664-.175-3.415-.825-3.415-3.725 0-.825.299-1.5.77-2.025-.075-.187-.336-.963.074-2 0 0 .633-.2 2.06.775A7.2 7.2 0 0 1 8 5.156c.633 0 1.28.087 1.875.25 1.428-.975 2.061-.775 2.061-.775.41 1.038.15 1.813.074 2 .473.525.77 1.2.77 2.025 0 2.9-1.752 3.538-3.428 3.725.274.238.509.688.509 1.4 0 1.013-.012 1.825-.012 2.075 0 .2.136.438.509.363A7.56 7.56 0 0 0 15.5 8.056C15.5 3.882 12.142.5 8 .5" clipRule="evenodd" />
        )}
        {kind === "linkedin" && (
          <>
            <rect x="1" y="1" width="14" height="14" rx="2.5" fill="#0A66C2" />
            <path fill="#fff" d="M4.2 6.4h1.8V12H4.2V6.4zm.9-2.8a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1zM7.4 6.4h1.73v.76h.02c.24-.46.83-.95 1.71-.95 1.83 0 2.17 1.2 2.17 2.77V12h-1.8V9.32c0-.67-.01-1.53-.93-1.53-.94 0-1.08.73-1.08 1.48V12H7.4V6.4z" />
          </>
        )}
        {kind === "x" && (
          <path fill="#fff" fillRule="evenodd" d="M1.5 1.5h3.9l2.28 3.24 2.67-3.24H12l-3.6 4.38L13 14.5H9.1L6.63 11l-3 3.5H2l3.87-4.5zm2.1 1.2 6.6 9.6h1.2L4.8 2.7z" clipRule="evenodd" />
        )}
        {kind === "website" && (
          <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5" fill="none" />
        )}
      </svg>
    </span>
  );
}

// ─── field ────────────────────────────────────────────────────────────────────
function TextField({ label, value, onChange, rows, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) {
  const style: React.CSSProperties = {
    width: "100%", padding: "13px 15px", fontSize: "15px", lineHeight: 1.5,
    border: `1px solid ${T.border}`, borderRadius: "14px",
    background: T.surface, color: T.ink, outline: "none",
    fontFamily: SANS, boxSizing: "border-box",
    transition: "border-color .14s",
  };
  return (
    <div>
      <div style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted, marginBottom: "9px" }}>
        {label}
      </div>
      {rows ? (
        <textarea rows={rows} value={value} placeholder={placeholder} className="zc-field"
          onChange={e => onChange(e.target.value)}
          style={{ ...style, resize: "none" }} />
      ) : (
        <input type="text" value={value} placeholder={placeholder} className="zc-field"
          onChange={e => onChange(e.target.value)}
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
  const c = { ...card, identity: { ...card.identity }, skills: [...card.skills], searchable_facts: [...card.searchable_facts] };

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

// ─── avatar with a fallback for dead / hotlink-blocked scraped URLs ──────────
function Avatar({ url, name }: { url: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <span className="zc-avatar" style={{ background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `600 22px/1 ${DISPLAY}` }}>
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="zc-avatar" onError={() => setBroken(true)} />;
}

// ─── review section header (label · total, plus a hint once rows are removed) ─
function SectionLabel({ label, total, kept }: { label: string; total?: number; kept?: number }) {
  const removed = total !== undefined && kept !== undefined && kept < total;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>
        {label}{total !== undefined ? ` · ${total}` : ""}
      </span>
      {removed && (
        <span style={{ font: `400 12px/1 ${SANS}`, color: T.accentHi }}>{kept} will publish</span>
      )}
    </div>
  );
}

// ─── review-screen exclusions ─────────────────────────────────────────────────
const projectKey = (p: Project, i: number) => `project:${p.url || i}`;
const sampleKey  = (i: number) => `sample:${i}`;

/** The card as it will be published: scraped rows the user removed are dropped. */
function publishableCard(card: AgentProfileCard, excluded: Set<string>): AgentProfileCard {
  if (excluded.size === 0) return card;
  return {
    ...card,
    projects: card.projects.filter((p, i) => !excluded.has(projectKey(p, i))),
    writing_samples: card.writing_samples.filter((_, i) => !excluded.has(sampleKey(i))),
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function CreateProfilePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<AgentProfileCard | null>(null);

  // Review-screen exclusions. Kept out of `card` so removing a scraped project
  // or post is restorable — the filter is applied once, when publishing.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  // URL chip input
  const [urls, setUrls] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
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
  const [calendlyInput, setCalendlyInput] = useState("");

  const [jobDone, setJobDone] = useState(false);
  const pendingCardRef = useRef<AgentProfileCard | null>(null);
  const questionIndexRef = useRef(0);
  const jobDoneRef = useRef(false);
  const selectionsRef = useRef(selections);
  const customsRef = useRef(customs);
  const locationRef = useRef(locationInput);
  const calendlyRef = useRef(calendlyInput);

  // Keep refs in sync
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { customsRef.current = customs; }, [customs]);
  useEffect(() => { locationRef.current = locationInput; }, [locationInput]);
  useEffect(() => { calendlyRef.current = calendlyInput; }, [calendlyInput]);

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
    try {
      const u = new URL(withProto);
      const host = u.hostname.toLowerCase();
      const needsHandle =
        host === "github.com" || host === "x.com" || host === "twitter.com" ||
        host === "linkedin.com";
      const pathPart = u.pathname.replace(/^\//, "").split("/")[0];
      if (needsHandle && !pathPart) {
        setUrlError(`Include your username — e.g. ${host}/yourusername`);
        return;
      }
    } catch { /* invalid URL — allow through so user sees it */ }
    setUrlError(null);
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
    let next = questionIndexRef.current + 1;
    // Skip location question when extraction already found one
    const locIdx = QUESTIONS.findIndex(q => q.id === "location");
    if (next === locIdx && pendingCardRef.current?.identity.location) {
      next += 1;
    }
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
      } else if (q.id === "calendly_url" && calendlyInput.trim()) {
        userAnswers["calendly_url"] = calendlyInput.trim();
      }
    }
    try {
      const res = await fetch(`${CARDS_API}/onboard/${jobId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card: publishableCard(card, excluded), user_answers: userAnswers }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Status ${res.status}`);
      const published = await res.json();
      router.push(`/p/${published.handle || published.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
      setPhase("error");
    }
  }

  function toggleExcluded(key: string) {
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function updateCard(patch: Partial<AgentProfileCard>) {
    setCard(prev => prev ? { ...prev, ...patch } : prev);
  }

  // ── panel copy shifts with the phase; the panel itself never moves ──
  const panel =
    phase === "review"
      ? {
          badge: "Nothing is live yet · You approve",
          title: <>Review<br />your card</>,
          body: "Every line came from what's public. Edit anything that reads wrong — publishing is the only step that makes it visible.",
        }
      : {
          badge: "AI-discoverable · You review first",
          title: <>Add your<br />profiles</>,
          body: "Paste links to your GitHub, LinkedIn, X, or any website. Zynd scrapes what's public and builds your card — you approve before anything goes live.",
        };

  return (
    <>
      <style>{`
        /* The site-wide Webflow sheet styles bare h1/p/button and puts
           letter-spacing:-.05em on body — neutralise all of it inside this page. */
        .zc-root, .zc-root * { box-sizing: border-box; letter-spacing: normal; }
        .zc-root h1, .zc-root h2, .zc-root p { margin: 0; text-align: left; text-transform: none;
          background-image: none; -webkit-text-fill-color: currentColor; background-clip: border-box;
          -webkit-background-clip: border-box; font-weight: inherit; }
        .zc-root button, .zc-root input, .zc-root textarea { font-family: inherit; -webkit-appearance: none; appearance: none; }
        .zc-root input::placeholder, .zc-root textarea::placeholder { color: ${T.faint}; }

        .zc-root { min-height: 100vh; background: ${T.page}; padding: 44px 36px 36px; box-sizing: border-box; font-family: ${SANS}; color: ${T.ink}; line-height: 1.4; }
        .zc-shell { max-width: 1440px; margin-inline: auto; background: ${T.shell}; border-radius: 34px; padding: 30px 32px 36px; display: flex; flex-direction: column; gap: 22px; box-sizing: border-box; }
        .zc-grid { display: grid; grid-template-columns: 472px minmax(0,1fr); gap: 16px; align-items: start; }
        .zc-panel { background: ${T.accent}; border-radius: 26px; padding: 34px 32px 30px; display: flex; flex-direction: column; gap: 30px; position: relative; overflow: hidden; min-height: 498px; box-sizing: border-box; }
        /* globals.css sets \`h1,h2 { font-family/weight/transform ... !important }\`
           for the landing page — this panel opts out of that treatment. */
        .zc-root h1.zc-panel-title {
          font-family: ${DISPLAY} !important;
          font-weight: 700 !important;
          font-size: 54px;
          line-height: 1.02;
          text-transform: none !important;
          letter-spacing: -.035em !important;
          color: #fff; -webkit-text-fill-color: #fff;
        }
        .zc-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .zc-card { background: ${T.card}; border-radius: 26px; box-sizing: border-box; }
        .zc-step-card { min-height: 498px; }
        .zc-question { font: 700 34px/1.15 ${DISPLAY}; color: ${T.ink}; letter-spacing: -.03em; text-wrap: pretty; }
        .zc-ctarow { display: grid; grid-template-columns: minmax(0,1fr) 236px; gap: 16px; align-items: stretch; }

        .zc-back { transition: color .12s; }
        .zc-back:hover { color: ${T.ink} !important; text-decoration: none; }

        .zc-inputbox { transition: border-color .14s, box-shadow .14s; }
        .zc-inputbox:hover { border-color: ${T.faint}; }

        .zc-quick { transition: border-color .12s, color .12s; }
        .zc-quick:hover { border-color: ${T.accent} !important; }

        .zc-drop { transition: border-color .12s, background .12s; }
        .zc-drop:hover { border-color: ${T.accent} !important; }

        .zc-opt { transition: background .12s, border-color .12s, color .12s, transform .1s; cursor: pointer; }
        .zc-opt:hover { border-color: ${T.accent}; }
        .zc-opt:active { transform: scale(.97); }

        .zc-ghost { transition: border-color .12s, color .12s; }
        .zc-ghost:hover { border-color: ${T.ink} !important; color: ${T.ink} !important; }

        .zc-primary { transition: background .12s, transform .1s; }
        .zc-primary:hover:not(:disabled) { background: ${T.accentHi}; }
        .zc-primary:active:not(:disabled) { transform: translateY(1px); }

        .zc-cta { transition: background .12s, transform .1s; }
        .zc-cta:not(:disabled):hover { background: ${T.accentHi}; }
        .zc-cta:not(:disabled):active { transform: translateY(1px); }

        .zc-field:focus { border-color: ${T.accent}; }

        /* removable scraped rows (projects, posts, links) */
        .zc-row { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 16px;
          padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px;
          transition: opacity .14s, border-color .14s; }
        .zc-row:hover { border-color: ${T.faint}; }
        .zc-row.off { opacity: .5; }
        .zc-row.off .zc-row-main { text-decoration: line-through; }
        .zc-rowbtn { background: none; border: none; padding: 0; cursor: pointer;
          font: 400 13px/1 ${SANS}; color: ${T.faint}; flex-shrink: 0; transition: color .12s; }
        .zc-rowbtn:hover { color: ${T.ink}; }
        .zc-clamp1, .zc-clamp2 { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
        .zc-clamp1 { -webkit-line-clamp: 1; }
        .zc-clamp2 { -webkit-line-clamp: 2; }
        .zc-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
          border: 1px solid ${T.border}; flex-shrink: 0; display: block; }
        .zc-x { transition: color .12s; }
        .zc-x:hover { color: #fff !important; }

        @keyframes zc-chip-in { from { opacity: 0; transform: scale(.9) translateY(3px); } to { opacity: 1; transform: none; } }
        .zc-chip-enter { animation: zc-chip-in .18s cubic-bezier(.16,1,.3,1) both; }
        @keyframes zc-spin { to { transform: rotate(360deg); } }
        .zc-spin { animation: zc-spin .9s linear infinite; }

        @media (max-width: 1040px) {
          .zc-grid { grid-template-columns: minmax(0,1fr); }
          .zc-panel { min-height: 0; padding: 28px 26px; gap: 24px; }
          .zc-root h1.zc-panel-title { font-size: 40px; }
          .zc-step-card { min-height: 0; }
        }
        @media (max-width: 640px) {
          .zc-root { padding: 16px 12px 56px; }
          .zc-shell { border-radius: 26px; padding: 20px 16px 24px; gap: 16px; }
          .zc-panel { border-radius: 22px; }
          .zc-root h1.zc-panel-title { font-size: 34px; }
          .zc-question { font-size: 26px; }
          .zc-card { border-radius: 22px; }
          .zc-ctarow { grid-template-columns: minmax(0,1fr); }
          .zc-inputbox { padding: 16px; }
          .zc-inputbox input { font-size: 13px !important; }
          .zc-cta { padding: 20px 22px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .zc-chip-enter { animation: none; }
          .zc-spin { animation-duration: 1.6s; }
        }
      `}</style>

      <div className={`zc-root ${FONT_VARS}`}>
        <div className="zc-shell">

          {/* ── header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", paddingLeft: "4px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/zynd-logo.png" alt="Zynd" style={{ height: "20px", width: "auto", display: "block" }} />
              <span style={{ font: `600 16px/1 ${DISPLAY}`, color: T.ink, letterSpacing: "-.01em" }}>Zynd Profile</span>
            </div>
            <Link href="/directory" className="zc-back"
              style={{ display: "flex", alignItems: "center", gap: "8px", font: `500 12px/1 ${SANS}`, letterSpacing: ".1em", color: T.muted, textDecoration: "none" }}>
              <span style={{ fontSize: "14px" }}>←</span> Directory
            </Link>
          </div>

          <div className="zc-grid">

            {/* ── purple promise panel ── */}
            <div className="zc-panel">
              <span style={{ position: "absolute", top: "18px", right: "18px", width: "13px", height: "13px", borderTop: "2px solid rgba(255,255,255,.6)", borderRight: "2px solid rgba(255,255,255,.6)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.34)", borderRadius: "999px", padding: "8px 15px", width: "fit-content" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff", display: "block" }} />
                <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff" }}>{panel.badge}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <h1 className="zc-panel-title" style={{ margin: 0 }}>{panel.title}</h1>
                <p style={{ font: `400 15px/1.65 ${SANS}`, color: T.onPanel, maxWidth: "352px", textWrap: "pretty", margin: 0 }}>{panel.body}</p>
              </div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "1px", background: "rgba(255,255,255,.28)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ font: `400 12px/1.5 ${SANS}`, color: T.onPanel }}>Publishes at</span>
                  <span style={{ font: `500 12px/1 ${MONO}`, color: "#fff", background: "rgba(255,255,255,.16)", borderRadius: "8px", padding: "7px 10px" }}>zynd.ai/p/you</span>
                </div>
                <div style={{ font: `400 12px/1.5 ${SANS}`, color: T.onPanel2 }}>after your review</div>
              </div>
            </div>

            {/* ── right column ── */}
            <div className="zc-col">

              {/* ── STEP 0 — paste links ── */}
              {phase === "form" && (
                <form onSubmit={startOnboard} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  <div className="zc-card" style={{ padding: "28px 28px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>Profiles</span>
                      <span style={{ font: `400 12px/1 ${SANS}`, color: T.muted }}>Space or Enter to add</span>
                    </div>

                    {urls.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {urls.map(url => (
                          <div key={url} className="zc-chip-enter" style={{ display: "flex", alignItems: "center", gap: "9px", background: T.accent, borderRadius: "999px", padding: "8px 13px" }}>
                            <span style={{ font: `500 12px/1 ${MONO}`, color: "#fff" }}>{shortenUrl(url)}</span>
                            <button type="button" className="zc-x" onClick={() => removeUrl(url)} aria-label={`Remove ${shortenUrl(url)}`}
                              style={{ font: `400 13px/1 ${SANS}`, color: "rgba(255,255,255,.7)", background: "none", border: "none", padding: 0, cursor: "pointer" }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="zc-inputbox" onClick={() => inputRef.current?.focus()}
                      style={{
                        background: T.surface,
                        border: `1px solid ${inputFocused ? T.accent : T.border}`,
                        boxShadow: inputFocused ? "0 0 0 3px rgba(123,114,233,.12)" : "none",
                        borderRadius: "18px", padding: "22px", display: "flex", alignItems: "center", gap: "10px", cursor: "text",
                      }}>
                      <span style={{ width: "2px", height: "19px", background: T.accent, display: "block", flexShrink: 0 }} />
                      <input
                        ref={inputRef} type="text" value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown} onPaste={handlePaste}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => { setInputFocused(false); if (inputVal.trim()) addUrl(inputVal); }}
                        placeholder={urls.length === 0 ? "github.com/you  or  linkedin.com/in/you" : "Add another URL…"}
                        style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", font: `400 15px/1 ${MONO}`, color: T.ink }}
                      />
                    </div>

                    {urlError && (
                      <div style={{ font: `400 13px/1.4 ${SANS}`, color: "#C2401F", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>⚠</span> {urlError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
                      {QUICK_ADD.map(({ kind, domain }) => (
                        <button key={kind} type="button" className="zc-quick"
                          onClick={() => { setInputVal(domain); inputRef.current?.focus(); }}
                          style={{ display: "flex", alignItems: "center", gap: "8px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "9px 15px", cursor: "pointer", font: `500 13px/1 ${SANS}`, color: T.ink }}>
                          <KindSquare kind={kind} />
                          {CHIP[kind].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>Résumé</span>
                      <span style={{ font: `400 12px/1 ${SANS}`, color: T.faint }}>— optional</span>
                    </div>
                    <div className="zc-drop" onClick={() => fileRef.current?.click()}
                      style={{ background: T.surface, border: `1px dashed ${resume ? T.accent : T.dashed}`, borderRadius: "18px", padding: "20px", display: "flex", alignItems: "center", gap: "11px", cursor: "pointer" }}>
                      <span style={{ font: `400 15px/1 ${SANS}`, color: T.muted }}>↑</span>
                      <span style={{ font: `400 15px/1 ${SANS}`, color: resume ? T.ink : T.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {resume ? resume.name : "Upload PDF or DOCX"}
                      </span>
                      {resume && (
                        <button type="button" onClick={e => { e.stopPropagation(); setResume(null); }} aria-label="Remove résumé"
                          style={{ marginLeft: "auto", font: `400 15px/1 ${SANS}`, color: T.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>×</button>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,application/pdf" onChange={e => setResume(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                  </div>

                  <div className="zc-ctarow">
                    <button type="submit" disabled={!hasSource} className="zc-cta"
                      style={{
                        background: hasSource ? T.accent : T.ctaOffBg, borderRadius: "26px", border: "none",
                        padding: "26px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px",
                        cursor: hasSource ? "pointer" : "not-allowed", textAlign: "left", width: "100%",
                      }}>
                      <span style={{ font: `600 19px/1 ${DISPLAY}`, color: hasSource ? "#fff" : T.ctaOffInk, letterSpacing: "-.01em" }}>Build my card</span>
                      <span style={{ font: `400 19px/1 ${SANS}`, color: hasSource ? "#fff" : T.ctaOffInk }}>→</span>
                    </button>
                    <div className="zc-card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "7px" }}>
                      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>Step</span>
                      <span style={{ font: `600 15px/1.3 ${DISPLAY}`, color: T.ink, letterSpacing: "-.01em" }}>1 of 2 — then review</span>
                    </div>
                  </div>
                </form>
              )}

              {/* ── STEPS 1–5 — questions ── */}
              {phase === "working" && (() => {
                const q = QUESTIONS[questionIndex];
                const isLast = questionIndex === QUESTIONS.length - 1;
                const isDone = questionIndex >= QUESTIONS.length;

                // handoff — every question answered, card still building
                if (isDone) {
                  return (
                    <div className="zc-card zc-step-card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "26px", justifyContent: "center", alignItems: "flex-start" }}>
                      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>
                        {QUESTIONS.length} of {QUESTIONS.length}
                      </span>
                      <div className="zc-question" style={{ maxWidth: "520px" }}>
                        Building your card from your answers and the scrape.
                      </div>
                      <p style={{ font: `400 15px/1.65 ${SANS}`, color: T.soft, maxWidth: "440px", textWrap: "pretty", margin: 0 }}>
                        Nothing is published yet. You&apos;ll see the draft card next and can edit every line before it goes live.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="zc-spin" style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${T.dotOff}`, borderTopColor: T.accent, display: "block" }} />
                        <span style={{ font: `400 13px/1 ${SANS}`, color: T.muted }}>Finishing up…</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="zc-card zc-step-card" style={{ padding: "30px 30px 26px", display: "flex", flexDirection: "column", gap: "26px" }}>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        {QUESTIONS.map((_, i) => (
                          <span key={i} style={{
                            display: "block", height: "6px", borderRadius: "999px",
                            width: i === questionIndex ? "22px" : "6px",
                            background: i <= questionIndex ? T.accent : T.dotOff,
                            transition: "width .25s, background .25s",
                          }} />
                        ))}
                      </div>
                      <span style={{ font: `500 12px/1 ${MONO}`, color: T.muted }}>{questionIndex + 1} of {QUESTIONS.length}</span>
                    </div>

                    <div className="zc-question">{q.label}</div>

                    {q.type === "chips" && q.options && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {q.options.map(opt => {
                          const on = (selections[q.id] ?? new Set<string>()).has(opt);
                          return (
                            <button key={opt} type="button" className="zc-opt"
                              onClick={() => toggleOption(q.id, opt)}
                              style={{
                                borderRadius: "999px", padding: "12px 19px", font: `500 15px/1 ${SANS}`,
                                background: on ? T.accent : T.surface,
                                border: `1px solid ${on ? T.accent : T.border}`,
                                color: on ? "#fff" : T.ink,
                              }}>
                              {opt}
                            </button>
                          );
                        })}
                        <input
                          ref={el => { customRefs.current[q.id] = el; }}
                          type="text"
                          value={customs[q.id] ?? ""}
                          onChange={e => setCustoms(p => ({ ...p, [q.id]: e.target.value }))}
                          placeholder="Other…"
                          style={{
                            borderRadius: "999px", padding: "12px 19px", font: `400 15px/1 ${SANS}`,
                            background: T.surface,
                            border: `1px dashed ${customs[q.id] ? T.accent : T.dashed}`,
                            color: T.ink, outline: "none", width: "128px",
                            transition: "border-color .12s, width .2s",
                          }}
                          onFocus={e => (e.target.style.width = "184px")}
                          onBlur={e => (e.target.style.width = customs[q.id] ? "184px" : "128px")}
                        />
                      </div>
                    )}

                    {q.type === "text" && q.id === "location" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <input
                          type="text"
                          value={locationInput}
                          onChange={e => setLocationInput(e.target.value)}
                          placeholder="e.g. San Francisco, CA"
                          autoFocus
                          className="zc-field"
                          style={{
                            width: "100%", padding: "20px 22px", borderRadius: "18px",
                            border: `1px solid ${locationInput ? T.accent : T.border}`,
                            background: T.surface, color: T.ink, font: `400 15px/1 ${SANS}`,
                            outline: "none", boxSizing: "border-box", transition: "border-color .12s",
                          }}
                          onKeyDown={e => { if (e.key === "Enter") advanceQuestion(); }}
                        />
                        <span style={{ font: `400 12px/1 ${SANS}`, color: T.faint }}>optional — skip if you prefer</span>
                      </div>
                    )}

                    {q.type === "text" && q.id === "calendly_url" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <input
                          type="url"
                          value={calendlyInput}
                          onChange={e => setCalendlyInput(e.target.value)}
                          placeholder="https://calendly.com/yourname"
                          autoFocus
                          className="zc-field"
                          style={{
                            width: "100%", padding: "20px 22px", borderRadius: "18px",
                            border: `1px solid ${calendlyInput ? T.accent : T.border}`,
                            background: T.surface, color: T.ink, font: `400 15px/1 ${SANS}`,
                            outline: "none", boxSizing: "border-box", transition: "border-color .12s",
                          }}
                          onKeyDown={e => { if (e.key === "Enter") advanceQuestion(); }}
                        />
                        <span style={{ font: `400 12px/1 ${SANS}`, color: T.faint }}>optional — skip if you prefer</span>
                      </div>
                    )}

                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
                      <button type="button" className="zc-ghost" onClick={advanceQuestion}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "14px 26px", font: `500 15px/1 ${SANS}`, color: T.soft, cursor: "pointer" }}>
                        Skip
                      </button>
                      <button type="button" className="zc-primary" onClick={advanceQuestion}
                        style={{ background: T.accent, border: "none", borderRadius: "999px", padding: "14px 26px", display: "flex", alignItems: "center", gap: "11px", font: `600 15px/1 ${DISPLAY}`, color: "#fff", cursor: "pointer" }}>
                        {isLast ? "Done" : "Next"} <span style={{ font: `400 15px/1 ${SANS}` }}>→</span>
                      </button>
                    </div>

                    {urls.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ height: "1px", background: T.border }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          {urls.map(url => (
                            <span key={url} style={{ display: "flex", alignItems: "center", gap: "8px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "7px 12px" }}>
                              <KindSquare kind={detectKind(url)} size={11} />
                              <span style={{ font: `500 12px/1 ${MONO}`, color: T.soft }}>{shortenUrl(url)}</span>
                            </span>
                          ))}
                          <span style={{ font: `400 13px/1 ${SANS}`, color: jobDone ? T.accentHi : T.faint }}>
                            {jobDone ? "✓ scraped" : "scraping…"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── ERROR ── */}
              {phase === "error" && (
                <div className="zc-card zc-step-card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "22px", justifyContent: "center", alignItems: "flex-start" }}>
                  <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#C2401F" }}>Something broke</span>
                  <div className="zc-question" style={{ maxWidth: "520px" }}>That didn&apos;t go through.</div>
                  <p style={{ font: `400 15px/1.65 ${SANS}`, color: T.soft, maxWidth: "440px", textWrap: "pretty", margin: 0 }}>{error}</p>
                  <button type="button" className="zc-primary" onClick={() => setPhase("form")}
                    style={{ background: T.accent, border: "none", borderRadius: "999px", padding: "15px 28px", display: "flex", alignItems: "center", gap: "11px", font: `600 15px/1 ${DISPLAY}`, color: "#fff", cursor: "pointer" }}>
                    Start over <span style={{ font: `400 15px/1 ${SANS}` }}>↺</span>
                  </button>
                </div>
              )}

              {/* ── REVIEW ── */}
              {phase === "review" && card && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <SectionLabel label="Identity" />

                    {/* photo + outbound links — both scraped, neither previously reviewable */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <Avatar url={card.identity.avatar_url} name={card.identity.name} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                        <span style={{ font: `400 13px/1.4 ${SANS}`, color: T.soft }}>
                          {card.identity.avatar_url ? "Profile photo — from your scraped sources" : "No photo found"}
                        </span>
                        {card.identity.avatar_url && (
                          <button type="button" className="zc-rowbtn" style={{ alignSelf: "flex-start" }}
                            onClick={() => updateCard({ identity: { ...card.identity, avatar_url: "" } })}>
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>

                    {Object.entries(card.identity.links).some(([, v]) => v) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {Object.entries(card.identity.links).filter(([, v]) => v).map(([key, url]) => (
                          <span key={key} style={{ display: "flex", alignItems: "center", gap: "9px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "8px 13px" }}>
                            <KindSquare kind={detectKind(url)} size={11} />
                            <span style={{ font: `500 12px/1 ${MONO}`, color: T.soft }}>{shortenUrl(url)}</span>
                            <button type="button" className="zc-rowbtn" aria-label={`Remove ${key} link`}
                              onClick={() => updateCard({ identity: { ...card.identity, links: { ...card.identity.links, [key]: "" } } })}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <TextField label="Name" value={card.identity.name} onChange={v => updateCard({ identity: { ...card.identity, name: v } })} />
                      <TextField label="Headline" value={card.identity.headline} onChange={v => updateCard({ identity: { ...card.identity, headline: v } })} />
                      <TextField label="Location" value={card.identity.location} placeholder="e.g. San Francisco, CA" onChange={v => updateCard({ identity: { ...card.identity, location: v } })} />
                    </div>
                  </div>

                  <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <SectionLabel label="About" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <TextField label="Summary" value={card.summary} rows={4} onChange={v => updateCard({ summary: v })} />
                      <TextField label="Citation snippet" value={card.citation_snippet} rows={2} onChange={v => updateCard({ citation_snippet: v })} />
                    </div>
                  </div>

                  <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <SectionLabel label="Skills" />
                    <TextField label="One per line" value={card.skills.map(s => s.name).join("\n")} rows={5}
                      onChange={v => updateCard({
                        // Match by name, not index — matching by index made a
                        // deletion mid-list shift every later skill onto the
                        // wrong level/evidence_count and drop the last one.
                        skills: v.split("\n").map(n => n.trim()).filter(Boolean).map(name => {
                          const prev = card.skills.find(sk => sk.name.toLowerCase() === name.toLowerCase());
                          return prev ? { ...prev, name } : { name, level: "intermediate", evidence_count: 0 };
                        }),
                      })}
                    />
                  </div>

                  {card.projects.length > 0 && (() => {
                    const kept = card.projects.filter((pr, i) => !excluded.has(projectKey(pr, i))).length;
                    return (
                      <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <SectionLabel label="Projects" total={card.projects.length} kept={kept} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {card.projects.map((pr: Project, i: number) => {
                            const key = projectKey(pr, i);
                            const off = excluded.has(key);
                            return (
                              <div key={key} className={`zc-row${off ? " off" : ""}`}>
                                <div className="zc-row-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                                    <span style={{ font: `600 15px/1.2 ${DISPLAY}`, color: T.ink, letterSpacing: "-.01em" }}>{pr.name}</span>
                                    {pr.stars ? <span style={{ font: `400 12px/1 ${MONO}`, color: T.muted }}>★ {pr.stars}</span> : null}
                                    {(pr.tech ?? []).map(t => (
                                      <span key={t} style={{ font: `400 12px/1 ${MONO}`, color: T.faint }}>{t}</span>
                                    ))}
                                  </div>
                                  {pr.description && (
                                    <span className="zc-clamp1" style={{ font: `400 13px/1.5 ${SANS}`, color: T.soft }}>{pr.description}</span>
                                  )}
                                </div>
                                <button type="button" className="zc-rowbtn" onClick={() => toggleExcluded(key)}
                                  aria-label={off ? `Restore ${pr.name}` : `Remove ${pr.name}`}>
                                  {off ? "Restore" : "\u00d7"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {card.writing_samples.length > 0 && (() => {
                    const kept = card.writing_samples.filter((_, i) => !excluded.has(sampleKey(i))).length;
                    return (
                      <div className="zc-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <SectionLabel label="Posts" total={card.writing_samples.length} kept={kept} />
                        <p style={{ font: `400 13px/1.5 ${SANS}`, color: T.soft, margin: 0 }}>
                          Scraped from your social profiles and published on your card. Remove anything you&apos;d rather not have quoted.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {card.writing_samples.map((w: WritingSample, i: number) => {
                            const key = sampleKey(i);
                            const off = excluded.has(key);
                            return (
                              <div key={key} className={`zc-row${off ? " off" : ""}`}>
                                <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted, paddingTop: "4px", flexShrink: 0, width: "26px" }}>
                                  {w.platform}
                                </span>
                                <span className="zc-row-main zc-clamp2" style={{ flex: 1, minWidth: 0, font: `400 14px/1.5 ${SANS}`, color: T.ink }}>
                                  {w.excerpt}
                                </span>
                                <button type="button" className="zc-rowbtn" onClick={() => toggleExcluded(key)}
                                  aria-label={off ? "Restore post" : "Remove post"}>
                                  {off ? "Restore" : "\u00d7"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="zc-ctarow">
                    <button type="button" onClick={publish} className="zc-cta"
                      style={{ background: T.accent, borderRadius: "26px", border: "none", padding: "26px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", cursor: "pointer", textAlign: "left", width: "100%" }}>
                      <span style={{ font: `600 19px/1 ${DISPLAY}`, color: "#fff", letterSpacing: "-.01em" }}>Publish my card</span>
                      <span style={{ font: `400 19px/1 ${SANS}`, color: "#fff" }}>→</span>
                    </button>
                    <div className="zc-card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "7px" }}>
                      <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted }}>Step</span>
                      <span style={{ font: `600 15px/1.3 ${DISPLAY}`, color: T.ink, letterSpacing: "-.01em" }}>2 of 2 — goes live</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── tagline footer row — inside shell, always visible ── */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "20px", display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto", paddingRight: "32px", marginRight: "32px", borderRight: `1px solid ${T.border}` }}>
              <p style={{ font: `700 22px/1.1 ${DISPLAY}`, color: T.ink, letterSpacing: "-.03em", margin: 0, whiteSpace: "nowrap" }}>
                Your work,<br />discoverable by AI.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0", flex: 1, minWidth: 0 }}>
              {[
                { num: "01", label: "Add your profiles", desc: "GitHub · LinkedIn · X · any URL" },
                { num: "02", label: "We scrape the public web", desc: "No passwords, no permissions" },
                { num: "03", label: "You review and approve", desc: "Edit every line before it goes live" },
              ].map(({ num, label, desc }, i) => (
                <div key={num} style={{ flex: 1, minWidth: 0, paddingLeft: i > 0 ? "24px" : "0", borderLeft: i > 0 ? `1px solid ${T.border}` : "none", marginLeft: i > 0 ? "24px" : "0", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ font: `500 10px/1 ${MONO}`, letterSpacing: ".14em", color: T.faint }}>{num}</span>
                  <span style={{ font: `600 13px/1.3 ${DISPLAY}`, color: T.ink, letterSpacing: "-.01em" }}>{label}</span>
                  <span style={{ font: `400 12px/1.4 ${SANS}`, color: T.soft }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
