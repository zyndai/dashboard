# Full SEO Audit Report — https://www.zynd.ai/
**Audit Date:** 2026-03-23
**Audited By:** Claude Code SEO Audit (7 specialized subagents)
**Business Type:** AI agent infrastructure platform (developer tool / web3 payments)
**Framework:** Next.js 15 / React 19 (App Router)

---

## Overall SEO Health Score: **53 / 100**

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Technical SEO | 25% | 61/100 | 15.3 |
| Content Quality | 25% | 61/100 | 15.3 |
| On-Page SEO | 20% | 48/100 | 9.6 |
| Schema / Structured Data | 10% | 55/100 | 5.5 |
| Performance (Core Web Vitals) | 10% | 28/100 | 2.8 |
| Images | 5% | 60/100 | 3.0 |
| AI Search Readiness | 5% | 34/100 | 1.7 |
| **TOTAL** | **100%** | | **53.2** |

---

## Executive Summary

ZyndAI is a technically ambitious platform with a genuinely novel product — decentralized AI agent identity, discovery, and x402 micropayments on Base. The brand voice is strong and the technical content in `llms.txt` and schema is accurate. However, the site carries a cluster of Critical and High severity issues that suppress its search visibility well below its potential.

**The core problem is a three-layer performance and indexability crisis:**
1. The homepage and all key public pages are `"use client"` — Google sees empty HTML shells before JavaScript executes.
2. The `Providers` component returns `null` until hydration — doubling the blank-page period.
3. The `SITE_URL` constant points to `https://zynd.ai` while the live site is `https://www.zynd.ai` — creating canonical mismatches across every page, schema, and the sitemap.

These three issues alone account for the majority of the Performance and Technical SEO scores. Fixing them will produce the largest immediate ranking uplift.

**Top 5 Critical Issues:**
1. Homepage is fully client-side rendered — zero SSR content for crawlers
2. `SITE_URL` (`zynd.ai`) mismatches live domain (`www.zynd.ai`) — canonical pollution across entire site
3. OG image path is broken — social shares show no image on any page
4. Agent registry detail URLs embed full JSON in query string — all agent pages are uncrawlable
5. Blog has 1 post from 13+ months ago with outdated forward-looking statements — signals content abandonment

**Top 5 Quick Wins:**
1. Fix OG image path: change `/assets/zynd.png` → `/zynd.png` in `layout.tsx` (30 min)
2. Fix `SITE_URL` to `https://www.zynd.ai` everywhere (1 hour)
3. Add `/blogs` and `/blogs/what-is-zynd` to `sitemap.ts` (15 min)
4. Add security headers to `next.config.ts` (30 min)
5. Move `FAQPage` schema from global `layout.tsx` to homepage `page.tsx` only (30 min)

---

## 1. Technical SEO — Score: 61/100

### 1.1 Crawlability

**robots.txt** — `public/robots.txt`

✅ Correctly allows all major AI crawlers: GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, ChatGPT-User, Googlebot, Bingbot
❌ **High:** Sitemap directive uses `https://zynd.ai/sitemap.xml` — should be `https://www.zynd.ai/sitemap.xml`
❌ **Low:** `/dashboard/`, `/auth`, `/onboard` routes not disallowed — wastes crawl budget on authenticated empty shells

### 1.2 XML Sitemap

**sitemap.ts** — `src/app/sitemap.ts`

Current sitemap contains only 3 URLs:
- `https://zynd.ai` (wrong — non-www)
- `https://zynd.ai/registry` (wrong — non-www)
- `https://zynd.ai/docs/litepaper.pdf` (wrong — PDF should not be here; file may not exist)

❌ **Critical:** Missing `/blogs` and `/blogs/what-is-zynd` — the only long-form content is not submitted for indexing
❌ **High:** All URLs use non-www base (`zynd.ai`) — mismatch with `www.zynd.ai` canonical
❌ **Medium:** `lastModified: new Date()` stamps every URL with the build timestamp, not actual content dates
❌ **Medium:** PDF entry likely 404s; no `public/docs/` directory confirmed
❌ **Low:** `priority` and `changefreq` fields — Google ignores both; add noise without benefit

### 1.3 Canonical Tags

