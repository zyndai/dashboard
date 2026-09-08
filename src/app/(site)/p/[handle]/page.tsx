import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe, Search } from "lucide-react";

import {
  fetchCardByHandle,
  cardCanonicalUrl,
  type AgentProfileCard,
  type ContributionStats,
  type Project,
} from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";
import { DossierShell } from "./dossier-shell";
import { SkillMatrix } from "./skill-matrix";
import { ShareButton, CopyPermalinkIcon } from "./share-controls";
import { CountUp } from "./count-up";
import { AutoScroll } from "./auto-scroll";
import { ProfileChatWidget } from "@/components/ProfileChatWidget";

interface PageProps {
  params: Promise<{ handle: string }>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DUMMY DATA
   ───────────────────────────────────────────────────────────────────────────
   Placeholders for card fields the cards API does not return yet. Every one of
   these is consumed through `buildView()` below as a `real ?? DUMMY` fallback,
   so the moment the API starts sending the corresponding field the real value
   takes over and nothing here needs to change. The matching optional fields are
   declared on AgentProfileCard in src/lib/cards.ts.

   Each use site downstream is marked with a `// DUMMY:` comment. Fields that
   would fabricate a specific factual claim about a real, named person — an
   employer, a peer-review quote, a review count — are deliberately NOT given
   dummy fallbacks; those sections just hide when the card has no real data.
   ═══════════════════════════════════════════════════════════════════════════ */
const DUMMY = {
  /** The 3 pinned bento tiles, when the card's arrays are empty. */
  obsessions: {
    connect_with: ["Founders", "AI researchers", "Systems engineers"],
    love_talking_about: ["Distributed systems", "LLM optimization", "Kernel benchmarking"],
    working_on: ["Distributed inference", "Generative AI"],
  },
} as const;

/* ─── utils ─────────────────────────────────────────────────────────────── */

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

function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/* The cards API returns an 80x80 avatar (imgproxy `rs:fill:80:80`, baked into a
   signed path, so it cannot be re-requested any larger) which visibly upscales
   in the hero circle. GitHub renders the same face at any size, so a linked
   GitHub *profile* — not a repo URL — gives us a crisp source for free. */
function githubAvatar(url: string | null | undefined, size = 400): string | null {
  const safe = safeUrl(url);
  if (!safe) return null;
  try {
    const { hostname, pathname } = new URL(safe);
    if (!/(^|\.)github\.com$/i.test(hostname)) return null;
    const [user, ...rest] = pathname.split("/").filter(Boolean);
    if (!user || rest.length > 0) return null;
    return `https://github.com/${encodeURIComponent(user)}.png?size=${size}`;
  } catch {
    return null;
  }
}

function usernameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/\/+$/, "").split("/").pop() || null;
}

