import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin, Calendar, ExternalLink, Briefcase, Quote, Globe,
  Github, Twitter, Linkedin, Shield, Cpu, Network, Code2,
  CheckSquare, Layers, Search,
} from "lucide-react";

import {
  fetchCardByHandle,
  cardCanonicalUrl,
  type AgentProfileCard,
} from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ handle: string }>;
}

// ─── token system ──────────────────────────────────────────────────────────────
const T = {
  bg:        "#f0f2f7",
  surface:   "#ffffff",
  navy:      "#0d1b2a",
  accent:    "#5b7cfa",
  accentMid: "#eff3ff",
  border:    "rgba(0,0,0,0.07)",
  shadow:    "0 1px 2px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)",
  textPri:   "#0f172a",
  textSec:   "#475569",
  textTert:  "#94a3b8",
} as const;

// ─── skill → simpleicons slug ──────────────────────────────────────────────────
const SKILL_SLUGS: Record<string, string> = {
  "react": "react",
  "typescript": "typescript",
  "javascript": "javascript",
  "python": "python",
  "go": "go",
  "golang": "go",
  "rust": "rust",
  "node.js": "nodedotjs",
  "nodejs": "nodedotjs",
  "node": "nodedotjs",
  "next.js": "nextdotjs",
  "nextjs": "nextdotjs",
  "postgresql": "postgresql",
  "postgres": "postgresql",
  "mongodb": "mongodb",
  "docker": "docker",
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",
  "aws": "amazonaws",
  "amazon web services": "amazonaws",
  "gcp": "googlecloud",
  "google cloud": "googlecloud",
  "azure": "microsoftazure",
  "graphql": "graphql",
  "prisma": "prisma",
  "tailwind": "tailwindcss",
  "tailwindcss": "tailwindcss",
  "solidity": "solidity",
  "ethereum": "ethereum",
  "vue": "vuedotjs",
  "vue.js": "vuedotjs",
  "angular": "angular",
  "swift": "swift",
  "kotlin": "kotlin",
  "java": "openjdk",
  "c++": "cplusplus",
  "c#": "csharp",
  "ruby": "ruby",
  "rails": "rubyonrails",
  "redis": "redis",
  "supabase": "supabase",
  "firebase": "firebase",
  "vercel": "vercel",
  "github": "github",
  "gitlab": "gitlab",
  "linux": "linux",
  "figma": "figma",
  "svelte": "svelte",
  "webassembly": "webassembly",
  "wasm": "webassembly",
  "openai": "openai",
  "tensorflow": "tensorflow",
  "pytorch": "pytorch",
  "huggingface": "huggingface",
  "stripe": "stripe",
  "mysql": "mysql",
  "sqlite": "sqlite",
  "ansible": "ansible",
  "terraform": "terraform",
  "git": "git",
  "bash": "gnubash",
  "shell": "gnubash",
  "zsh": "gnubash",
  "elixir": "elixir",
  "scala": "scala",
  "haskell": "haskell",
  "flutter": "flutter",
  "dart": "dart",
  "unity": "unity",
  "unreal": "unrealengine",
  "solana": "solana",
  "polygon": "polygon",
  "nginx": "nginx",
  "apache": "apache",
  "jenkins": "jenkins",
  "jira": "jira",
  "notion": "notion",
  "slack": "slack",
  "fastapi": "fastapi",
  "django": "django",
  "flask": "flask",
  "spring": "spring",
  "laravel": "laravel",
  "php": "php",
  "wordpress": "wordpress",
  "elasticsearch": "elasticsearch",
  "kafka": "apachekafka",
  "rabbitmq": "rabbitmq",
  "celery": "celery",
  "pandas": "pandas",
  "numpy": "numpy",
  "scikit": "scikitlearn",
  "langchain": "langchain",
};