❌ **Critical:** `SITE_URL = "https://zynd.ai"` in `layout.tsx:6` propagates to ALL canonicals, OG urls, and all 4 schema `url` fields. If the live site is `www.zynd.ai`, every canonical points to a different origin.
❌ **High:** `/registry/page.tsx` is `"use client"` — Next.js cannot export `metadata` from client components, so **`/registry` renders with no canonical tag at all**
❌ **High:** `/registry/[id]/page.tsx` — same issue, no canonical
❌ **Medium:** `/blogs/page.tsx` and `/blogs/what-is-zynd/page.tsx` inherit root layout canonical (`https://zynd.ai`) rather than self-referencing per-page canonicals
❌ **Low:** `/privacy-policy` and `/terms-of-service` have no metadata exports at all

### 1.4 JavaScript Rendering — CRITICAL

❌ **Critical:** `src/app/page.tsx:1` — `"use client"` on the homepage. Next.js delivers an empty HTML shell; Googlebot must execute JavaScript to see any content.
❌ **Critical:** `src/components/providers.tsx:20-23` — The entire app tree returns `null` until `useEffect(() => setMounted(true), [])` fires. Sequence: empty HTML → JS downloads → React mounts → **Providers returns null** → effect fires → content appears. Crawlers and LCP both suffer.
❌ **Critical:** `/registry`, `/registry/[id]`, `/auth`, `/onboard` are all `"use client"` — no server-side metadata on any of these pages.

### 1.5 Security Headers

❌ **Critical:** `next.config.ts` is empty — no `headers()` function. Missing:

| Header | Risk |
|--------|------|
| `Content-Security-Policy` | High — XSS exposure, especially critical for a wallet-connected app |
| `X-Frame-Options: SAMEORIGIN` | High — clickjacking |
| `X-Content-Type-Options: nosniff` | Medium |
| `Strict-Transport-Security` | Unknown (hosting layer) |
| `Referrer-Policy` | Low |

### 1.6 URL Structure

❌ **Critical:** Registry agent links: `href={/registry/${agent.id}?data=${encodeURIComponent(JSON.stringify(agent))}}` at `src/app/registry/page.tsx:638`. Every agent detail URL embeds a full JSON object in the query string. These URLs are unique per session, non-canonical, and uncrawlable. The detail page already has a fallback `getAgentByIdPublic(agentId)` call — simply use `href={/registry/${agent.id}}`.

### 1.7 Internal Linking

❌ **High:** Homepage has zero internal links to any blog content
❌ **High:** Blog post links only to blog index — no links to registry, docs, or other content
❌ **Medium:** Footer links to `zynd.gitbook.io/product-docs/` while Navbar links to `docs.zynd.ai` — inconsistency dilutes link equity

### 1.8 Hreflang

✅ Not required — English-only site (`<html lang="en">`)

---

## 2. Content Quality — Score: 61/100

### 2.1 E-E-A-T Assessment

**Experience (11/20):**
- ✅ Dynamic agent count badge pulls live data
- ✅ Roadmap has specific, dated completed milestones
- ❌ No builder case studies, no success stories
- ❌ No demo video or sandbox
- ❌ Only 1 blog post, published 13+ months ago — experience signal is stale

**Expertise (13/25):**
- ✅ `llms.txt` contains technically accurate glossary (DID, VC, x402, AgentMessage, P3AI)
- ✅ SoftwareApplication schema has detailed 10-feature `featureList`
- ❌ No named authors on any page — anonymous authorship for financial/blockchain infrastructure
- ❌ `Solution` component renders ~15 words of prose — a near-empty section
- ❌ No team page, no about page, no founder profiles

**Authoritativeness (13/25):**
- ✅ GitHub, npm (PyPI), social profiles linked
- ✅ Organization schema `sameAs` array with 4 social profiles
- ❌ No testimonials, no partner logos, no framework integration badges
- ❌ No press coverage or third-party mentions on the site

**Trustworthiness (17/30):**
- ✅ Privacy Policy and ToS linked in footer
- ✅ robots.txt properly configured
- ✅ Copyright line present
- ❌ **Critical:** No contact email or contact page — FAQ "Contact us" links to Twitter/X
- ❌ Newsletter form submission calls no API (`Footer.tsx` — `setSubmitted(true)` only) — broken trust signal
- ❌ No security page, no smart contract audit links for USDC payment infrastructure