const HEAT = ["#1e293b", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

const VSCROLL_VISIBLE = 3;
const VSCROLL_SECS_PER_ROW = 3.5;
const PROJECT_ROW_H = 92;
const POST_ROW_H = 104;
const POST_GAP = 12;

const POST_STYLES = [
  { card: "bg-[#0B0B0B] text-white border-slate-800 hover:border-slate-700", badge: "bg-white/10 text-white", text: "text-slate-200", meta: "text-slate-400", link: "pf-post-link-0" },
  { card: "bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:border-[#0A66C2]/50", badge: "bg-[#0A66C2] text-white", text: "text-[#1a2b42]", meta: "text-[#0A66C2]/80", link: "pf-post-link-1" },
  { card: "bg-[#F7F7F4] border-[#E8E8E1] hover:border-[#D5D5CE]", badge: "bg-[#0B0B0B] text-white", text: "text-[#2A2A2A]", meta: "text-[#8E8E88]", link: "pf-post-link-2" },
];

const OBSESSION_CARDS: {
  key: "connect_with" | "love_talking_about" | "working_on";
  label: string;
  card: string;
  corner: string;
  chip: string;
  foot: string;
  unit: string;
}[] = [
  { key: "connect_with", label: "Who to connect with", unit: "PEOPLE", card: "bg-[#7B72E9] text-white", corner: "bento-corner-light", chip: "bg-white/15 border border-white/25 text-white", foot: "text-white/60" },
  { key: "love_talking_about", label: "Love talking about", unit: "TOPICS", card: "bg-[#9BDCCB] text-[#0B0B0B]", corner: "bento-corner-dark", chip: "bg-white/70 border border-black/10 text-[#0B0B0B]", foot: "text-black/60" },
  { key: "working_on", label: "Working on", unit: "TRACKS", card: "bg-[#FBC46A] text-[#0B0B0B]", corner: "bento-corner-dark", chip: "bg-white/70 border border-black/10 text-[#0B0B0B]", foot: "text-black/60" },
];

/* ─── brand glyphs ──────────────────────────────────────────────────────── */

function GithubGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg className="fill-current" style={{ width: size, height: size }} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg className="fill-current" style={{ width: size, height: size }} viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg className="fill-current" style={{ width: size, height: size }} viewBox="0 0 24 24" aria-hidden>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

const LINK_LABELS: Record<string, string> = {
  github: "GitHub",
  x: "X",
  twitter: "X",
  linkedin: "LinkedIn",
  website: "Website",
  portfolio: "Portfolio",
  linktree: "Linktree",
};

/** Brand glyph for one identity link; anything unrecognised gets a globe. */
function LinkGlyph({ platform, size = 15 }: { platform: string; size?: number }) {
  const key = platform.toLowerCase();
  if (key === "github") return <GithubGlyph size={size} />;
  if (key === "x" || key === "twitter") return <XGlyph size={size - 1} />;
  if (key === "linkedin") return <LinkedinGlyph size={size} />;
  return <Globe style={{ width: size, height: size }} strokeWidth={2} aria-hidden />;
}

function linkLabel(platform: string) {
  return LINK_LABELS[platform.toLowerCase()] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

/* ─── view model: real card data, with DUMMY as the fallback layer ──────── */

function buildView(card: AgentProfileCard) {
  const { identity } = card;

  const links = Object.entries(identity.links ?? {})
    .map(([platform, url]) => [platform, safeUrl(url)] as const)
    .filter((e): e is readonly [string, string] => e[1] !== null);

  const projects: (Project & { stars: number | null; tech: string[] })[] = card.projects.map((p) => ({
    ...p,
    stars: p.stars ?? null,
    tech: p.tech ?? [],
  }));

  const skillKeywords = new Set(card.skills.map((s) => s.name.toLowerCase()));
  const writing = card.writing_samples
    .map((s) => ({ ...s, metrics: s.metrics ?? [] }))
    .sort((a, b) => {
      const score = (text: string) => {
        const t = text.toLowerCase();
        let n = 0;
        for (const kw of skillKeywords) if (t.includes(kw)) n++;
        return n;
      };
      return score(b.excerpt) - score(a.excerpt);
    });

  // Real citation_snippet is preferred; no fabricated quote otherwise — the
  // endorsement card simply doesn't render when there is nothing real to show.
  const endorsementQuote = card.endorsement?.quote ?? (isBlank(card.citation_snippet) ? null : card.citation_snippet);

  return {
    links,
    projects,
    writing,
    endorsementQuote,

    linkedin: {
      connections: card.linkedin_stats?.connections ?? null,
      posts: card.linkedin_stats?.posts ?? null,
    },
    github: {
      repos: card.github_stats?.total_repos ?? null,
      activeRepos: card.github_stats?.active_repos ?? null,
      topLanguages: card.github_stats?.top_languages ?? [],
      commits: card.github_stats?.total_commits ?? null,
    },
    x: {
      handle:
        card.x_stats?.handle ??
        (identity.links?.x ? `@${usernameFromUrl(identity.links.x)}` : null),
      followers: card.x_stats?.followers ?? null,
      posts: card.x_stats?.posts ?? null,
      impressions: card.x_stats?.impressions ?? null,
    },
    contributions: card.contribution_stats ?? null,
  };
}

/* ─── SEO ───────────────────────────────────────────────────────────────── */

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
    return pageMetadata({
      title: "Profile not found",
      description: "This profile does not exist on Zynd.",
      path: `/p/${handle}`,
    });
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

/* ─── page ──────────────────────────────────────────────────────────────── */

export default async function PersonPage({ params }: PageProps) {
  const { handle } = await params;
  const card = await fetchCardByHandle(handle);
  if (!card) notFound();

  const { identity } = card;
  const v = buildView(card);
  const canonical = cardCanonicalUrl(card);
  const permalink = `zynd.ai/p/${card.handle || card.id}`;

  const initials = (identity.name || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const nameParts = (identity.name || "").trim().split(/\s+/);
  const nameLines = nameParts.length > 1 ? [nameParts.slice(0, -1).join(" "), nameParts[nameParts.length - 1]] : nameParts;

  const avatarUrl = githubAvatar(identity.links?.github) ?? safeUrl(identity.avatar_url);
  const verified = card.review?.status === "human_approved";
  const skills = card.skills.slice().sort((a, b) => b.evidence_count - a.evidence_count);

  const syncedAt = (() => {
    const d = new Date(card.updated_at);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
  })();

  const obsessionSources: Record<(typeof OBSESSION_CARDS)[number]["key"], string[]> = {
    connect_with: card.connect_with,
    love_talking_about: card.love_talking_about,
    working_on: card.working_on,
  };
  const obsessions = OBSESSION_CARDS.map((row) => ({
    ...row,
    // DUMMY: any row whose card array is empty falls back to DUMMY.obsessions
    items: obsessionSources[row.key].length > 0 ? obsessionSources[row.key] : [...DUMMY.obsessions[row.key]],
  }));

  const linkedinHandle = usernameFromUrl(identity.links?.linkedin);
  const linkedinUrl = safeUrl(identity.links?.linkedin);
  const githubHandle = usernameFromUrl(identity.links?.github) || card.handle || "profile";
  const githubUrl = safeUrl(identity.links?.github);
  const xUrl = safeUrl(identity.links?.x);
  const calendlyUrl = safeUrl(card.calendly_url);

  return (
    <>
      <link rel="canonical" href={canonical} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(card)).replace(/</g, "\\u003c") }}
      />

      <style>{`
        /* globals.css gives every h2 the landing-page display treatment
           (Chakra Petch, uppercase) with !important, and body carries
           letter-spacing:-0.05em / line-height:1 — opt out here. */
        .pf-bento { letter-spacing: normal; line-height: 1.5; }
        .pf-bento h2 {
          font-family: 'Space Grotesk', sans-serif !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }
        .pf-bento.font-sans, .pf-bento .font-sans { font-family: 'Geist', sans-serif !important; }
        .pf-bento .font-mono { font-family: 'Geist Mono', monospace !important; }
        .pf-bento .font-display { font-family: 'Space Grotesk', sans-serif !important; }

        /* globals.css also sets a bare "a { color: var(--color-foreground) }"
           (near-white) as unlayered CSS, which — per the cascade-layers spec —
           beats ANY Tailwind utility class regardless of specificity, since
           Tailwind's utilities live inside @layer utilities and unlayered
           rules always win over layered ones. Result: every text-*/hover:text-*
           class on an <a> here was silently a no-op. Fix it at the same
           (unlayered) tier with a more specific selector, then let color come
           from inline styles or an inherited ancestor instead of Tailwind
           classes on the anchor itself. */
        .pf-bento a { color: inherit; text-decoration: none; }
        .pf-bento a:hover { text-decoration: underline; }
        .pf-bento .pf-c-dark { color: #0B0B0B; }
        .pf-bento .pf-c-muted { color: #8E8E88; }
        .pf-bento .pf-c-slate { color: #94a3b8; }
        .pf-bento .pf-c-amber { color: #fcd34d; }
        .pf-bento .pf-hv-dark:hover { color: #0B0B0B; }
        .pf-bento .pf-hv-purple:hover { color: #7B72E9; }
        .pf-bento .pf-hv-white:hover { color: #fff; }
        .pf-bento .pf-post-link-0 { color: #94a3b8; }
        .pf-bento .pf-post-link-0:hover { color: #fff; }
        .pf-bento .pf-post-link-1 { color: #0A66C2; }
        .pf-bento .pf-post-link-1:hover { color: #000; }
        .pf-bento .pf-post-link-2 { color: #8E8E88; }
        .pf-bento .pf-post-link-2:hover { color: #0B0B0B; }

        .pf-bento.zd-canvas, .pf-bento .zd-canvas {
          background-color: #f2f1f3;
          background-attachment: fixed;
        }

        .pf-bento .bento-corner { position: relative; }
        .pf-bento .bento-corner::after {
          content: '';
          position: absolute;
          top: 14px;
          right: 14px;
          width: 14px;
          height: 14px;
          border-top: 2px solid currentColor;
          border-right: 2px solid currentColor;
          opacity: 0.35;
          pointer-events: none;
        }
        /* the identity row pins; every row below scrolls up over it */
        @media (min-width: 1024px) {
          .pf-bento .zd-pin { position: sticky; top: 20px; z-index: 0; }
          .pf-bento .zd-slide { position: relative; z-index: 1; }
        }
        /* --zd-fade drives a top-edge mask, so a row rides in with its leading
           edge dissolved into whatever is pinned behind it. */
        @property --zd-fade { syntax: "<length>"; inherits: false; initial-value: 0px; }
        .pf-bento .zd-veil {
          --zd-fade: 180px;
          opacity: .4; transform: translateY(24px) scale(.99);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--zd-fade));
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--zd-fade));
          transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1), --zd-fade .9s cubic-bezier(.16,1,.3,1);
        }
        .pf-bento .zd-veil[data-on="1"] { --zd-fade: 0px; }
        .pf-bento .zd-veil::after {
          content: ''; position: absolute; inset: -12px 0; pointer-events: none;
          background: linear-gradient(105deg, rgba(255,255,255,.62) 0%, rgba(226,226,218,.34) 44%, rgba(255,255,255,.58) 100%);
          opacity: 1; transition: opacity .7s ease;
        }
        .pf-bento .zd-veil[data-on="1"] { opacity: 1; transform: none; }
        .pf-bento .zd-veil[data-on="1"]::after { opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          .pf-bento .zd-veil { opacity: 1; transform: none; }
          .pf-bento .zd-veil::after { display: none; }
        }
        .pf-bento .bento-corner-light::after { border-color: #ffffff; opacity: 0.45; }
        .pf-bento .bento-corner-dark::after { border-color: #0B0B0B; opacity: 0.35; }

        /* AutoScroll vertical marquee */
        .pf-vscroll { overflow: hidden; position: relative; }
        .pf-vrow { display: flex; flex-direction: column; justify-content: center; flex-shrink: 0; }
        .pf-vrow-proj { height: 92px; }
        .pf-vrow-post { height: 104px; }
        .pf-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .pf-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        @media (prefers-reduced-motion: reduce) {
          .pf-vscroll { overflow-y: auto; }
        }
      `}</style>

      <div className="pf-bento zd-canvas font-sans antialiased w-full min-h-screen flex flex-col selection:bg-[#7B72E9] selection:text-white px-4 sm:px-10 md:px-16 lg:px-24 xl:px-32">
        <DossierShell className="w-full max-w-[1440px] mx-auto py-8 sm:py-12 flex-1">
          {/* Top Breadcrumb & Share Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E8E8E1]">
            <div className="flex items-center gap-3 text-xs font-mono">
              <Link href="/directory" className="flex items-center gap-2 pf-c-dark font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7B72E9] inline-block"></span>
                <span>Zynd</span>
              </Link>
              <span className="text-[#8E8E88]">/</span>
              <Link href="/directory" className="pf-c-muted pf-hv-dark">Directory</Link>
              <span className="text-[#8E8E88]">/</span>
              <span className="px-2 py-0.5 rounded-full bg-black/5 text-[#0B0B0B] font-semibold">@{card.handle || card.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                SYNTHESIS_ACTIVE
              </span>
              <ShareButton url={canonical} />
            </div>
          </div>

          {/* HERO BENTO GRID (Identity + Telemetry/Stats) */}
          <div className="flex flex-col lg:flex-row items-stretch gap-5 mb-5 zd-pin" id="identity">
            {/* Identity Hero Panel */}
            <div className="lg:w-5/12 bg-[#7B72E9] text-white rounded-[28px] p-6 relative overflow-hidden bento-corner bento-corner-light flex flex-col shadow-sm">
              {verified && (
                <div className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-[#0B0B0B]/85 backdrop-blur-sm border border-white/20 shadow-lg">
                  <BadgeCheck size={15} className="text-[#FBC46A]" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">Verified</span>
                </div>
              )}
              <div className="flex justify-center pb-4 relative z-10">
                <div className="w-[148px] h-[148px] rounded-full border-2 border-white/70 flex items-center justify-center p-3">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={identity.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#E9A8F2] flex items-center justify-center">
                      <span className="font-display text-[42px] font-bold tracking-tight text-[#3A3550]">{initials}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10">
                <p className="font-display text-[15px] font-semibold text-white/85 leading-none mb-1">I&apos;m,</p>
                {/* `!` because globals.css sets a bare, unlayered `h2 { font-size: 4.5rem }`
                    (plus responsive overrides) that outranks Tailwind's layered utilities. */}
                <h2 className="font-display text-[40px]! font-bold leading-[1.05]! tracking-tight text-white! text-left">
                  {nameLines.map((line, i) => (
                    <span key={i}>{line}{i === 0 && nameLines.length > 1 && <br />}</span>
                  ))}
                </h2>
              </div>

              <div className="pt-3 relative z-10">
                {!isBlank(identity.headline) && (
                  <p className="text-[12.5px] leading-snug text-white/85 font-medium line-clamp-2">
                    {identity.headline}
                  </p>
                )}

                {(card.working_on.length > 0 || card.experience_years != null || card.can_help_with.length > 0 || card.love_talking_about.length > 0) && (
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {card.working_on.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-mono text-[9.5px] text-white/50 uppercase tracking-wider">Building</span>
                        {card.working_on.slice(0, 3).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full bg-white/15 border border-white/25 font-mono text-[10px] text-white font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {card.love_talking_about.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-mono text-[9.5px] text-white/50 uppercase tracking-wider">Talks about</span>
                        {card.love_talking_about.slice(0, 3).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] text-white/80 font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {card.can_help_with.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-mono text-[9.5px] text-white/50 uppercase tracking-wider">Helps with</span>
                        {card.can_help_with.slice(0, 2).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] text-white/80 font-medium">
                            {item}
                          </span>
                        ))}
                        {card.experience_years != null && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] text-white/60">
                            {card.experience_years}y exp
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative mt-2.5 pt-2.5 border-t border-dashed border-white/40 font-mono text-[10.5px] text-white/75">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {!isBlank(identity.location) && <span>{identity.location}</span>}
                    {syncedAt && <span>Updated {syncedAt}</span>}
                  </div>
                  {v.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {v.links.map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={linkLabel(platform)}
                          title={linkLabel(platform)}
                          className="w-7 h-7 rounded-full bg-white/15 border border-white/25 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <LinkGlyph platform={platform} />
                        </a>
                      ))}
                    </div>
                  )}
                  {calendlyUrl && (
                    <div className="mt-2.5">
                      <a
                        href={calendlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1E1E1E] border border-white/25 font-mono text-[11px] font-semibold hover:bg-white/90 transition-colors"
                      >
                        Schedule a call ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>


              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Right Column: Telemetry & Stats */}
            <div className="lg:w-7/12 flex flex-col justify-between gap-5" id="activity">
              <div className="bg-white border border-[#E5E5DE] rounded-[28px] p-6 bento-corner bento-corner-dark shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] uppercase font-bold tracking-wider text-[#8E8E88]">Dossier Summary</span>
                    {verified && (
                      <span className="font-mono text-[10px] bg-[#FBC46A]/20 text-[#9E6400] font-bold px-2 py-0.5 rounded-full border border-[#FBC46A]/40">ZYND VERIFIED</span>
                    )}
                  </div>
                  {!isBlank(card.summary) && (
                    <p className="text-[14px] leading-relaxed text-[#2A2A2A] font-normal mb-5">{card.summary}</p>
                  )}
                </div>
                {(card.industries.length > 0 || !isBlank(card.availability)) && (
                  <div className="pt-4 border-t border-[#F0F0EA] flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {card.industries.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-[#F2F2EC] text-[#0B0B0B] font-medium">{tag}</span>
                    ))}
                    {!isBlank(card.availability) && (
                      <span className="px-2.5 py-1 rounded-md bg-[#7B72E9]/10 text-[#7B72E9] font-semibold">Open to {card.availability}</span>
                    )}
                  </div>
                )}
              </div>

              {/* What I'm about */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {obsessions.map((tile) => (
                  <div key={tile.key} className={`rounded-[26px] p-5 bento-corner shadow-sm flex flex-col justify-between min-h-[180px] ${tile.card} ${tile.corner}`}>
                    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold">
                      <span>{tile.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {tile.items.map((item) => (
                        <span key={item} className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold leading-tight ${tile.chip}`}>{item}</span>
                      ))}
                    </div>
                    <span className={`font-mono text-[10px] ${tile.foot}`}>{tile.items.length} {tile.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* THREE-COLUMN DOSSIER BODY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-5 zd-canvas zd-slide pt-8 lg:items-start">
            {/* Left — Scale & Community */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              <div className="bg-[#0A66C2] text-white rounded-[26px] p-5 bento-corner bento-corner-light shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold">
                    <LinkedinGlyph size={16} />
                    <span>LinkedIn</span>
                  </div>
                  {linkedinHandle && linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] font-semibold text-white/90 hover:text-white transition-colors">
                      in/{linkedinHandle} ↗
                    </a>
                  )}
                </div>

                {/* Primary: show connections stat if available */}
                {v.linkedin.connections != null && (
                  <div className="flex items-end gap-4">
                    <div>
                      <span className="font-display text-[28px] font-bold leading-tight"><CountUp value={v.linkedin.connections} /></span>
                      <p className="font-mono text-[11px] text-white/75">connections</p>
                    </div>
                    {v.linkedin.posts != null && Number(v.linkedin.posts) > 0 && (
                      <div>
                        <span className="font-display text-[22px] font-bold leading-tight"><CountUp value={v.linkedin.posts} /></span>
                        <p className="font-mono text-[11px] text-white/75">posts</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile data from scrape — always shown */}
                <div className="flex flex-col gap-1.5">
                  {!isBlank(identity.headline) && (
                    <p className="font-sans text-[13px] font-medium text-white/90 leading-snug line-clamp-2">{identity.headline}</p>
                  )}
                  {!isBlank(identity.location) && (
                    <p className="font-mono text-[11px] text-white/65">{identity.location}</p>
                  )}
                  {card.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {card.skills.slice(0, 3).map((s) => (
                        <span key={s.name} className="font-mono text-[9px] bg-white/15 rounded px-1.5 py-0.5 text-white/90">{s.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="font-mono text-[10px] text-white/50">Verified via LinkedIn</span>
              </div>

              <div className="bg-[#53565A] text-white rounded-[26px] p-5 bento-corner bento-corner-light shadow-sm flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold">
                    <GithubGlyph size={16} />
                    <span>GitHub</span>
                  </div>
                  {githubUrl ? (
                    <a href={githubUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] font-semibold">@{githubHandle} ↗</a>
                  ) : (
                    <span className="font-mono text-[11px] font-semibold text-white/90">@{githubHandle}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 my-2">
                  <div>
                    <span className="font-display text-[22px] font-bold leading-tight"><CountUp value={v.github.repos ?? "—"} /></span>
                    <p className="font-mono text-[10px] text-white/75">repos</p>
                  </div>
                  <div>
                    <span className="font-display text-[22px] font-bold leading-tight"><CountUp value={v.github.activeRepos ?? "—"} /></span>
                    <p className="font-mono text-[10px] text-white/75">active repos</p>
                  </div>
                </div>
                {v.github.topLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {v.github.topLanguages.slice(0, 4).map((lang) => (
                      <span key={lang} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 font-mono text-[10px] text-white/80">{lang}</span>
                    ))}
                  </div>
                )}
                <span className="font-mono text-[10px] text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Contributor
                </span>
              </div>

              <div className="bg-[#0B0B0B] text-white rounded-[26px] p-5 bento-corner bento-corner-light shadow-sm flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold">
                    <XGlyph size={14} />
                    <span>X / Twitter</span>
                  </div>
                  {xUrl ? (
                    <a href={xUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] font-semibold pf-c-amber">{v.x.handle ?? "↗"} ↗</a>
                  ) : v.x.handle ? (
                    <span className="font-mono text-[11px] font-semibold text-amber-300">{v.x.handle}</span>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-2 my-2">
                  <div>
                    <span className="font-display text-[22px] font-bold leading-tight text-white"><CountUp value={v.x.followers ?? "—"} /></span>
                    <p className="font-mono text-[10px] text-white/75">followers</p>
                  </div>
                  <div>
                    <span className="font-display text-[22px] font-bold leading-tight text-white"><CountUp value={v.x.posts ?? "—"} /></span>
                    <p className="font-mono text-[10px] text-white/75">posts</p>
                  </div>
                  <div>
                    <span className="font-display text-[22px] font-bold leading-tight text-amber-400"><CountUp value={v.x.impressions ?? "—"} delay={150} /></span>
                    <p className="font-mono text-[10px] text-white/75">impressions</p>
                  </div>
                </div>
                {card.industries.length > 0 && (
                  <span className="font-mono text-[10px] text-white/60">{card.industries.join(" · ")}</span>
                )}
              </div>
            </div>

            {/* Middle — projects, writing, activity */}
            <div className="lg:col-span-6 flex flex-col gap-5" id="production">
              {v.projects.length > 0 && (
                <div className="bg-white border border-[#E5E5DE] rounded-[28px] p-6 bento-corner bento-corner-dark shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] uppercase font-bold tracking-wider text-[#8E8E88]">Live in Production</span>
                    <span className="font-mono text-[10px] text-[#7B72E9] font-bold">{v.projects.length} HIGHLIGHTS</span>
                  </div>
                  {(() => {
                    return (
                      <AutoScroll
                        rowHeight={PROJECT_ROW_H}
                        visible={VSCROLL_VISIBLE}
                        secondsPerRow={VSCROLL_SECS_PER_ROW}
                      >
                        {v.projects.map((proj) => {
                          const url = safeUrl(proj.url);
                          return (
                            <div key={proj.name} className="pf-vrow pf-vrow-proj py-2 border-b border-[#F0F0EA] last:border-b-0">
                              <div className="flex items-center justify-between">
                                {url ? (
                                  <a href={url} target="_blank" rel="noreferrer" className="font-display font-semibold text-[15px] pf-c-dark pf-hv-purple transition-colors inline-flex items-center gap-1">
                                    <span className="pf-clamp-1">{proj.name}</span>
                                    <span className="text-[11px] text-[#8E8E88] flex-shrink-0">↗</span>
                                  </a>
                                ) : (
                                  <span className="font-display font-semibold text-[15px] text-[#0B0B0B] pf-clamp-1">{proj.name}</span>
                                )}
                                {proj.stars != null && (
                                  <span className="font-mono text-[10px] text-[#9E6400] font-bold bg-[#FBC46A]/25 px-2 py-0.5 rounded-full flex-shrink-0">
                                    ★ {compact(proj.stars)}
                                  </span>
                                )}
                              </div>
                              {!isBlank(proj.description) && (
                                <p className="text-[12px] text-[#4A4A45] mt-0.5 leading-relaxed pf-clamp-1">{proj.description}</p>
                              )}
                              {proj.tech.length > 0 && (
                                <div className="mt-0.5 font-mono text-[10px] text-[#7B72E9] font-medium pf-clamp-1">{proj.tech.join(" • ")}</div>
                              )}
                            </div>
                          );
                        })}
                      </AutoScroll>
                    );
                  })()}
                </div>
              )}

              {v.writing.length > 0 && (
              <div className="bg-white border border-[#E5E5DE] rounded-[28px] p-7 bento-corner bento-corner-dark shadow-sm" id="posts">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] uppercase font-bold tracking-wider text-[#8E8E88]">Posts &amp; Writing</span>
                    <span className="font-mono text-[10px] text-[#0B0B0B] font-semibold bg-[#F0F0EA] px-2 py-0.5 rounded">{v.writing.length} POSTS ARCHIVED</span>
                  </div>
                    {(() => {
                      const posts = v.writing.slice(0, 10);
                      return (
                        <AutoScroll
                          rowHeight={POST_ROW_H + POST_GAP}
                          gap={0}
                          visible={VSCROLL_VISIBLE}
                          secondsPerRow={VSCROLL_SECS_PER_ROW}
                        >
                          {posts.map((post, idx) => {
                            const style = POST_STYLES[idx % POST_STYLES.length];
                            const isX = ["x", "twitter"].includes(post.platform.toLowerCase());
                            const url = safeUrl(post.url);
                            return (
                              <div key={`${post.platform}-${idx}`} className={`pf-vrow pf-vrow-post p-3.5 rounded-2xl border transition-all ${style.card}`} style={{ marginBottom: POST_GAP }}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-semibold flex items-center gap-1 ${style.badge}`}>
                                      {isX ? <XGlyph size={10} /> : <LinkedinGlyph size={10} />}
                                      {isX ? "X" : "LinkedIn"}
                                    </span>
                                    <span className={`font-mono text-[10px] font-medium ${style.meta}`}>{post.posted_at}</span>
                                  </div>
                                  {url && (
                                    <a href={url} target="_blank" rel="noreferrer" className={`font-mono text-xs ${style.link}`}>↗</a>
                                  )}
                                </div>
                                <p className={`text-[11.5px] italic leading-snug font-medium pf-clamp-2 ${style.text}`}>
                                  &ldquo;{post.excerpt}&rdquo;
                                </p>
                              </div>
                            );
                          })}
                        </AutoScroll>
                      );
                    })()}
                </div>
              </div>
              )}

              {v.contributions && v.contributions.levels.length > 0 && (
              <div className="bg-[#0B0B0B] text-white rounded-[28px] p-7 bento-corner bento-corner-light shadow-sm flex flex-col justify-between" id="activity-graph">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GithubGlyph size={16} />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 font-semibold">GitHub Telemetry</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                    {v.github.commits != null ? <><CountUp value={v.github.commits} /> IN {v.contributions.year}</> : v.contributions.year}
                  </span>
                </div>
                <div className="overflow-x-auto pb-1 my-auto">
                  <div className="flex justify-between min-w-[528px] font-mono text-[10px] text-slate-400 mb-1.5 px-0.5" aria-hidden>
                    <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                  </div>
                  <div
                    className="grid grid-flow-col gap-[2px] w-max py-1"
                    style={{ gridTemplateRows: "repeat(7, 8px)" }}
                    role="img"
                    aria-label={`${v.contributions.total} contributions in ${v.contributions.year}`}
                  >
                    {v.contributions.levels.map((lvl, i) => (
                      <span key={i} className="block w-2 h-2 rounded-[2px]" style={{ backgroundColor: HEAT[lvl] ?? HEAT[0] }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
                  <span>avg: {v.contributions.avg_per_day} commits/day</span>
                  <span className="flex items-center gap-1.5">
                    <span>Less</span>
                    {HEAT.map((c) => (
                      <span key={c} className="inline-block w-2 h-2 rounded-[2px]" style={{ backgroundColor: c }} />
                    ))}
                    <span>More</span>
                  </span>
                </div>
              </div>
              )}
            </div>

            {/* Right — skill matrix + endorsement */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              {skills.length > 0 && <SkillMatrix skills={skills} />}

              {v.endorsementQuote && (
                <div className="bg-[#F7F7F4] border-2 border-[#7B72E9]/40 rounded-[28px] p-6 bento-corner bento-corner-dark shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <span className="text-[#7B72E9] text-4xl font-serif leading-none select-none">&ldquo;</span>
                    <p className="text-[13px] text-[#1E1E1E] italic leading-relaxed">{v.endorsementQuote}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E8E8E1] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#7B72E9] font-bold tracking-widest uppercase">
                      {card.endorsement ? "Peer Endorsement" : "Zynd Citation"}
                    </span>
                    {card.endorsement?.reviewer_count != null && (
                      <span className="font-mono text-[10px] text-[#8E8E88]">{card.endorsement.reviewer_count} PEER REVIEWS ON ZYND</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER / EXPLORE ZYND & VERIFIED BENTO ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 pb-5 zd-canvas zd-slide">
            <div className="md:col-span-8 bg-[#0B0B0B] text-white rounded-[28px] p-7 bento-corner bento-corner-light shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#FBC46A]"></span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#FBC46A] font-bold">Explore Zynd Intelligence</span>
                </div>
                <h3 className="font-display text-[22px]! font-bold! leading-snug! text-white!">
                  Find people with matching expertise across the Zynd directory.
                </h3>
                <p className="text-[12px] text-slate-400 mt-1 font-mono">
                  Powered by Zynd&apos;s semantic search across verified profiles.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                {skills.length > 0 && (
                  <Link
                    href={`/search?skills=${skills.slice(0, 3).map((s) => encodeURIComponent(s.name)).join(",")}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FBC46A] hover:bg-[#ffcf82] pf-c-dark font-mono text-[12px] font-bold transition-all text-center shadow-md"
                  >
                    <Search size={13} />
                    Find Similar Profiles
                  </Link>
                )}
                <Link href="/directory" className="font-mono text-[11px] pf-c-slate pf-hv-white text-center py-1 transition-colors">
                  Browse all profiles →
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 bg-white border border-[#E5E5DE] rounded-[28px] p-6 bento-corner bento-corner-dark shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-display font-semibold text-[14px] text-[#0B0B0B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7B72E9]"></span>
                    <span>Zynd Verified</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8E8E88]">AI-Native Directory</span>
                </div>
                <p className="text-[11px] font-mono text-[#8E8E88]">Permanent verifiable dossier snapshot</p>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F7F7F4] border border-[#E8E8E1] mt-3">
                <span className="font-mono text-[11px] text-[#0B0B0B] font-medium truncate">{permalink}</span>
                <CopyPermalinkIcon url={canonical} />
              </div>
            </div>
          </div>

          {/* Editorial Footer Note */}
          <div className="mt-12 pt-6 border-t border-[#E5E5DE] zd-canvas zd-slide flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[#8E8E88]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0B0B0B]">ZYND.AI</span>
              <span>•</span>
              <span>Algorithmic Dossier &amp; Synthesis Protocol</span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/directory" className="pf-hv-dark transition-colors">DIRECTORY</Link>
              <Link href="/for-ai" className="pf-hv-dark transition-colors">AGENT_API</Link>
              <Link href="/create" className="pf-hv-dark transition-colors">CREATE_PROFILE</Link>
            </div>
          </div>
        </DossierShell>
      </div>
      <ProfileChatWidget handle={handle} personName={identity.name} />
    </>
  );
}
