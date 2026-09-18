"use client";

import { useEffect, useRef, useState } from "react";

type Profile = {
  initials: string;
  name: string;
  role: string;
  handleGh: string;
  handleLi: string;
  handleX: string;
  location: string;
  building: string;
  talks: string;
  summary: string;
  talking: string[];
  working: string[];
  connect: string[];
  tech: string[];
  updated: string;
};

const PROFILES: Profile[] = [
  {
    initials: "CK",
    name: "Chandan Kumar",
    role: "AI Enthusiast · Golang Developer",
    handleGh: "@CHANDAN867",
    handleLi: "in/chandankumar7654",
    handleX: "@vivekans2016",
    location: "India",
    building: "BUILDING A STARTUP",
    talks: "AI / ML",
    summary:
      "Chandan Kumar is a passionate developer focused on Generative AI and AI agents, with a strong background in Golang, Node.js, and Java. He actively contributes to various projects and is involved in the tech community, seeking opportunities to collaborate and mentor others.",
    talking: ["AI / ML", "Agentic AI"],
    working: ["Building a startup"],
    connect: ["Founders", "Investors"],
    tech: ["Golang", "Node.js", "Java"],
    updated: "SEP 2026",
  },
  {
    initials: "MO",
    name: "Maya Okafor",
    role: "Realtime systems · WASM",
    handleGh: "@mayaokafor",
    handleLi: "in/mayaokafor",
    handleX: "@mayaokafor",
    location: "Lagos",
    building: "CRDT ENGINE",
    talks: "SYNC / CRDTS",
    summary:
      "Maya Okafor builds conflict-free replication engines for multiplayer design tools. She ships Rust and WASM into production editors and is looking for teams who need realtime collaboration this quarter.",
    talking: ["CRDTs", "WASM"],
    working: ["Realtime sync"],
    connect: ["Editors", "Founders"],
    tech: ["Rust", "WASM", "CRDTs"],
    updated: "SEP 2026",
  },
  {
    initials: "DM",
    name: "Diego Marín",
    role: "Retrieval · Eval design",
    handleGh: "@diegomarin",
    handleLi: "in/diegomarin",
    handleX: "@diegomarin",
    location: "CDMX",
    building: "EVAL HARNESS",
    talks: "RETRIEVAL",
    summary:
      "Diego Marín maintains an open evaluation harness for retrieval pipelines. He benchmarks messy internal search against public suites and publishes the gaps so teams can ship better ranking.",
    talking: ["Retrieval", "Evals"],
    working: ["Open eval harness"],
    connect: ["Search teams", "Researchers"],
    tech: ["Python", "Eval", "IR"],
    updated: "SEP 2026",
  },
  {
    initials: "AR",
    name: "Aisha Rahman",
    role: "Edge inference · Audio DSP",
    handleGh: "@aisharahman",
    handleLi: "in/aisharahman",
    handleX: "@aisharahman",
    location: "London",
    building: "ON-DEVICE SPEECH",
    talks: "EDGE ML",
    summary:
      "Aisha Rahman works on latency budgets for on-device speech models. She partners with hardware teams on wearable listening prototypes and ships CoreML paths that stay under a frame.",
    talking: ["Edge ML", "Audio"],
    working: ["On-device speech"],
    connect: ["Hardware", "DSP"],
    tech: ["CoreML", "DSP", "Swift"],
    updated: "SEP 2026",
  },
  {
    initials: "TF",
    name: "Tomás Feliu",
    role: "Compilers · Agent tooling",
    handleGh: "@tomasfeliu",
    handleLi: "in/tomasfeliu",
    handleX: "@tomasfeliu",
    location: "Barcelona",
    building: "TYPED TOOL SPECS",
    talks: "TYPE SYSTEMS",
    summary:
      "Tomás Feliu is designing a type system for agent tool schemas. He wants maintainers who care about typed, verifiable tool specs instead of free-form JSON blobs.",
    talking: ["Types", "Agents"],
    working: ["Tool schema types"],
    connect: ["Maintainers", "Devtools"],
    tech: ["TypeScript", "Compilers"],
    updated: "SEP 2026",
  },
];

const N = PROFILES.length;
const DWELL = 2200;
const SPREAD = 10;
const EMPTY_HOLD = 850;
const REASSEMBLE_EXTRA = 900;
const SKEW = [0, -0.9, 0.7, -0.5, 1.0, -0.4];
const SHIFT = [0, 6, -7, 4, -5, 6];

function cardStyle(i: number, step: number, reassembling: boolean): React.CSSProperties {
  const d = i - step;
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: 780,
    height: 780,
    transformOrigin: "50% 100%",
    willChange: "transform, opacity",
    transition:
      "transform 900ms cubic-bezier(.22,.9,.24,1), opacity 700ms ease, filter 900ms ease",
  };

  if (d < 0) {
    return {
      ...base,
      transform: "translate3d(110%, -4%, 0) rotate(5deg) scale(0.97)",
      opacity: 0,
      zIndex: 200 + i,
      filter: "brightness(1)",
      transitionDelay: "0ms",
    };
  }

  return {
    ...base,
    transform:
      `translate3d(${SHIFT[d % SHIFT.length] * (d ? 1 : 0)}px, ${d * SPREAD}px, 0)` +
      ` rotate(${SKEW[d % SKEW.length]}deg)` +
      ` scale(${1 - d * 0.01})`,
    opacity: d > 4 ? 0 : 1,
    zIndex: 100 - d,
    filter: `brightness(${1 - Math.min(d, 4) * 0.04})`,
    transitionDelay: reassembling ? `${(N - 1 - d) * 90}ms` : "0ms",
  };
}