### 2.2 Thin Content Pages

| Page | Issue | Severity |
|------|-------|---------|
| `/blogs` | 1 post in 13+ months; index header promises regular content | Critical |
| `/blogs/what-is-zynd` | ~580 words vs 1,500-word minimum; contains 13-month-old "upcoming" milestones | High |
| `/registry` | ~30 words of static prose; no explanatory content | High |
| `/privacy-policy` | "Coming Soon" placeholder | Medium |
| `/terms-of-service` | "Coming Soon" placeholder | Medium |

### 2.3 Content Gaps

Missing content versus declared strategy in `SEO-STRATEGY.md`:
- "ai agent marketplace" — Tier 1 keyword, not used in any visible content
- "how to monetize ai agents" — no page
- Framework integration guides (LangChain, CrewAI, n8n) — no dedicated pages
- Comparison pages ("ZyndAI vs Fetch.ai") — no pages
- About/team page — missing
- Pricing page — missing (only implicit in schema)
- Developer changelog — missing
- Benchmark/performance data — missing

### 2.4 Agent Count Inconsistency

Three different numbers appear on the same site:
- `llms.txt`: "450+"
- `layout.tsx` metadata: "450+"
- `Hero.tsx` static fallback: "350+"
- Roadmap Q3 2025: "1,000+"

This inconsistency undermines citation confidence for AI search engines and damages credibility with human visitors.

### 2.5 Keyword Targeting

Well-targeted: "open agent network," "AI agents," "x402 micropayments," "LangChain/CrewAI/PydanticAI/LangGraph," "MCP server"
Missing: "ai agent marketplace" (highest-intent Tier 1), "multi-agent framework," "autonomous agent platform"

---

## 3. On-Page SEO — Score: 48/100

### 3.1 Title Tags

| Page | Title | Issue |
|------|-------|-------|
| `/` | "ZyndAI \| The Open Agent Network" | ✅ Good — brand + descriptor |
| `/registry` | Inherits root layout title | ❌ No dedicated title |
| `/blogs` | Generic blog title | ❌ Weak keyword value |
| `/blogs/what-is-zynd` | Correct | ✅ |
| `/privacy-policy` | No metadata | ❌ |
| `/terms-of-service` | No metadata | ❌ |

### 3.2 Meta Descriptions

- `/` — Present and keyword-rich (55 words)
- `/registry` — Inherits homepage description — wrong topic
- `/blogs` — "Read the latest from ZyndAI." — 5 words, zero keyword value in OG variant
- All other pages — missing or inherited

### 3.3 Heading Structure

| Finding | Severity |
|---------|---------|
| H1 "The Open Agent Network" is set via `useEffect` → empty `<h1>` in initial HTML | High |
| Target SEO phrase "AI agents discovering, collaborating, and transacting" is body copy, not H1 | High |
| Animated cycling word in H1 area may dilute keyword signal | Medium |
| H2s are well-structured and descriptive | ✅ |

### 3.4 Open Graph / Social

❌ **High:** OG image `const OG_IMAGE = "/assets/zynd.png"` — file is at `public/zynd.png`, not `public/assets/zynd.png`. All social share cards show no image.
✅ Twitter card type `summary_large_image` is set
✅ OG title and description present
❌ Blog post OG description truncated to 5 words

### 3.5 Internal Linking

- Homepage → registry: ✅ (footer)
- Homepage → blog: ❌ zero links
- Blog post → other content: ❌ only "Back to Blog"
- Registry → individual agents: ❌ URLs are uncrawlable (JSON query string)

---

## 4. Schema / Structured Data — Score: 55/100

### 4.1 Existing Schemas (in `layout.tsx`)

| Schema | Status | Key Issue |
|--------|--------|-----------|
| Organization | Present but errors | `logo` is bare URL string, not `ImageObject`; `contactPoint.url` not valid |
| SoftwareApplication | Present but errors | `operatingSystem: "Web, Python"` — Python is not an OS |
| WebSite + SearchAction | ✅ Correct | SearchAction points to functional `/registry?q=` endpoint |
| FAQPage | Present but misapplied | Injected globally on ALL pages; 2 questions have no visible counterpart |

### 4.2 Schema Issues