function skillSlug(name: string): string | null {
  const raw = name.toLowerCase().trim();
  if (SKILL_SLUGS[raw]) return SKILL_SLUGS[raw];
  const abbrevMatch = raw.match(/\(([^)]+)\)/);
  if (abbrevMatch) {
    const abbrev = abbrevMatch[1].trim();
    if (SKILL_SLUGS[abbrev]) return SKILL_SLUGS[abbrev];
  }
  const stripped = raw.replace(/\s*\([^)]*\)/g, "").trim();
  if (stripped !== raw && SKILL_SLUGS[stripped]) return SKILL_SLUGS[stripped];
  const firstWord = raw.split(/[\s(]/)[0];
  if (firstWord.length > 1 && SKILL_SLUGS[firstWord]) return SKILL_SLUGS[firstWord];
  return null;
}

// ─── devicons CDN (colorful, great for languages) ──────────────────────────────
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const DEVICON_SLUGS: Record<string, string> = {
  "c": "c/c-original",
  "c++": "cplusplus/cplusplus-original",
  "c#": "csharp/csharp-original",
  "java": "java/java-original",
  "ruby": "ruby/ruby-original",
  "php": "php/php-original",
  "swift": "swift/swift-original",
  "kotlin": "kotlin/kotlin-original",
  "haskell": "haskell/haskell-original",
  "scala": "scala/scala-original",
  "elixir": "elixir/elixir-original",
  "dart": "dart/dart-original",
  "flutter": "flutter/flutter-original",
  "perl": "perl/perl-plain",
  "r": "r/r-original",
  "lua": "lua/lua-original",
  "vim": "vim/vim-original",
  "nginx": "nginx/nginx-original",
  "apache": "apache/apache-original",
  "ansible": "ansible/ansible-original",
  "jenkins": "jenkins/jenkins-original",
  "webpack": "webpack/webpack-original",
  "jest": "jest/jest-plain",
  "selenium": "selenium/selenium-original",
  "unity": "unity/unity-original",
  "matlab": "matlab/matlab-original",
  "bash": "bash/bash-original",
  "shell scripting": "bash/bash-original",
  "zsh": "bash/bash-original",
  "mysql": "mysql/mysql-original",
  "sqlite": "sqlite/sqlite-original",
  "redis": "redis/redis-original",
  "mongodb": "mongodb/mongodb-original",
  "postgresql": "postgresql/postgresql-original",
  "prometheus": "prometheus/prometheus-original",
  "grafana": "grafana/grafana-original",
  "heroku": "heroku/heroku-original",
  "arduino": "arduino/arduino-original",
  "nuxt": "nuxtjs/nuxtjs-original",
  "nuxt.js": "nuxtjs/nuxtjs-original",
  "gatsby": "gatsby/gatsby-original",
  "vite": "vitejs/vitejs-original",
  "solidity": "solidity/solidity-original",
  "objectivec": "objectivec/objectivec-plain",
  "assembly": "labview/labview-original",
};

function deviconSlug(name: string): string | null {
  const raw = name.toLowerCase().trim();
  if (DEVICON_SLUGS[raw]) return DEVICON_SLUGS[raw];
  const stripped = raw.replace(/\s*\([^)]*\)/g, "").trim();
  if (stripped !== raw && DEVICON_SLUGS[stripped]) return DEVICON_SLUGS[stripped];
  const firstWord = raw.split(/[\s(]/)[0];
  if (firstWord.length > 1 && DEVICON_SLUGS[firstWord]) return DEVICON_SLUGS[firstWord];
  return null;
}

// ─── category-based icons for conceptual / non-brand skills ───────────────────
type SkillCategory = "security" | "blockchain" | "hardware" | "testing" | "networking" | "generic";