export function HeroCardStack() {
  const [step, setStep] = useState(0);
  const [reassembling, setReassembling] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scale, setScale] = useState(0.64);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / 780);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const delay =
      step === N ? EMPTY_HOLD
      : step === 0 && reassembling ? DWELL + REASSEMBLE_EXTRA
      : DWELL;
    const t = setTimeout(() => {
      const next = step >= N ? 0 : step + 1;
      setReassembling(next === 0);
      setStep(next);
    }, delay);
    return () => clearTimeout(t);
  }, [step, reassembling, paused]);

  const active = Math.min(step, N - 1);
  const front = step >= N ? N : step + 1;

  return (
    <div className="flex flex-col gap-4 min-w-0 w-full max-w-full">
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: 780,
            height: 780,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {PROFILES.map((p, i) => (
            <div key={p.handleGh} style={cardStyle(i, step, reassembling)}>
              <DossierCard profile={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 min-w-0 w-full">
        <span className="font-mono text-[11px] tracking-widest uppercase text-[#64748b] truncate">
          {String(front).padStart(2, "0")} / {String(N).padStart(2, "0")} living profiles
        </span>
        <div className="flex gap-1.5 shrink-0">
          {PROFILES.map((p, i) => (
            <span
              key={p.handleGh}
              className="block h-[7px] rounded-full"
              style={{
                width: i === active ? "18px" : "7px",
                background: i === active ? "#4f46e5" : "#cbd5e1",
                transition: "width 400ms ease, background 400ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DossierCard({ profile }: { profile: Profile }) {
  return (
    <div className="dossier">
      <div className="dossier-row-top">
        <div className="dossier-purple">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="dossier-avatar">{profile.initials}</div>
            <span className="dossier-verified">✓ VERIFIED</span>
          </div>
          <div>
            <span className="dossier-im">I&apos;m</span>
            <h2 className="dossier-name">{profile.name}</h2>
            <span className="dossier-role">{profile.role}</span>
            <div className="dossier-tag-row">
              <div className="dossier-tag-item">
                <span className="dossier-tag-label">BUILDING</span>
                <span className="dossier-tag-val">{profile.building}</span>
              </div>
              <div className="dossier-tag-item">
                <span className="dossier-tag-label">TALKS ABOUT</span>
                <span className="dossier-tag-val">{profile.talks}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="dossier-socials">
              <span>𝕏</span> <span>GitHub</span> <span>LinkedIn</span>
            </div>
            <div className="dossier-date">Updated {profile.updated} · {profile.location}</div>
          </div>
        </div>

        <div className="dossier-right">
          <div className="dossier-box">
            <div className="bracket" style={{ marginBottom: 8 }}>
              <span style={{ color: "#475569" }}>┌ DOSSIER SUMMARY</span>
              <span style={{ color: "#4f46e5" }}>ZYND VERIFIED ┐</span>
            </div>
            <p className="dossier-body">{profile.summary}</p>
          </div>
          <div className="dossier-signals">
            <div className="dossier-signal sig-mint">
              <div className="bracket">┌ LOVE TALKING ABOUT ┐</div>
              <div>
                {profile.talking.map(t => (
                  <span key={t} className="sig-pill" style={{ marginRight: 4 }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="dossier-signal sig-yellow">
              <div className="bracket">┌ WORKING ON ┐</div>
              <div>
                {profile.working.map(t => (
                  <span key={t} className="sig-pill">{t}</span>
                ))}
              </div>
            </div>
            <div className="dossier-signal sig-indigo">
              <div className="bracket">┌ CONNECT WITH ┐</div>
              <div>
                {profile.connect.map(t => (
                  <span key={t} className="sig-pill" style={{ marginRight: 4 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dossier-row-mid">
        <div className="dossier-ai">
          <div className="dossier-ai-head">
            <span>AI DISCOVERABILITY FACT</span>
            <span className="dossier-badge">Zynd Index</span>
          </div>
          <div className="dossier-code">
            <span className="c-comment">{"// Structured discovery profile"}</span><br />
            <span className="c-key">entity:</span> <span className="c-str">&quot;{profile.name}&quot;</span><br />
            <span className="c-key">specialization:</span> <span className="c-str">&quot;{profile.role}&quot;</span><br />
            <span className="c-key">primary_tech:</span> [{profile.tech.map((t, i) => (
              <span key={t}><span className="c-arr">&quot;{t}&quot;</span>{i < profile.tech.length - 1 ? ", " : ""}</span>
            ))}]
          </div>
          <p className="dossier-ai-foot">
            Structured for AI agents (ChatGPT, Claude, Perplexity) to discover and recommend {profile.name.split(" ")[0]} for specialized queries.
          </p>
        </div>
        <div className="dossier-work">
          <div className="bracket">
            <span>┌ WORK EXPERIENCE</span>
            <span>┐</span>
          </div>
          <div>
            <div className="exp-title">{profile.role}</div>
            <div className="exp-sub">{profile.location}</div>
          </div>
          <p className="exp-note">
            Public traces on GitHub, LinkedIn, and X — experience appears here after connecting.
          </p>
        </div>
      </div>

      <div className="dossier-row-bot">
        <div className="bar bar-li">
          <div className="bar-title">LINKEDIN /</div>
          <div className="bar-handle">{profile.handleLi}</div>
        </div>
        <div className="bar bar-x">
          <div className="bar-title">X / TWITTER /</div>
          <div className="bar-handle">{profile.handleX}</div>
        </div>
        <div className="bar bar-gh">
          <div className="bracket" style={{ marginBottom: 2, color: "#64748b" }}>
            <span>┌ GITHUB STATS /</span>
            <span>┐</span>
          </div>
          <div className="bar-handle">{profile.handleGh}</div>
        </div>
      </div>
    </div>
  );
}