❌ **Critical:** `FAQPage` schema in `layout.tsx` renders on `/registry`, `/blogs`, `/privacy-policy` etc. — no FAQ content on those pages. Violates Google's structured data guidelines.
❌ **Critical:** Organization `logo` is a bare URL string. Google requires `ImageObject` wrapper.
❌ **High:** 2 FAQ schema questions (AgentMessage, DID identity) not visible on page — schema/content mismatch
❌ **High:** `/blogs/what-is-zynd` has zero structured data — no `BlogPosting`, no `Article`
❌ **High:** `contactPoint.url` not a valid `ContactPoint` property
❌ **High:** `operatingSystem: "Web, Python"` — invalid value
❌ **Medium:** No `BreadcrumbList` on `/registry`, `/blogs`, detail pages
❌ **Medium:** No `WebPage` scope per sub-page
❌ **Low:** FAQ rich results unavailable for commercial sites since Aug 2023 — retain for GEO value only

### 4.3 Rich Result Eligibility

| Schema | Eligible? | Blocker |
|--------|-----------|---------|
| Organization (Knowledge Graph) | Possible | Fix `logo` ImageObject |
| SoftwareApplication | Possible | Fix `operatingSystem`; add `aggregateRating` |
| WebSite Sitelinks Searchbox | ✅ Eligible | — |
| FAQPage (SERP accordion) | ❌ No | Commercial site restriction since Aug 2023 |
| Article rich result | Missing | Add BlogPosting to blog post |
| BreadcrumbList | Missing | Not implemented |

---

## 5. Performance / Core Web Vitals — Score: 28/100

*Estimated Lighthouse mobile: 30–45 | Estimated desktop: 50–65*

### 5.1 LCP — Needs Improvement / Poor

| Root Cause | File | Severity |
|-----------|------|---------|
| `"use client"` on homepage — no SSR, content invisible until JS runs | `src/app/page.tsx:1` | Critical |
| `Providers` returns `null` until hydration — entire tree hidden | `src/components/providers.tsx:20-23` | Critical |
| Background `<video>` with no `preload="none"` — competes with LCP for bandwidth | `src/app/page.tsx:14-27` | Critical |
| Video poster JPEG not preloaded with `fetchpriority="high"` | `src/app/page.tsx` | High |
| `<h1>` set via `useEffect` — empty on initial render | `src/components/Hero.tsx:13-17` | High |
| Google Fonts `<link>` render-blocking in `<head>` | `src/app/layout.tsx:239-241` | High |
| GSAP plugins injected with `async = false` — synchronous script block | `src/hooks/useGSAPPlugins.ts:35-45` | High |

### 5.2 INP — Needs Improvement

| Root Cause | File | Severity |
|-----------|------|---------|
| 7 GSAP animation hooks fire simultaneously at mount | `src/components/HomeContent.tsx:24-30` | High |
| Lenis + GSAP ticker run callbacks on every animation frame | `src/hooks/useGSAPPlugins.ts` | High |
| 118 PNG frames preloaded in `for` loop on mount | `src/components/FrameSequence.tsx:70-98` | High |

### 5.3 CLS — Needs Improvement

| Root Cause | File | Severity |
|-----------|------|---------|
| `Providers` returns null → full tree appears on hydration | `src/components/providers.tsx` | Critical |
| `agentCount` badge inserted above `<h1>` after API resolves | `src/components/Hero.tsx:37-41` | High |
| `<img>` without `width`/`height` in Navbar | `src/components/Navbar.tsx:116-128` | Medium |

### 5.4 JavaScript Bundle Bloat

| Package Group | Estimated Size (gzip) | Issue |
|--------------|----------------------|-------|
| Three.js + R3F + postprocessing | ~350-500 KB | Loaded on marketing homepage |
| GSAP + plugins | ~150-200 KB | All execute at page load |
| Privy + Wagmi + viem | ~300-500 KB | Wallet SDK on unauthenticated homepage |
| Framer Motion v12 | ~80-120 KB | Global |

Wallet infrastructure (Privy/Wagmi) is initialized for every visitor including unauthenticated homepage visitors and crawlers. These should be moved to a layout wrapping only `/dashboard`, `/auth`, `/registry`.

### 5.5 Other Performance Issues