function skillCategory(name: string): SkillCategory {
  const n = name.toLowerCase();
  if (/security|penetrat|owasp|vuln|exploit|hack|cybersec|ctf|malware|forensic|threat|audit|zap|red.team|reverse|encrypt|deciph/.test(n)) return "security";
  if (/blockchain|smart.contract|defi|cryptoeco|nft|web3|foundry|huff|hardhat|anchor|solidity|ethereum|bitcoin|zkp|zk.proof|layer.2|l2|rollup|evm/.test(n)) return "blockchain";
  if (/assembl|hardware|fpga|vhdl|verilog|embedded|firmware|microcontrol|circuit|soc/.test(n)) return "hardware";
  if (/test|qa|quality|assert|spec|jest|cypress|selenium|playwright|formal.verif|verification|tdd|bdd/.test(n)) return "testing";
  if (/network|tcp|http|api\s|api$|rest|grpc|socket|protocol|dns|web.service|load.balanc/.test(n)) return "networking";
  return "generic";
}

const CATEGORY_STYLE: Record<SkillCategory, { color: string; bg: string }> = {
  security:   { color: "#dc2626", bg: "#fee2e2" },
  blockchain: { color: "#7c3aed", bg: "#ede9fe" },
  hardware:   { color: "#475569", bg: "#e2e8f0" },
  testing:    { color: "#059669", bg: "#d1fae5" },
  networking: { color: "#0284c7", bg: "#e0f2fe" },
  generic:    { color: "#5b7cfa", bg: "#eff3ff" },
};

function CategoryIcon({ category, size }: { category: SkillCategory; size: number }) {
  if (category === "security")   return <Shield   size={size} />;
  if (category === "blockchain") return <Layers   size={size} />;
  if (category === "hardware")   return <Cpu      size={size} />;
  if (category === "testing")    return <CheckSquare size={size} />;
  if (category === "networking") return <Network  size={size} />;
  return <Code2 size={size} />;
}

function SkillIcon({ name, size = 16 }: { name: string; size?: number }) {
  const simpleSlug = skillSlug(name);
  if (simpleSlug) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`https://cdn.simpleicons.org/${simpleSlug}`} alt="" width={size} height={size}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain", flexShrink: 0 }} />
    );
  }
  const dvSlug = deviconSlug(name);
  if (dvSlug) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`${DEVICON_BASE}/${dvSlug}.svg`} alt="" width={size} height={size}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain", flexShrink: 0 }} />
    );
  }
  const cat = skillCategory(name);
  const style = CATEGORY_STYLE[cat];
  const iconSize = Math.max(9, size - 4);
  return (
    <span style={{ width: `${size + 2}px`, height: `${size + 2}px`, borderRadius: "4px", background: style.bg, color: style.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <CategoryIcon category={cat} size={iconSize} />
    </span>
  );
}

// ─── utils ─────────────────────────────────────────────────────────────────────
function isBlank(s: string | null | undefined): boolean {
  if (!s) return true;
  const low = s.toLowerCase().trim();
  return low === "" || low === "n/a" || low === "not specified" || low === "unknown" || low === "none";
}

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

const LEVEL_META: Record<string, { label: string; color: string; bg: string }> = {
  expert:       { label: "Expert",    color: "#b45309", bg: "#fef3c7" },
  advanced:     { label: "Advanced",  color: "#6d28d9", bg: "#ede9fe" },
  intermediate: { label: "Mid",       color: "#1d4ed8", bg: "#dbeafe" },
  beginner:     { label: "Beginner",  color: "#065f46", bg: "#d1fae5" },
};

function levelMeta(level: string) {
  return LEVEL_META[level.toLowerCase()] ?? LEVEL_META.intermediate;
}

// ─── SEO ───────────────────────────────────────────────────────────────────────
function buildJsonLd(card: AgentProfileCard) {
  const { identity } = card;
  const sameAs = Object.values(identity.links)
    .filter((v): v is string => Boolean(v))
    .filter((v) => /^https?:\/\//.test(v));
  const image = /^https?:\/\//.test(identity.avatar_url || "") ? identity.avatar_url : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: card.created_at,
    dateModified: card.updated_at,
    mainEntity: {
      "@type": "Person",
      name: identity.name,
      description: card.citation_snippet || card.summary,
      image,
      sameAs,
      knowsAbout: card.skills.map((s) => s.name),
      ...(identity.headline ? { hasOccupation: { "@type": "Occupation", name: identity.headline } } : {}),
      ...(identity.location ? { address: { "@type": "PostalAddress", addressLocality: identity.location } } : {}),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Zynd", item: "https://www.zynd.ai" },
        { "@type": "ListItem", position: 2, name: "Directory", item: "https://www.zynd.ai/directory" },
        { "@type": "ListItem", position: 3, name: identity.name, item: cardCanonicalUrl(card) },
      ],
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const card = await fetchCardByHandle(handle);
  if (!card) {
    return pageMetadata({ title: "Profile not found", description: "This profile does not exist on Zynd.", path: `/p/${handle}` });
  }
  const name = card.identity.name || "Profile";
  const headline = card.identity.headline;
  const canonical = cardCanonicalUrl(card);
  return {
    ...pageMetadata({
      title: headline ? `${name} — ${headline} — Zynd` : `${name} — Zynd`,
      description: card.citation_snippet || card.summary,
      path: `/p/${handle}`,
    }),
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: headline ? `${name} — ${headline}` : name,
      description: card.citation_snippet || card.summary,
      ...(card.identity.links.github ? { username: handle } : {}),
    },
  };
}

// ─── platform social icon ──────────────────────────────────────────────────────
function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "github") return <Github size={14} />;
  if (p === "x" || p === "twitter") return <Twitter size={14} />;
  if (p === "linkedin") return <Linkedin size={14} />;
  return <Globe size={14} />;
}

