"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Twitter, Linkedin, Globe, X } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { CARDS_API } from "@/lib/cards";
import type { AgentProfileCard, OnboardStatus } from "@/lib/cards";

type Phase = "form" | "working" | "review" | "error";
type UrlKind = "github" | "x" | "linkedin" | "website";

const INPUT =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#5b7cfa]/60 focus:bg-white/[0.06]";

const LABEL = "block text-sm font-medium text-white/60 mb-1.5";

const KIND_META: Record<UrlKind, { label: string; color: string; bg: string }> = {
  github:   { label: "GitHub",   color: "#e2e8f0", bg: "rgba(226,232,240,0.08)" },
  x:        { label: "X",        color: "#e2e8f0", bg: "rgba(226,232,240,0.08)" },
  linkedin: { label: "LinkedIn", color: "#7eb3f8", bg: "rgba(126,179,248,0.08)" },
  website:  { label: "Website",  color: "#a5f3c0", bg: "rgba(165,243,192,0.08)" },
};

function detectKind(url: string): UrlKind {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "github.com" || host.endsWith(".github.com")) return "github";
    if (host === "x.com" || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  } catch { /* invalid URL — treat as website */ }
  return "website";
}

function KindIcon({ kind }: { kind: UrlKind }) {
  if (kind === "github") return <Github size={12} />;
  if (kind === "x") return <Twitter size={12} />;
  if (kind === "linkedin") return <Linkedin size={12} />;
  return <Globe size={12} />;
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, "").slice(0, 40);
  } catch {
    return url.slice(0, 40);
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-white/25">{hint}</p>}
    </div>
  );
}

export default function CreateProfilePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<AgentProfileCard | null>(null);

  const [urls, setUrls] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function addUrl(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    // Prepend https:// if no protocol
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (urls.includes(withProtocol)) {
      setInputVal("");
      return;
    }
    setUrls((prev) => [...prev, withProtocol]);
    setInputVal("");
  }

  function removeUrl(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addUrl(inputVal);
    } else if (e.key === "Backspace" && !inputVal && urls.length > 0) {
      setUrls((prev) => prev.slice(0, -1));
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted) {
      e.preventDefault();
      addUrl(pasted);
    }
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
      <Navbar />
      <main className="min-h-screen text-white antialiased pb-32">
        <div className="mx-auto max-w-lg px-6 pt-16">

          <div className="mb-8">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-3 py-1 text-xs font-medium text-[#5b7cfa]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5b7cfa]" />
              Publicly visible · Discoverable by AI
            </span>
            <div className="mt-3 text-[1.75rem] font-bold leading-snug tracking-tight text-white">
              Create your Agent Profile Card
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Publishes at{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.8em] text-white/60">
                zynd.ai/p/you
              </code>{" "}
              — findable by people and AI agents worldwide. You review before anything goes live.
            </p>
          </div>

          {phase === "form" && (
            <form onSubmit={startOnboard} className="flex flex-col gap-4">

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                  Paste your profiles — GitHub, LinkedIn, X, or any website
                </p>

                {/* URL chip input */}
                <div
                  className="min-h-[52px] w-full cursor-text rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 transition focus-within:border-[#5b7cfa]/60 focus-within:bg-white/[0.06]"
                  onClick={() => inputRef.current?.focus()}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {urls.map((url) => {
                      const kind = detectKind(url);
                      const meta = KIND_META[kind];
                      return (
                        <span
                          key={url}
                          style={{ background: meta.bg, color: meta.color }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2 py-1 text-xs font-medium"
                        >
                          <KindIcon kind={kind} />
                          <span className="opacity-50">{KIND_META[kind].label}</span>
                          <span className="max-w-[180px] truncate opacity-70">{shortenUrl(url)}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                            className="ml-0.5 opacity-40 transition hover:opacity-80"
                          >
                            <X size={10} />
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
                      onBlur={() => { if (inputVal.trim()) addUrl(inputVal); }}
                      placeholder={urls.length === 0 ? "https://github.com/you, linkedin.com/in/you…" : "Add another URL…"}
                      className="min-w-[200px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-white/20">
                  Press Enter after each URL · Auto-detects GitHub, LinkedIn, X, and websites
                </p>

                {/* Resume upload */}
                <div className="mt-4">
                  <label className={LABEL}>
                    {resume ? `Résumé — ${resume.name}` : "Résumé (optional)"}
                  </label>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/30 transition hover:border-white/20 hover:text-white/50"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    {resume ? (
                      <span className="truncate text-white/60">{resume.name}</span>
                    ) : (
                      "Upload PDF or DOCX"
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf"
                    onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!hasSource}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5b7cfa] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a67e0] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Generate my profile card
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {!hasSource && (
                <p className="text-center text-xs text-white/25">Paste at least one URL above</p>
              )}
            </form>
          )}

          {phase === "working" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-sm text-white/50">
                <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-white/10 border-t-[#5b7cfa]" />
                Scraping your sources and building your profile — takes 10–30 seconds.
              </div>
              {urls.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {urls.map((url) => {
                    const kind = detectKind(url);
                    const meta = KIND_META[kind];
                    return (
                      <span
                        key={url}
                        style={{ color: meta.color }}
                        className="inline-flex items-center gap-1 text-xs opacity-40"
                      >
                        <KindIcon kind={kind} />
                        {KIND_META[kind].label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {phase === "error" && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-4 text-sm text-red-400">
              <span>{error}</span>
              <button
                onClick={() => setPhase("form")}
                className="flex-shrink-0 rounded border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/60 hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {phase === "review" && card && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-[#5b7cfa]/20 bg-[#5b7cfa]/[0.05] px-4 py-3 text-sm text-white/50">
                Review your card — nothing publishes until you confirm.
              </div>

              {(
                [
                  { label: "Name", value: card.identity.name, set: (v: string) => updateCard({ identity: { ...card.identity, name: v } }) },
                  { label: "Headline", value: card.identity.headline, set: (v: string) => updateCard({ identity: { ...card.identity, headline: v } }) },
                  { label: "Location", value: card.identity.location, set: (v: string) => updateCard({ identity: { ...card.identity, location: v } }) },
                ] as const
              ).map(({ label, value, set }) => (
                <Field key={label} label={label}>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className={INPUT}
                  />
                </Field>
              ))}

              <Field label="Summary">
                <textarea
                  rows={4}
                  value={card.summary}
                  onChange={(e) => updateCard({ summary: e.target.value })}
                  className={INPUT + " resize-none"}
                />
              </Field>

              <Field label="Citation snippet">
                <textarea
                  rows={2}
                  value={card.citation_snippet}
                  onChange={(e) => updateCard({ citation_snippet: e.target.value })}
                  className={INPUT + " resize-none"}
                />
              </Field>

              <Field label="Skills" hint="One per line">
                <textarea
                  rows={4}
                  value={card.skills.map((s) => s.name).join("\n")}
                  onChange={(e) =>
                    updateCard({
                      skills: e.target.value
                        .split("\n")
                        .map((n) => n.trim())
                        .filter(Boolean)
                        .map((name, i) =>
                          card.skills[i] ?? { name, level: "intermediate", evidence_count: 0 }
                        ),
                    })
                  }
                  className={INPUT + " resize-none"}
                />
              </Field>

              <button
                onClick={publish}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5b7cfa] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a67e0]"
              >
                Publish my profile card
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <p className="text-center text-xs text-white/25">
                Creates a public page at zynd.ai/p/&lt;handle&gt; and notifies search engines.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