❌ `FrameSequence.tsx` eagerly preloads 118 PNGs (~6-12 MB) on page load — no `IntersectionObserver` gate
❌ Video source order: `.mp4` listed first, `.webm` second — browsers check sources in order
❌ `powerPreference: "high-performance"` on Three.js WebGL scene requests discrete GPU on mobile
❌ `maximumScale: 1` in viewport disables user zoom — WCAG 1.4.4 violation
❌ Google Analytics Script tags have no `strategy="lazyOnload"`

---

## 6. Images — Score: 60/100

| Issue | File | Severity |
|-------|------|---------|
| OG image path broken — `/assets/zynd.png` doesn't exist | `layout.tsx:11` | High |
| `favicon-32x32.png` referenced but file not found at expected path | `layout.tsx:91` | High |
| Raw `<img>` tags instead of Next.js `<Image>` in Navbar | `Navbar.tsx:116-128` | Medium |
| Video poster is JPEG — should be WebP for better compression | `page.tsx` | Low |
| 118 animation frames are PNG — should be WebP (-25-40% size) | `FrameSequence.tsx` | Medium |
| No lazy loading on below-fold images | Various | Medium |
| HelveticaNeueRoman.otf in `/public` — unused (woff2 is used), adds bulk | `globals.css` | Low |

---

## 7. AI Search Readiness — Score: 34/100

### 7.1 AI Crawler Access

✅ robots.txt explicitly allows GPTBot, ClaudeBot, PerplexityBot, anthropic-ai
✅ `llms.txt` exists at `public/llms.txt` — correctly formatted with glossary, architecture, key URLs
❌ `llms.txt` says "450+" agents; homepage fallback says "350+" — inconsistency reduces citation confidence

### 7.2 Citability

❌ **Critical:** Hero section is a tagline, not a citable definition passage. AI systems need a 134–167 word self-contained definitional block to generate confident citations.
❌ **High:** "350+ agents" statistic has no date — treated as unverifiable marketing by AI systems
❌ **High:** FAQ content likely rendered client-side — AI crawlers that don't execute JS may not see FAQ answers
❌ **High:** Section headings are brand-speak, not question-formatted — AI systems prefer Q&A-formatted headings

### 7.3 Brand Entity Clarity

❌ **High:** No Wikipedia article — no "ground truth" entity record for ChatGPT/Perplexity knowledge graphs
❌ **High:** Brand name exists in 3 forms: "ZyndAI", "Zynd AI", "Zynd" — entity fragmentation
❌ **High:** No Reddit presence — Reddit has 0.74 correlation with AI citation likelihood
❌ **High:** No YouTube presence — YouTube has 0.737 correlation (strongest single signal)
✅ GitHub presence is a positive entity signal

### 7.4 Platform-Specific Scores

| Platform | Score | Key Barrier |
|----------|-------|-------------|
| Google AI Overviews | 22/100 | CSR rendering, no FAQPage on homepage-only |
| ChatGPT Search | 30/100 | No entity record, name ambiguity |
| Perplexity | 38/100 | Docs subdomain separate, CSR risk |
| Bing Copilot | 28/100 | No structured data on key pages |
| Claude (Anthropic) | 35/100 | llms.txt exists but agent count mismatch |

---

## 8. Visual / Mobile — Summary

✅ No intrusive popups or interstitials
✅ Mobile layout is single-column, no horizontal overflow
✅ Brand consistency strong across all viewports
✅ Navigation accessible on mobile (hamburger menu with aria labels)
❌ **High:** Target SEO phrase "AI agents discovering, collaborating, and transacting" is body copy, not H1 — the actual H1 is "The Open Agent Network"
❌ **High:** Animated cycling word in hero may dilute crawler keyword interpretation
❌ **Medium:** "GET STARTED" CTA uses ghost button (thin white border on dark) — low visual prominence for primary conversion
❌ **Medium:** Body copy contrast ratios need programmatic verification (light gray on dark purple)
❌ **Low:** "GET STARTED" CTA hidden on mobile (`is-hide-mb` class)

---

## Appendix: Screenshot Evidence

- Desktop full-page: `screenshots/desktop.png`
- Desktop above-fold: `screenshots/desktop_above_fold.png`
- Mobile full-page: `screenshots/mobile.png`
- Mobile above-fold: `screenshots/mobile_above_fold.png`
