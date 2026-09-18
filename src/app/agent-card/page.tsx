"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const CARDS_API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.zynd.ai";

import { HeroCardStack } from "./hero-card-stack";
import { Typewriter } from "./typewriter";

export default function AgentCardPage() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  const handleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function synthesize() {
    const trimmed = link.trim();
    router.push(trimmed ? `/create?url=${encodeURIComponent(trimmed)}` : "/create");
  }

  function onHandleInput(raw: string) {
    const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    setHandle(slug);
    setHandleStatus("idle");
    if (handleTimer.current) clearTimeout(handleTimer.current);
    if (slug.length < 2) return;
    setHandleStatus("checking");
    handleTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`${CARDS_API}/cards/handle-available/${encodeURIComponent(slug)}`);
        if (!r.ok) { setHandleStatus("error"); return; }
        const d = await r.json();
        setHandleStatus(d.available ? "available" : "taken");
      } catch {
        setHandleStatus("error");
      }
    }, 400);
  }

  function claimHandle() {
    if (!handle || handleStatus === "taken") return;
    router.push(`/create?handle=${encodeURIComponent(handle)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-50" data-purpose="top-navigation">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="min-h-16 sm:min-h-[72px] flex items-center justify-between gap-3 rounded-[22px] bg-white/90 backdrop-blur-md border border-[#94a3b8] px-3 sm:px-6 py-2 shadow-[0_16px_36px_-16px_rgba(15,23,42,0.5)]">
            <Link aria-label="Zynd Home" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink-0" href="/">
              <img src="/assets/zynd-logo.png" alt="Zynd" className="h-8 sm:h-9 w-auto" />
              <span className="text-lg font-extrabold tracking-tight text-[#0f172a]">Zynd</span>
              <span className="hidden xl:inline-block text-[10px] font-mono text-[#64748b] tracking-widest pl-3 border-l border-[#cbd5e1]">LIVING IDENTITY</span>
            </Link>
            <nav className="hidden xl:flex items-center gap-5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b]">
              <a className="hover:text-[#4f46e5] transition-colors" href="#ingestion">Synthesize</a>
              <a className="hover:text-[#4f46e5] transition-colors" href="#paradigm">Shift</a>
              <a className="hover:text-[#4f46e5] transition-colors" href="#signals">Signals</a>
              <a className="hover:text-[#4f46e5] transition-colors" href="#discovery">Agent Query</a>
              <a className="hover:text-[#4f46e5] transition-colors" href="#dual-view">Dual Interface</a>
              <a className="hover:text-[#4f46e5] transition-colors" href="#privacy">Privacy</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a className="text-[11px] font-mono font-bold text-[#334155] hover:text-[#4f46e5] px-2 py-2 hidden md:block" href="https://www.zynd.ai">Explore Network</a>
              <Link className="ac-btn ac-btn-primary text-[11px] px-4 sm:px-5 py-2.5" href="/create">
                Claim Handle <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="overflow-x-hidden">
        <div className="ac-band ac-band-paper">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-w-0">
            <div className="lg:col-span-6 space-y-7 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eef2ff] border border-[#c7d2fe] text-[11px] font-mono font-bold text-[#3730a3] shadow-[0_8px_20px_-12px_rgba(79,70,229,0.6)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
                <span className="tracking-wider uppercase">Living Identity for Builders &amp; Agents</span>
              </div>
              <h1 className="ac-h1 text-[40px] sm:text-6xl lg:text-[64px] text-[#0b1220]">
                Your next collaborator won&apos;t Google you. <br />
                <span className="text-[#4338ca]">Their agent will.</span>
              </h1>
              <div className="space-y-2.5 text-sm sm:text-base ac-body">
                <div className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0" />
                  <span className="text-[#0f172a] font-semibold">Zynd creates a living professional identity.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0" />
                  <span>Built from the internet you already have (GitHub, LinkedIn, papers, work).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0" />
                  <span>Directly discoverable by people and searchable by AI agents.</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link className="ac-btn ac-btn-primary text-sm py-3.5 px-6 w-full sm:w-auto" href="/create">
                  Create your Living Profile <span>→</span>
                </Link>
                <Link className="ac-btn ac-btn-ghost text-sm py-3.5 px-6 w-full sm:w-auto" href="/directory">
                  Explore the Network <span className="text-[#64748b]">→</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono font-bold text-[#64748b] pt-1">
                <span>✓ Free to create</span>
                <span>✓ 60-second synthesis</span>
                <span>✓ No password or resume needed</span>
              </div>
            </div>
            <div className="lg:col-span-6 relative min-w-0 w-full" data-purpose="hero-profile-card">
              <HeroCardStack />
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-mist">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="how-to-create" id="ingestion">
          <div className="ac-sheet p-7 sm:p-11 lg:p-14 space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="ac-kicker">{"// 01 THE INGESTION"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">Paste your internet. Get your profile.</h2>
              <p className="text-sm sm:text-base ac-body">
                LinkedIn + GitHub + X + website → Zynd synthesizes them → living profile in 60 seconds. No resume builder. No blank forms to stare at.
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] max-w-3xl min-w-0">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 min-w-0">
                <div className="flex items-center flex-1 min-w-0 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 focus-within:border-[#4f46e5] transition-all">
                  <span className="font-mono text-[#94a3b8] text-xs mr-2 shrink-0">URL</span>
                  <input autoComplete="off" className="ac-input text-xs sm:text-sm min-w-0" placeholder="github.com/your-handle or linkedin.com/in/your-profile" spellCheck="false" type="text" value={link} onChange={e => setLink(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); synthesize(); } }} />
                </div>
                <button className="ac-btn ac-btn-primary text-xs sm:text-sm py-3.5 px-6 shrink-0 w-full sm:w-auto" type="button" onClick={synthesize}>
                  Synthesize Living Profile <span>→</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative pt-2">
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#4f46e5] font-bold">SOURCE FOOTPRINTS</span>
                  <span className="text-[10px] font-mono text-[#94a3b8]">01</span>
                </div>
                <div className="space-y-1.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-mono text-[#0f172a] flex items-center justify-between">
                    <span>GitHub Traces</span>
                    <span className="text-[10px] text-[#047857]">Commits &amp; PRs</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-mono text-[#0f172a] flex items-center justify-between">
                    <span>LinkedIn / Resume</span>
                    <span className="text-[10px] text-[#64748b]">Historical roles</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-mono text-[#0f172a] flex items-center justify-between">
                    <span>X / Writing / Web</span>
                    <span className="text-[10px] text-[#64748b]">Current ideas</span>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border-2 border-[#4f46e5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#4f46e5] font-bold">ZYND SYNTHESIS</span>
                  <span className="text-[10px] font-mono text-[#4f46e5]">02</span>
                </div>
                <p className="text-xs ac-body leading-relaxed">
                  Extracts active technologies, recent architectural decisions, problem domains, and current collaboration intent automatically.
                </p>
                <div className="text-[11px] font-mono text-[#4f46e5] flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
                  60s automated distillation
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#0f172a] font-bold">ONE LIVING PROFILE</span>
                  <span className="text-[10px] font-mono text-[#94a3b8]">03</span>
                </div>
                <p className="text-xs ac-body leading-relaxed">
                  A single link ready for human peers to browse and an indexable semantic schema ready for AI search agents.
                </p>
                <div className="text-xs font-mono text-[#4f46e5] pt-1">
                  zynd.me/@your-name →
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#e2e8f0] text-center">
              <p className="text-xs sm:text-sm font-mono text-[#64748b]">
                But Zynd isn&apos;t just another profile page. <span className="text-[#4f46e5]">↓</span>
              </p>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-paper">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="category-shift" id="paradigm">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <div className="ac-kicker">{"// 02 CATEGORY SHIFT"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">The internet has profiles. It doesn&apos;t have living identities.</h2>
              <p className="text-sm sm:text-base ac-body">
                Why add another link when you already have three? Because existing profiles were built for an era before real-time momentum and autonomous discovery agents.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 sm:p-7 rounded-[22px] bg-[#f1f5f9] border border-[#94a3b8] space-y-4">
                <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
                  <h3 className="text-xl font-extrabold text-[#0f172a]">LinkedIn</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]">CAREER ARCHIVE</span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Core focus</div>
                    <div className="text-[#0f172a] font-bold">Who you were</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Format</div>
                    <div className="text-[#475569]">Retrospective career history</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Audience</div>
                    <div className="text-[#475569]">Written for recruiters &amp; humans</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Maintenance</div>
                    <div className="text-[#be123c]">Manually maintained (chronically stale)</div>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-7 rounded-[22px] bg-[#f1f5f9] border border-[#94a3b8] space-y-4">
                <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
                  <h3 className="text-xl font-extrabold text-[#0f172a]">Linktree</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]">LINK DIRECTORY</span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Core focus</div>
                    <div className="text-[#0f172a] font-bold">Where you exist</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Format</div>
                    <div className="text-[#475569]">Flat list of external URLs</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Audience</div>
                    <div className="text-[#475569]">Written for manual human clickers</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase">Maintenance</div>
                    <div className="text-[#475569]">Manual bookmark editing</div>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-7 rounded-[22px] bg-white border-2 border-[#4f46e5] space-y-4 relative">
                <div className="flex items-center justify-between border-b border-[#4f46e5]/20 pb-3">
                  <h3 className="text-xl font-extrabold text-[#0f172a] flex items-center gap-1.5">
                    <span>Zynd</span>
                    <span className="text-[#4f46e5] text-sm">★</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#eef2ff] text-[#4f46e5] font-bold border border-[#c7d2fe]">LIVING IDENTITY</span>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#4f46e5] uppercase">Core focus</div>
                    <div className="text-[#0f172a] font-bold text-sm">What you&apos;re doing now</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#4f46e5] uppercase">Format</div>
                    <div className="text-[#334155]">Active momentum &amp; 3 living signals</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#4f46e5] uppercase">Audience</div>
                    <div className="text-[#0f172a]">Built for humans + AI agents</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#4f46e5] uppercase">Maintenance</div>
                    <div className="text-[#047857]">Can stay current through your AI</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ac-on-dark p-6 sm:p-8 rounded-[22px] bg-[#0b1120] text-center space-y-2 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.55)]">
              <p className="ac-h2 text-2xl sm:text-3xl tracking-tight">
                &quot;LinkedIn tells people who you were. Linktree tells them where you are. <br className="hidden sm:inline" />
                <span className="text-[#c7d2fe]">Zynd tells them what you&apos;re doing now.</span>&quot;
              </p>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-mist">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="three-signals" id="signals">
          <div className="space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="ac-kicker">{"// 03 USEFUL INFORMATION"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">A profile that actually tells people something useful.</h2>
              <p className="text-sm sm:text-base ac-body">
                Your profile revolves around three dynamic signals. They answer the only three questions potential collaborators, founders, and peer engineers need to know.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-7 rounded-[24px] bg-[#d1fae5] border border-[#a7f3d0] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bracket" style={{ color: "#047857" }}>┌ SIGNAL 01 ┐</div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#064e3b]">WORKING ON</h3>
                  <p className="text-xs sm:text-sm text-[#065f46] leading-relaxed">
                    What you&apos;re building right now. Your active repositories, current architectures, shipped PRs, and weekly focus.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white font-mono text-xs text-[#065f46]">
                  <span className="block text-[10px] mb-1 uppercase text-[#047857]">Live trace example</span>
                  &quot;Fine-tuning 4-bit SLMs for private codebase orchestration and local CLI tooling.&quot;
                </div>
              </div>
              <div className="p-7 rounded-[24px] bg-[#fef3c7] border border-[#fde047] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bracket" style={{ color: "#b45309" }}>┌ SIGNAL 02 ┐</div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#78350f]">CAN HELP WITH</h3>
                  <p className="text-xs sm:text-sm text-[#92400e] leading-relaxed">
                    What you know and where you can be useful. Specific technical leverage, pairing areas, GPU profiling, and advisory boundaries.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white font-mono text-xs text-[#92400e]">
                  <span className="block text-[10px] mb-1 uppercase text-[#b45309]">Live trace example</span>
                  &quot;vLLM inference optimization, CUDA memory leak debugging, distributed shard routing.&quot;
                </div>
              </div>
              <div className="p-7 rounded-[24px] bg-[#818cf8] border border-[#6366f1] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bracket" style={{ color: "#fff" }}>┌ SIGNAL 03 ┐</div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">LOOKING FOR</h3>
                  <p className="text-xs sm:text-sm text-indigo-50 leading-relaxed">
                    What you need, who you want to meet, or what you&apos;re trying to solve. Auto-expiring 7-day beacons for co-founders and design partners.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/20 font-mono text-xs text-white">
                  <span className="block text-[10px] mb-1 uppercase text-indigo-100">Auto-expiring beacon</span>
                  &quot;Seeking 3 design partners deploying autonomous agents into customer production workflows.&quot;
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] text-center font-mono text-xs text-[#475569]">
              <span className="text-[#0f172a] font-bold">These aren&apos;t permanent profile fields.</span> They&apos;re signals that change as your work changes.
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-ink">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="agent-discovery" id="discovery">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#334155]">And once people have these profiles, something interesting happens.</div>
              <div className="ac-kicker">{"// 04 AGENT-NATIVE DISCOVERY"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">FIND PEOPLE iN the RIGHT MOMENT they are in</h2>
              <p className="text-sm sm:text-base ac-body max-w-3xl">
                Keyword matching tells you who listed a skill on a static resume. Zynd enables semantic intent matching that returns engineers who are active in that domain right now.
              </p>
            </div>
            <div className="ac-on-dark rounded-[28px] bg-[#0b1120] border border-white/20 p-6 sm:p-9 space-y-6 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.6)]">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">NATURAL LANGUAGE AGENT PROMPT</div>
                <div className="p-4 rounded-xl bg-[#070b14] border border-[#818cf8]/40 flex items-start gap-3 font-mono text-xs sm:text-sm text-white">
                  <span className="text-[#818cf8] font-bold text-base">❯</span>
                  <Typewriter
                    className="flex-1 min-w-0"
                    text={'"Find me someone in Bangalore building AI agents who knows Rust and distributed systems."'}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
                  <span>ZYND PROTOCOL REASONING TRACE</span>
                  <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 2 EXACT MATCHES LOCATED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#1a2236] border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">Ananya Rao</div>
                        <div className="text-[11px] font-mono text-[#818cf8]">zynd.me/@ananya · Bangalore</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Active today</span>
                    </div>
                    <div className="text-xs text-[#e2e8f0] space-y-1">
                      <div className="text-[11px] font-mono text-[#94a3b8] uppercase">Why Zynd matched:</div>
                      <p className="leading-relaxed">Building local LLM quantization runtimes in Rust. Actively looking for distributed benchmarking pairing.</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#94a3b8]">GitHub verified</span>
                      <span className="text-xs font-mono text-[#818cf8]">Book 20m Intro →</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#1a2236] border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">Karthik Dev</div>
                        <div className="text-[11px] font-mono text-[#818cf8]">zynd.me/@karthik · Bangalore</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Active 2h ago</span>
                    </div>
                    <div className="text-xs text-[#e2e8f0] space-y-1">
                      <div className="text-[11px] font-mono text-[#94a3b8] uppercase">Why Zynd matched:</div>
                      <p className="leading-relaxed">Architecting distributed GPU clusters for agent harnesses. Offers help with memory-mapped tensor streaming.</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#94a3b8]">Verified repositories</span>
                      <span className="text-xs font-mono text-[#818cf8]">Book 20m Intro →</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#94a3b8]">
                <span>Oh. Zynd isn&apos;t just your profile. <span className="text-white font-bold">It&apos;s a network.</span></span>
                <a className="text-[#818cf8] hover:underline" href="#network">View the Network Layer ↓</a>
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-mist">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="zero-maintenance">
          <div className="ac-sheet p-7 sm:p-11 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="ac-kicker">{"// 06 ZERO MAINTENANCE DEBT"}</div>
                  <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">
                    You shouldn&apos;t have to update your profile. Your AI already knows what you&apos;re working on.
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-[#4f46e5]">
                    Claude / ChatGPT / Cursor / GitHub → Zynd. Your work changes. Your profile changes with it.
                  </p>
                </div>
                <div className="space-y-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                    <div className="text-xs font-mono text-[#4f46e5] font-bold">01 / Zero Manual Bio Writing</div>
                    <p className="text-xs ac-body">Shipped work becomes the signal. No drafting intros or updating skill badges every six months.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                    <div className="text-xs font-mono text-[#4f46e5] font-bold">02 / Auto-Expiring Requests</div>
                    <p className="text-xs ac-body">Needs and beacons automatically expire after 7 days, eliminating stale ghost requests from previous quarters.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                    <div className="text-xs font-mono text-[#4f46e5] font-bold">03 / 100% First-Party Control</div>
                    <p className="text-xs ac-body">You approve what gets published. Private code, private repos, and local context never leave your sovereignty.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6">
                <div className="ac-on-dark p-6 rounded-2xl bg-[#0b1120] border border-white/20 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-[#94a3b8] border-b border-white/[0.08] pb-3">
                    <span className="flex items-center gap-2 text-white font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ACTIVE TELEMETRY STREAM
                    </span>
                    <span className="text-[#818cf8]">VERIFIED SYNC</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-[#1a2236] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                        <span>CURSOR / GIT COMMIT · 12m ago</span>
                        <span className="text-[#818cf8]">SIGNAL EXTRACTED</span>
                      </div>
                      <div className="text-white text-xs">chandan/agent-protocol: added multi-model router tests</div>
                      <div className="text-[10px] text-emerald-400">✓ Signal updated: Working On</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#1a2236] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                        <span>GITHUB PR #42 · 1d ago</span>
                        <span className="text-emerald-400">MERGED</span>
                      </div>
                      <div className="text-white text-xs">&quot;GPU memory profiling under heavy context workloads&quot;</div>
                      <div className="text-[10px] text-[#94a3b8]">✓ Signal refreshed: Can Help With</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#1a2236] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                        <span>7-DAY BEACON TIMEOUT · 7d reached</span>
                        <span className="text-amber-400">EXPIRED</span>
                      </div>
                      <div className="text-white text-xs">Request &quot;Looking for Redis pairing&quot; auto-retired</div>
                      <div className="text-[10px] text-[#94a3b8]">✓ Beacon cleared: Stale request avoided</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-paper">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="dual-interface" id="dual-view">
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="ac-kicker">{"// 07 DUAL INTERFACE"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">One identity. Two audiences.</h2>
              <p className="text-sm sm:text-base ac-body">Built for people to read. Structured for agents to understand.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-[#cbd5e1] space-y-5">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                  <span className="text-xs font-mono font-bold text-[#0f172a]">HUMAN INTERFACE</span>
                  <span className="text-[10px] font-mono text-[#64748b]">zynd.me/@chandan</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-[#0f172a] text-base">Chandan Kumar</h4>
                      <div className="text-xs text-[#64748b]">Founding Engineer &amp; Distributed Systems</div>
                    </div>
                    <span className="text-xs font-mono bg-[#4f46e5] text-white font-semibold px-3 py-1 rounded-full cursor-pointer">Book Intro</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="text-[#334155]">
                      <span className="text-[#4f46e5] font-mono text-[10px] uppercase block">Working On:</span>
                      &quot;Agent-native discovery protocols and schema validators.&quot;
                    </div>
                    <div className="text-[#334155]">
                      <span className="text-[#4f46e5] font-mono text-[10px] uppercase block">Can Help With:</span>
                      &quot;AI agent architecture · Distributed systems · Rust concurrency&quot;
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#475569] pt-1">
                    <span className="bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">Rust</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">Python</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">Distributed Systems</span>
                  </div>
                </div>
                <p className="text-xs ac-body font-mono">
                  Designed for scanability: human founders, collaborators, and hiring leads instantly understand active momentum.
                </p>
              </div>
              <div className="ac-on-dark p-6 sm:p-8 rounded-[28px] bg-[#0b1120] border border-white/20 space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <span className="text-xs font-mono font-bold text-[#818cf8]">AGENT INTERFACE (JSON-LD / LLMS.TXT)</span>
                  <span className="text-[10px] font-mono text-[#94a3b8]">application/json</span>
                </div>
                <pre className="p-4 rounded-2xl bg-[#080c18] border border-white/10 text-[11px] font-mono text-[#cbd5e1] overflow-x-auto max-w-full leading-relaxed"><code>{`{
  "@context": "https://schema.org",
  "@type": "LivingProfile",
  "handle": "chandan",
  "status": "active_this_week",
  "signals": {
    "working_on": "Agent-native discovery protocol",
    "can_help_with": [
      "AI agent architecture",
      "Distributed systems"
    ],
    "looking_for": "Local LLM harness engineers",
    "beacon_expires_at": "2026-04-01T00:00:00Z"
  },
  "verified_sources": ["github", "linkedin", "x"]
}`}</code></pre>
                <p className="text-xs text-[#94a3b8] font-mono">
                  Exposes semantic vectors indexable by Claude, OpenAI, and custom autonomous agents matching high-leverage opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-mist">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="privacy-boundaries" id="privacy">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="ac-kicker">{"// 08 SOVEREIGN CONTROL"}</div>
              <h2 className="ac-h2 text-3xl sm:text-5xl text-[#0b1220]">You control what your identity says.</h2>
              <p className="text-sm sm:text-base ac-body">Clear, unbreakable boundaries. Your work remains 100% your own.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-3">
                <div className="text-[10px] font-mono text-[#4f46e5] uppercase tracking-wider">01 // PUBLISHED</div>
                <h3 className="font-extrabold text-[#0f172a] text-base">What Gets Published</h3>
                <p className="text-xs ac-body leading-relaxed">Your 3 active living signals, your public handle, and links to your verified public traces.</p>
                <ul className="text-[11px] font-mono text-[#475569] space-y-1 pt-1">
                  <li>• Working on signal</li>
                  <li>• Can help with topics</li>
                  <li>• 7-day beacons</li>
                </ul>
              </div>
              <div className="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-3">
                <div className="text-[10px] font-mono text-[#be123c] uppercase tracking-wider">02 // PRIVATE</div>
                <h3 className="font-extrabold text-[#0f172a] text-base">What Stays Private</h3>
                <p className="text-xs ac-body leading-relaxed">Raw source code, private repositories, local prompt logs, and personal contact details are never exposed.</p>
                <ul className="text-[11px] font-mono text-[#475569] space-y-1 pt-1">
                  <li>• Private repositories</li>
                  <li>• Editor &amp; prompt logs</li>
                  <li>• Phone &amp; private email</li>
                </ul>
              </div>
              <div className="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-3">
                <div className="text-[10px] font-mono text-[#4f46e5] uppercase tracking-wider">03 // AI SYNC</div>
                <h3 className="font-extrabold text-[#0f172a] text-base">What Your AI Updates</h3>
                <p className="text-xs ac-body leading-relaxed">Only explicitly authorized contexts. Changes appear in preview first; revoke authorization in one click.</p>
                <ul className="text-[11px] font-mono text-[#475569] space-y-1 pt-1">
                  <li>• Shipped release notes</li>
                  <li>• Public PR summaries</li>
                  <li>• 1-click token revoke</li>
                </ul>
              </div>
              <div className="p-6 rounded-[22px] bg-white border border-[#e2e8f0] space-y-3">
                <div className="text-[10px] font-mono text-[#4f46e5] uppercase tracking-wider">04 // DISCOVERY</div>
                <h3 className="font-extrabold text-[#0f172a] text-base">What Agents Discover</h3>
                <p className="text-xs ac-body leading-relaxed">Controlled semantic metadata only. Agents can match relevance and request an intro without bulk scraping.</p>
                <ul className="text-[11px] font-mono text-[#475569] space-y-1 pt-1">
                  <li>• Structured intent signals</li>
                  <li>• Relevance explanations</li>
                  <li>• Rate-limited queries</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-ink">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="founding-network" id="network">
          <div className="ac-on-dark p-8 sm:p-12 lg:p-14 rounded-[28px] bg-[#0b1120] border border-[#818cf8]/60 space-y-8 text-center shadow-[0_28px_60px_-24px_rgba(79,70,229,0.45)]">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c7d2fe] bg-[#312e81] border border-[#818cf8] px-4 py-1.5 rounded-full">
              BATCH 01 // EARLY NETWORK FORMATION
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="ac-h2 text-3xl sm:text-5xl">We&apos;re building the first layer of the network with 25 people.</h2>
              <p className="text-sm sm:text-base">
                We&apos;re not trying to create another directory with 10 million empty profiles. We&apos;re starting with people who are actually building.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-[#0b1120] border border-white/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#cbd5e1]">Founding Network Status:</span>
                <span className="text-[#c7d2fe] font-bold">17 / 25 spots claimed</span>
              </div>
              <div className="flex items-center justify-center -space-x-2 pt-1">
                {["CK", "AR", "KD", "SB", "LN"].map(ini => (
                  <span key={ini} className="w-8 h-8 rounded-full bg-[#0f172a] border-2 border-white text-white flex items-center justify-center text-[10px] font-mono font-bold">{ini}</span>
                ))}
                <span className="w-8 h-8 rounded-full bg-[#eef2ff] border-2 border-white text-[#4f46e5] flex items-center justify-center text-[10px] font-mono font-bold">+12</span>
              </div>
            </div>
            <div>
              <a className="ac-btn ac-btn-primary text-sm py-4 px-8" href="#ingestion">
                Apply for Founding Network <span>→</span>
              </a>
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-paper">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="faq">
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="ac-kicker">{"// 10 KNOWLEDGE BASE"}</div>
              <h2 className="ac-h2 text-3xl sm:text-4xl text-[#0b1220]">Clear, honest answers.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                ["What is a Zynd profile?", "A Zynd profile is a living identity card built for modern technical builders. Instead of a static resume or list of links, it distills what you are working on right now, what you can help with, and what you are looking for—legible to both people and AI agents."],
                ["Do I need to manually create it?", "No. You paste your GitHub handle or LinkedIn URL. Zynd ingests the public evidence, parses your technical focus in 60 seconds, and presents a completed living draft for you to review or edit."],
                ["Can AI agents actually search my profile?", "Yes. Zynd exposes structured JSON-LD and semantic llms.txt endpoints. When someone asks their AI \"who is building local quantization runtimes in Rust?\", the agent can query Zynd's protocol and surface you with exact reasoning."],
                ["What can my AI update?", "Only what you authorize. When you link Cursor, GitHub, or an LLM harness, Zynd refreshes your active tags and project summaries based on real commits and public releases. You retain full preview and 1-click revocation at all times."],
                ["Is my profile public?", "Your living signals and public links are accessible via your custom handle (zynd.me/@you). However, your private code, local IDE buffers, and personal contact details remain private and are never indexed."],
                ["Who is Zynd for?", "Engineers, researchers, technical founders, and builders who ship active code. If your career moves faster than a yearly resume update, Zynd keeps the world in sync with your real work."],
              ].map(([q, a]) => (
                <details key={q} className="group p-5 rounded-[22px] bg-white border border-[#e2e8f0] transition-all open:border-[#4f46e5]">
                  <summary className="font-semibold text-[#0f172a] text-sm sm:text-base flex items-center justify-between cursor-pointer list-none">
                    <span>{q}</span>
                    <span className="text-[#4f46e5] transition-transform group-open:rotate-45 font-mono text-xl">+</span>
                  </summary>
                  <p className="text-xs sm:text-sm leading-relaxed ac-body pt-3 border-t border-[#e2e8f0] mt-3">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        </div>

        <div className="ac-band ac-band-ink">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" data-purpose="final-cta">
          <div className="ac-on-dark p-8 sm:p-14 rounded-[28px] bg-[#0b1120] border border-white/15 space-y-6 text-center shadow-[0_28px_60px_-24px_rgba(15,23,42,0.55)]">
            <div className="text-xs font-mono text-[#c7d2fe] uppercase tracking-widest">CLAIM YOUR LIVING HANDLE</div>
            <h2 className="ac-h2 text-3xl sm:text-5xl">
              Your AI knows what you&apos;re building. <br />
              <span className="text-[#a5b4fc]">Make it discoverable.</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#94a3b8] max-w-lg mx-auto">
              Create → become discoverable → discover others → stay current.
            </p>
            <div className="max-w-md mx-auto space-y-3 pt-2">
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3.5 transition-colors ${
                handleStatus === "available" ? "border-emerald-500" :
                handleStatus === "taken" ? "border-red-500" :
                handleStatus === "error" ? "border-amber-500/60" :
                "border-transparent focus-within:border-[#818cf8]"
              }`}>
                <span className="text-xs font-mono text-[#64748b] select-none pr-1 whitespace-nowrap">zynd.ai/p/</span>
                <input
                  className="w-full bg-transparent border-none p-0 text-sm font-mono text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-0 focus:outline-none"
                  placeholder="your-handle"
                  type="text"
                  value={handle}
                  onChange={e => onHandleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") claimHandle(); }}
                  autoComplete="off"
                  spellCheck="false"
                />
                {handleStatus === "checking" && <span className="text-[10px] font-mono text-[#64748b] ml-2 shrink-0">checking…</span>}
                {handleStatus === "available" && <span className="text-[10px] font-mono text-emerald-600 ml-2 shrink-0">✓ available</span>}
                {handleStatus === "taken" && <span className="text-[10px] font-mono text-red-500 ml-2 shrink-0">✗ taken</span>}
                {handleStatus === "error" && <span className="text-[10px] font-mono text-amber-600 ml-2 shrink-0">can&apos;t verify</span>}
              </div>
              {handleStatus === "taken" ? (
                <div className="text-center text-xs font-mono text-red-400 py-1">That handle is taken — try another one.</div>
              ) : (
                <button
                  type="button"
                  disabled={handle.length < 2 || handleStatus === "checking"}
                  onClick={claimHandle}
                  className="ac-btn ac-btn-primary w-full text-sm py-4 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {handle.length >= 2 && (handleStatus === "available" || handleStatus === "error")
                    ? `Claim zynd.ai/p/${handle} →`
                    : "Create your Living Profile →"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#94a3b8] pt-3">
              <span>● Free to create</span>
              <span>● Own your identity</span>
              <span>● Full privacy control</span>
            </div>
          </div>
        </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#070b14] py-14 px-4 sm:px-6 lg:px-8" data-purpose="site-footer">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <img src="/assets/zynd-logo.png" alt="Zynd" className="h-6 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
                <span className="text-sm font-extrabold text-white">Zynd</span>
              </div>
              <p className="text-xs text-[#94a3b8] font-mono max-w-md">
                The living professional identity for technical builders and AI agents. Synthesizing digital footprints into sovereign, discoverable assets.
              </p>
            </div>
            <div className="flex flex-wrap gap-7 text-xs font-mono text-[#cbd5e1]">
              <a className="hover:text-white transition-colors" href="#">Manifesto</a>
              <a className="hover:text-white transition-colors" href="#">Discovery Index</a>
              <a className="hover:text-white transition-colors" href="#">Agent Specs</a>
              <a className="hover:text-white transition-colors" href="#">Privacy</a>
              <a className="hover:text-white transition-colors" href="#">Terms</a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#94a3b8]">
            <div>© 2026 ZYND INC. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>NETWORK OPERATIONAL</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