// ─── writing sample platform badge ────────────────────────────────────────────
function PlatformDot({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  const isX = p === "x" || p === "twitter";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
      color: isX ? "#0f172a" : "#0a66c2",
    }}>
      {isX ? <Twitter size={10} /> : <Linkedin size={10} />}
      {isX ? "X" : "LinkedIn"}
    </span>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default async function PersonPage({ params }: PageProps) {
  const { handle } = await params;
  const card = await fetchCardByHandle(handle);
  if (!card) notFound();

  const { identity } = card;
  const initials = (identity.name || "?")
    .split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const socialLinks = Object.entries(identity.links)
    .map(([p, u]) => [p, safeUrl(u)] as [string, string | null])
    .filter((e): e is [string, string] => e[1] !== null);

  const canonical = cardCanonicalUrl(card);
  const updated = card.updated_at
    ? new Date(card.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const bannerUrl = safeUrl(identity.avatar_bg_url);
  const avatarUrl = safeUrl(identity.avatar_url);

  return (
    <>
      <link rel="canonical" href={canonical} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(card)).replace(/</g, "\\u003c") }}
      />

      <style>{`
        @keyframes pf-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .pf-in { animation: pf-up 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .pf-in:nth-child(1) { animation-delay: 0.00s; }
        .pf-in:nth-child(2) { animation-delay: 0.06s; }
        .pf-in:nth-child(3) { animation-delay: 0.12s; }
        .pf-in:nth-child(4) { animation-delay: 0.18s; }
        .pf-in:nth-child(5) { animation-delay: 0.24s; }
        .pf-in:nth-child(6) { animation-delay: 0.30s; }

        .pf-grid {
          display: grid;
          grid-template-columns: 270px 1fr 250px;
          gap: 14px;
          align-items: start;
        }
        .pf-col-left  { grid-column: 1; display: flex; flex-direction: column; gap: 12px; }
        .pf-col-center { grid-column: 2; display: flex; flex-direction: column; gap: 12px; }
        .pf-col-right  { grid-column: 3; display: flex; flex-direction: column; gap: 12px; }

        .pf-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          box-shadow: ${T.shadow};
          overflow: hidden;
        }
        .pf-card-body { padding: 20px; }

        .pf-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: ${T.textTert}; margin-bottom: 14px;
        }

        .pf-social { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; background: #f8fafc; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.textSec}; font-size: 13px; font-weight: 500; text-decoration: none; text-transform: capitalize; transition: background 0.12s, border-color 0.12s; }
        .pf-social:hover { background: ${T.accentMid}; border-color: rgba(91,124,250,0.3); color: ${T.accent}; }

        .pf-skill { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; background: #f8fafc; border: 1px solid ${T.border}; border-radius: 8px; font-size: 13px; color: ${T.textPri}; font-weight: 500; transition: border-color 0.12s; }
        .pf-skill:hover { border-color: rgba(91,124,250,0.3); }

        .pf-project { padding: 14px 16px; background: #f8fafc; border: 1px solid ${T.border}; border-radius: 10px; transition: border-color 0.12s; }
        .pf-project:hover { border-color: rgba(91,124,250,0.3); }

        .pf-writing { padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .pf-writing:last-child { border-bottom: none; padding-bottom: 0; }
        .pf-writing:first-child { padding-top: 0; }

        .pf-back { display: inline-flex; align-items: center; gap: 6px; color: ${T.textTert}; font-size: 13px; text-decoration: none; transition: color 0.12s; font-weight: 500; }
        .pf-back:hover { color: ${T.textSec}; }

        .pf-tech-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #f8fafc; border: 1px solid ${T.border}; border-radius: 10px; transition: border-color 0.12s; }
        .pf-tech-icon:hover { border-color: rgba(91,124,250,0.3); background: ${T.accentMid}; }

        @media (max-width: 900px) {
          .pf-grid { grid-template-columns: 1fr 1fr; }
          .pf-col-left  { grid-column: 1 / -1; position: static; }
          .pf-col-center { grid-column: 1 / -1; }
          .pf-col-right  { grid-column: 1 / -1; }
        }
        @media (max-width: 580px) {
          .pf-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-in { animation: none; }
        }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: T.textPri }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px 80px" }}>

          {/* back link */}
          <div style={{ paddingTop: "20px", marginBottom: "20px" }}>
            <Link href="/directory" className="pf-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Directory
            </Link>
          </div>

          {/* ─── BENTO GRID ─── */}
          <div className="pf-grid">

            {/* ── LEFT column ── */}
            <div className="pf-col-left">

              {/* Identity card */}
              <div className="pf-card pf-in">
                {/* Banner */}
                <div style={{
                  height: "110px",
                  position: "relative",
                  background: bannerUrl
                    ? `url(${bannerUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, #5b7cfa 0%, #8b5cf6 100%)`,
                }}>
                  {/* dark overlay for readability when bg image present */}
                  {bannerUrl && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
                  )}
                  {/* Avatar */}
                  <div style={{ position: "absolute", bottom: "-28px", left: "20px" }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={identity.name}
                        width={60}
                        height={60}
                        style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", display: "block", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                      />
                    ) : (
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #5b7cfa, #8b5cf6)", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "40px 20px 20px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: T.textPri, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "4px" }}>
                    {identity.name}
                  </div>
                  {!isBlank(identity.headline) && (
                    <div style={{ fontSize: "13px", color: T.textSec, lineHeight: 1.5, marginBottom: "10px" }}>
                      {identity.headline}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {!isBlank(identity.location) && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: T.textTert }}>
                        <MapPin size={11} />
                        {identity.location}
                      </span>
                    )}
                    {updated && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: T.textTert }}>
                        <Calendar size={11} />
                        Updated {updated}
                      </span>
                    )}
                  </div>

                  {/* Social links */}
                  {socialLinks.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                      {socialLinks.map(([platform, url]) => (
                        <a key={platform} href={url} target="_blank" rel="noreferrer" className="pf-social">
                          <SocialIcon platform={platform} />
                          {platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Snapshot card */}
              {(card.experience_years != null || card.skills.length > 0 || card.writing_samples.length > 0 || card.projects.length > 0 || card.industries.length > 0 || !isBlank(card.availability)) && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">Snapshot</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {card.experience_years != null && (
                        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: T.accent, letterSpacing: "-0.03em" }}>{card.experience_years}</div>
                          <div style={{ fontSize: "11px", color: T.textTert, marginTop: "2px" }}>yrs experience</div>
                        </div>
                      )}
                      {card.projects.length > 0 && (
                        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: T.accent, letterSpacing: "-0.03em" }}>{card.projects.length}</div>
                          <div style={{ fontSize: "11px", color: T.textTert, marginTop: "2px" }}>projects</div>
                        </div>
                      )}
                      {card.skills.length > 0 && (
                        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: T.accent, letterSpacing: "-0.03em" }}>{card.skills.length}</div>
                          <div style={{ fontSize: "11px", color: T.textTert, marginTop: "2px" }}>skills</div>
                        </div>
                      )}
                      {card.writing_samples.length > 0 && (
                        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: T.accent, letterSpacing: "-0.03em" }}>{card.writing_samples.length}</div>
                          <div style={{ fontSize: "11px", color: T.textTert, marginTop: "2px" }}>posts</div>
                        </div>
                      )}
                    </div>

                    {/* industries */}
                    {card.industries.length > 0 && (
                      <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {card.industries.map((ind) => (
                          <span key={ind} style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", background: T.accentMid, color: T.accent }}>
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* availability */}
                    {!isBlank(card.availability) && (
                      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#065f46", fontWeight: 600, textTransform: "capitalize" }}>
                          Open to {card.availability}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Find similar people card */}
              <div className="pf-card pf-in">
                <div className="pf-card-body">
                  <div className="pf-section-label">Explore Zynd</div>
                  <p style={{ fontSize: "12px", color: T.textSec, lineHeight: 1.6, marginBottom: "14px" }}>
                    Find people with similar expertise in the Zynd directory
                  </p>
                  {card.skills.length > 0 && (
                    <Link
                      href={`/search?skills=${card.skills.slice(0, 3).map(s => encodeURIComponent(s.name)).join(",")}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", padding: "10px 14px", borderRadius: "10px", background: T.accent, marginBottom: "8px" }}
                    >
                      <Search size={13} />
                      Find Similar Profiles
                    </Link>
                  )}
                  <Link
                    href="/directory"
                    style={{ display: "block", textAlign: "center", fontSize: "12px", color: T.textTert, textDecoration: "none", padding: "6px" }}
                  >
                    Browse all profiles →
                  </Link>
                </div>
              </div>
            </div>

            {/* ── CENTER column ── */}
            <div className="pf-col-center">

              {/* About */}
              {!isBlank(card.summary) && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">About</div>
                    <div style={{ fontSize: "14px", color: T.textSec, lineHeight: 1.8 }}>{card.summary}</div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {card.skills.length > 0 && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {card.skills.slice().sort((a, b) => b.evidence_count - a.evidence_count).map((skill) => {
                        const meta = levelMeta(skill.level);
                        return (
                          <div key={skill.name} className="pf-skill">
                            <SkillIcon name={skill.name} size={16} />
                            <span>{skill.name}</span>
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: meta.bg, color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Writing samples */}
              {card.writing_samples.length > 0 && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div className="pf-section-label" style={{ marginBottom: 0 }}>Posts & Writing</div>
                      <span style={{ fontSize: "11px", color: T.textTert }}>{card.writing_samples.length} posts</span>
                    </div>
                    <div>
                      {card.writing_samples.slice(0, 10).map((sample, i) => {
                        const sampleUrl = safeUrl(sample.url);
                        return (
                          <div key={i} className="pf-writing">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                              <PlatformDot platform={sample.platform} />
                              {sampleUrl && (
                                <a href={sampleUrl} target="_blank" rel="noreferrer" style={{ color: T.textTert, flexShrink: 0 }}>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            <div style={{ fontSize: "13px", color: T.textSec, lineHeight: 1.7 }}>
                              {sample.excerpt.length > 320 ? sample.excerpt.slice(0, 317) + "…" : sample.excerpt}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Projects */}
              {card.projects.length > 0 && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">Projects</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                      {card.projects.map((project) => {
                        const projectUrl = safeUrl(project.url);
                        return (
                          <div key={project.name} className="pf-project">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: T.textPri }}>{project.name}</div>
                              {projectUrl && (
                                <a href={projectUrl} target="_blank" rel="noreferrer" style={{ color: T.textTert, flexShrink: 0 }}>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            {!isBlank(project.description) && (
                              <div style={{ fontSize: "12px", color: T.textSec, lineHeight: 1.6 }}>{project.description}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── RIGHT column ── */}
            <div className="pf-col-right">

              {/* Current role — dark navy card (signature element) */}
              {!isBlank(identity.headline) && (
                <div className="pf-card pf-in" style={{ background: T.navy, border: "none" }}>
                  <div className="pf-card-body">
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Briefcase size={10} />
                      Current Role
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", lineHeight: 1.4, marginBottom: "10px" }}>
                      {identity.headline}
                    </div>
                    {!isBlank(identity.location) && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                        <MapPin size={10} />
                        {identity.location}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tech stack icon grid — shows ALL skills with icons (3 libraries) */}
              {card.skills.length > 0 && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">Tech Stack</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {card.skills.slice().sort((a, b) => b.evidence_count - a.evidence_count).slice(0, 16).map((skill) => (
                        <div key={skill.name} className="pf-tech-icon" title={skill.name}>
                          <SkillIcon name={skill.name} size={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Citation quote card */}
              {!isBlank(card.citation_snippet) && (
                <div className="pf-card pf-in" style={{ background: "#eff6ff", border: "1px solid rgba(91,124,250,0.15)" }}>
                  <div className="pf-card-body" style={{ position: "relative" }}>
                    <Quote size={28} style={{ color: "rgba(91,124,250,0.2)", position: "absolute", top: "16px", right: "16px" }} />
                    <div style={{ fontSize: "13px", color: "#1e40af", lineHeight: 1.7, fontStyle: "italic", paddingRight: "24px" }}>
                      {card.citation_snippet}
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "11px", fontWeight: 700, color: "rgba(30,64,175,0.45)", letterSpacing: "0.08em" }}>
                      ZYND.AI
                    </div>
                  </div>
                </div>
              )}

              {/* Profile sources provenance */}
              {card.sources && card.sources.length > 0 && (
                <div className="pf-card pf-in">
                  <div className="pf-card-body">
                    <div className="pf-section-label">Profile Sources</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {card.sources.map((src, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: T.textSec, display: "flex", alignItems: "center" }}>
                            <SocialIcon platform={src.platform} />
                          </span>
                          <span style={{ fontSize: "12px", color: T.textSec, textTransform: "capitalize", flex: 1 }}>
                            {src.platform === "resume" ? "Résumé upload" : src.platform}
                          </span>
                          {src.scraped_at && (
                            <span style={{ fontSize: "10px", color: T.textTert }}>
                              {new Date(src.scraped_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${T.border}`, fontSize: "10px", color: T.textTert, lineHeight: 1.5 }}>
                      Profile synthesized by Zynd AI from public sources
                    </div>
                  </div>
                </div>
              )}

              {/* Verified on Zynd card */}
              <div className="pf-card pf-in" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff3ff 100%)", border: "1px solid rgba(91,124,250,0.12)" }}>
                <div className="pf-card-body" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.04em", color: T.accent, marginBottom: "4px" }}>Zynd</div>
                  <div style={{ fontSize: "11px", color: T.textTert, marginBottom: "12px" }}>AI-native people directory</div>
                  <div style={{ fontSize: "11px", color: T.textTert }}>zynd.ai/p/{handle}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
