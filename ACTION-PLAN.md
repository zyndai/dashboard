# SEO Action Plan — https://www.zynd.ai/
**Generated:** 2026-03-23 | **Overall Score:** 53/100

---

## CRITICAL — Fix Immediately (Blocking indexing or causing penalties)

---

### C1. Fix Broken OG Image Path
**File:** `src/app/layout.tsx:11`
**Effort:** 30 minutes | **Impact:** All social shares broken

```ts
// Change:
const OG_IMAGE = "/assets/zynd.png";
// To:
const OG_IMAGE = "/zynd.png";
```

The file exists at `public/zynd.png`, not `public/assets/zynd.png`. Every social share preview (Twitter, LinkedIn, Slack, Discord) shows no image for every page on the site.

---

### C2. Fix SITE_URL / Canonical Domain Mismatch
**Files:** `src/app/layout.tsx:6`, `src/app/sitemap.ts:3`, `public/robots.txt:26`
**Effort:** 1 hour | **Impact:** All canonicals, OG tags, schemas, sitemap pointing to wrong origin

Decide on one canonical domain (`https://www.zynd.ai` is the live domain) and apply it everywhere:

```ts
// src/app/layout.tsx:6
const SITE_URL = "https://www.zynd.ai";

// src/app/sitemap.ts:3
const BASE_URL = "https://www.zynd.ai";
```

```
# public/robots.txt — line 26
Sitemap: https://www.zynd.ai/sitemap.xml
```

This single constant propagates into `metadataBase`, `alternates.canonical`, `openGraph.url`, and all 4 schema `url` fields.

---

### C3. Fix Agent Registry URL Pattern (Remove JSON Query String)
**File:** `src/app/registry/page.tsx:638`
**Effort:** 2 hours | **Impact:** All agent detail pages are currently uncrawlable

```tsx
// Change:
href={`/registry/${agent.id}?data=${encodeURIComponent(JSON.stringify(agent))}`}
// To:
href={`/registry/${agent.id}`}
```

The detail page at `src/app/registry/[id]/page.tsx` already has `getAgentByIdPublic(agentId)` as a fallback data source. Remove the `data` query string dependency entirely. Without this fix, every agent page is a unique non-canonical URL invisible to search engines.

---

### C4. Move FAQPage Schema to Homepage Only
**Files:** `src/app/layout.tsx`, `src/app/page.tsx`
**Effort:** 1 hour | **Impact:** Structured data guideline violation; risk of manual penalty

Move the `faqSchema` out of the global `layout.tsx` and into `src/app/page.tsx`:

```tsx
// src/app/page.tsx — add inside the component return
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

Also add the 2 missing FAQ items to `FAQ.tsx` (AgentMessage, DID identity) to match the schema, OR remove those questions from the schema. Visible content and schema must match.

---

### C5. Fix Organization Schema Logo (ImageObject)
**File:** `src/app/layout.tsx` — organizationSchema
**Effort:** 15 minutes | **Impact:** Organization rich result / Knowledge Graph ineligible

```json
// Change:
"logo": "https://www.zynd.ai/zynd.png"

// To:
"logo": {
  "@type": "ImageObject",
  "url": "https://www.zynd.ai/zynd.png",
  "width": 512,
  "height": 512
}
```

---

### C6. Add a Contact Page
**Files:** New `src/app/contact/page.tsx`, update `FAQ.tsx` contact button
**Effort:** 2 hours | **Impact:** Google QRG trust signal; eliminates Twitter-as-contact

Create `/contact` with at minimum an email address or a functional contact form. Update the FAQ "Contact us" button from `href="https://x.com/zyndai"` to `href="/contact"`. Also update the `contactPoint` in Organization schema:

```json
"contactPoint": {
  "@type": "ContactPoint",
  "contactType": "customer support",
  "email": "hello@zynd.ai"
}
```

---

### C7. Add Security Headers
**File:** `next.config.ts`
**Effort:** 30 minutes | **Impact:** XSS exposure; clickjacking; ranking signal

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://registry.zynd.ai https://www.google-analytics.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Adjust the CSP `connect-src` and `script-src` as needed for Privy/Wagmi wallet connections.

---

## HIGH — Fix Within 1 Week (Significantly impacts rankings)

---

### H1. Complete the Sitemap
**File:** `src/app/sitemap.ts`
**Effort:** 30 minutes

```ts
import { MetadataRoute } from "next";

const BASE_URL = "https://www.zynd.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date("2026-03-01"),
    },
    {
      url: `${BASE_URL}/registry`,
      lastModified: new Date("2026-03-23"),
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date("2026-03-23"),
    },
    {
      url: `${BASE_URL}/blogs/what-is-zynd`,
      lastModified: new Date("2025-02-15"),
    },
  ];
}
```

Key changes: add `/blogs` and `/blogs/what-is-zynd`, remove PDF, fix base URL, use static dates, remove `priority` and `changefreq` (Google ignores them).

---

### H2. Block Private Routes in robots.txt
**File:** `public/robots.txt`
**Effort:** 10 minutes

Add before the Sitemap line:
```
Disallow: /dashboard/
Disallow: /auth
Disallow: /onboard
```

---

### H3. Add `noindex` to Dashboard Pages
**File:** `src/app/dashboard/layout.tsx`
**Effort:** 15 minutes

```ts
export const metadata = {
  robots: { index: false, follow: false },
};
```

---

### H4. Add BlogPosting Schema to Blog Post
**File:** `src/app/blogs/what-is-zynd/page.tsx`
**Effort:** 1 hour

```tsx
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "What is Zynd? The Trust & Payment Layer for AI Agents",
  "description": "Zynd Network is the infrastructure layer that lets AI agents discover, trust, and pay each other.",
  "url": "https://www.zynd.ai/blogs/what-is-zynd",
  "datePublished": "2025-02-15",
  "dateModified": "2025-02-15",
  "author": {
    "@type": "Organization",
    "name": "ZyndAI",
    "url": "https://www.zynd.ai"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ZyndAI",
    "url": "https://www.zynd.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.zynd.ai/zynd.png"
    }
  },
  "image": "https://www.zynd.ai/zynd.png",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.zynd.ai/blogs/what-is-zynd"
  },
};
```

Also add `author` and `datePublished` to the visible blog post component (`blog-detail.tsx`).

---

### H5. Add Per-Page Metadata to /registry
**File:** `src/app/registry/page.tsx`
**Effort:** 30 minutes

The registry is a client component and cannot export `metadata`. The solution is to add a thin server component wrapper or use Next.js `generateMetadata`. Alternatively, create a `src/app/registry/layout.tsx`:

```ts
// src/app/registry/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Registry — Discover 450+ Agents | ZyndAI",
  description: "Browse and connect with 450+ AI agents registered on the ZyndAI network. Find agents built with LangChain, CrewAI, PydanticAI, and LangGraph.",
  alternates: { canonical: "https://www.zynd.ai/registry" },
};

export default function RegistryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

### H6. Fix SoftwareApplication Schema operatingSystem
**File:** `src/app/layout.tsx`
**Effort:** 5 minutes

```json
// Change:
"operatingSystem": "Web, Python"
// To:
"operatingSystem": "Web"
```

Python is a programming language, not an operating system. This is a schema validation failure.

---

### H7. Fix the Newsletter Form Backend
**File:** `src/components/Footer.tsx`
**Effort:** 2-4 hours

The `handleSubmit` function sets `setSubmitted(true)` but never calls an API. Either:
- Connect to a real email service (Resend, Mailchimp, ConvertKit API)
- Replace the form with a link to a hosted form
- Remove the form entirely

A non-functional subscription form actively damages trust and wastes user intent.

---

### H8. Fix H1 Rendering — Remove useEffect Text Set
**File:** `src/components/Hero.tsx:13-17, 43`
**Effort:** 1 hour

```tsx
// Change:
<h1 ref={h1Ref} data-scramble="load" className="hero-h1" />
// To:
<h1 ref={h1Ref} data-scramble="load" className="hero-h1">
  The Open Agent Network
</h1>
```

Remove the `useEffect` that sets `h1Ref.current.textContent`. The ScrambleTextPlugin should animate from the existing text content, not from empty. This makes the H1 content available in the initial HTML for crawlers.

---

### H9. Fix agentCount CLS — Reserve Badge Space
**File:** `src/components/Hero.tsx:37-41`
**Effort:** 1 hour

```tsx
// Change:
{agentCount !== null && (
  <div className="hero-agent-badge">...
// To:
<div className="hero-agent-badge" style={{ minHeight: "28px" }}>
  {agentCount !== null ? (
    <>
      <span className="hero-agent-dot" />
      <span>{agentCount.toLocaleString()}+ Agents on the Network</span>
    </>
  ) : (
    <span style={{ opacity: 0 }}>Loading...</span>
  )}
</div>
```

Reserve fixed height so the badge insertion does not shift the H1 below it.

---

### H10. Resolve Agent Count Inconsistency
**Files:** `public/llms.txt`, `src/app/layout.tsx`, `src/components/Hero.tsx`
**Effort:** 30 minutes

Align all references to the same accurate figure. If the live count is ~350, use "350+". Update `llms.txt` and layout metadata keywords/descriptions to match. Do not claim "1,000+" in the roadmap if the live dynamic count shows lower.

---

### H11. Self-Host Chakra Petch Font — Remove Google Fonts
**File:** `src/app/layout.tsx:239-241`, `src/app/globals.css`
**Effort:** 1 hour

Download `ChakraPetch-Bold.woff2` from Google Fonts and place in `public/assets/fonts/`. Add `@font-face` in `globals.css` with `font-display: swap`. Remove the 3 Google Fonts `<link>` tags from `layout.tsx`. This eliminates a render-blocking external CSS request.

---

### H12. Gate Frame Sequence Preload Behind IntersectionObserver
**File:** `src/components/FrameSequence.tsx:70-98`
**Effort:** 2 hours

```tsx
// Wrap the preload loop in an IntersectionObserver:
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        // move the 118-frame preload loop here
        observer.disconnect();
      }
    },
    { rootMargin: "200px" }
  );
  if (containerRef.current) observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

Also convert frames from PNG to WebP (saves 25-40% bandwidth).

---

### H13. Move Wallet Providers Out of Homepage Layout
**File:** `src/components/providers.tsx`
**Effort:** 4-6 hours

Create a separate layout for authenticated/wallet-required routes:

```
src/app/(wallet)/layout.tsx     ← wraps with PrivyProvider, WagmiProvider
src/app/(wallet)/dashboard/     ← move dashboard here
src/app/(wallet)/auth/          ← move auth here
src/app/(wallet)/registry/      ← move registry here (if wallet needed)
```

The marketing homepage (`/`) and blog pages should have zero wallet SDK code. This removes 300-500 KB of JavaScript from the homepage bundle and eliminates the `mounted` null-return pattern for non-wallet pages.

---

## MEDIUM — Fix Within 1 Month (Optimization opportunities)

---

### M1. Publish Minimum 4 New Blog Posts
**Files:** `src/app/blogs/[slug]/` (new routes)
**Effort:** 1-2 days per post

Priority articles based on declared keyword strategy:
1. "How to Monetize AI Agents with x402 Micropayments" (Tier 1 keyword)
2. "Connecting LangChain Agents to the ZyndAI Network" (framework integration)
3. "What is x402? The HTTP Payment Protocol for AI" (definitional, citable)
4. "ZyndAI vs Fetch.ai / Agentverse: AI Agent Networks Compared" (Tier 3, comparison)

Each post needs:
- Author name + bio
- `BlogPosting` JSON-LD schema
- 1,500+ words
- `datePublished` and `dateModified`
- At least 3 internal links to other site pages

---

### M2. Create /about and /team Pages
**Files:** New `src/app/about/page.tsx`, `src/app/team/page.tsx`
**Effort:** 1 day

Google Quality Rater Guidelines require organizational transparency for technical/financial infrastructure products. Include:
- Founding story and mission
- Named team members with roles
- Location (even just city/country)
- Company registration or legal entity name

---

### M3. Add BreadcrumbList Schema to Inner Pages
**Files:** `src/app/registry/layout.tsx`, `src/app/blogs/layout.tsx`, detail pages
**Effort:** 2 hours

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.zynd.ai"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.zynd.ai/blogs"},
    {"@type": "ListItem", "position": 3, "name": "What is Zynd?", "item": "https://www.zynd.ai/blogs/what-is-zynd"}
  ]
}
```

---

### M4. Update Blog Post — Remove Outdated Forward-Looking Statements
**File:** `src/components/blogs/blog-detail.tsx`
**Effort:** 2 hours

The "Current Status" and "Next 90 days" sections in the blog post reference February/March/April 2025 milestones as future events. These are now 13 months in the past. Either:
- Add a dated addendum: "Update (March 2026): Since this post was published..."
- Replace with current status
- Archive the section and add current roadmap status

---

### M5. Replace <img> with Next.js <Image> in Navbar
**File:** `src/components/Navbar.tsx:116-128`
**Effort:** 30 minutes

```tsx
import Image from "next/image";
// Replace:
<img src="/zynd.png" alt="ZyndAI" className="nav-logo" />
// With:
<Image src="/zynd.png" alt="ZyndAI" width={40} height={40} className="nav-logo" />
```

Provides automatic WebP, lazy loading, CLS-preventing dimension reservation.

---

### M6. Add Video Poster Preload Hint
**File:** `src/app/page.tsx`
**Effort:** 15 minutes

```tsx
// In layout.tsx <head> or using Next.js metadata:
<link rel="preload" as="image" href="/assets/images/video-poster.jpg" fetchpriority="high" />
```

Also add `preload="none"` to the `<video>` element to prevent pre-buffering on mobile:
```tsx
<video autoPlay loop muted playsInline preload="none" poster="/assets/images/video-poster.jpg">
  <source src="/assets/bg.webm" type="video/webm" />  {/* webm first */}
  <source src="/assets/bg.mp4" type="video/mp4" />
</video>
```

---

### M7. Add Google Analytics Lazy Loading
**File:** `src/app/layout.tsx:260-271`
**Effort:** 15 minutes

```tsx
<Script
  strategy="lazyOnload"
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
/>
```

---

### M8. Add /registry Content and Value Proposition
**File:** `src/app/registry/page.tsx`
**Effort:** 2 hours

Add a static introductory section above the agent list:
```
What is the ZyndAI Registry?
Browse 450+ AI agents built with LangChain, CrewAI, PydanticAI, and LangGraph.
Each agent has a verified DID, defined capabilities, and a per-call x402 price.
```

This is the only static SEO content on a page with priority 0.9 in the sitemap.

---

### M9. Add Homepage CTA to Blog and Registry
**File:** `src/components/Hero.tsx` or `src/app/page.tsx`
**Effort:** 1 hour

The homepage has zero internal links to blog content. Add:
- A "Latest from the Blog" teaser section (pulls 1-2 latest posts)
- A "Browse the Registry" button in the Hero (alongside or replacing the GitHub star CTA)

---

### M10. Implement IndexNow
**Effort:** 2 hours

1. Generate key at https://www.bing.com/indexnow
2. Place `public/<key>.txt`
3. Add `<key>` meta tag to `layout.tsx`
4. POST to IndexNow API when new blog posts or registry entries are published

---

## LOW — Backlog (Nice to have)

---

### L1. Remove Unused Font File
**File:** `public/assets/fonts/HelveticaNeueRoman.otf`
Delete — the `.woff2` version is used in CSS; the `.otf` is not referenced anywhere and adds unnecessary bulk to the public directory.

---

### L2. Add Privacy Policy and Terms of Service Content
**Files:** `src/app/privacy-policy/page.tsx`, `src/app/terms-of-service/page.tsx`
Replace "Coming Soon" with real legal content. Once real content is present, add both pages to `sitemap.ts`.

---

### L3. Remove maximumScale: 1 from Viewport
**File:** `src/app/layout.tsx:16`
```ts
// Remove this line:
maximumScale: 1,
```
WCAG 1.4.4 requires users be able to resize text. This also slightly improves Lighthouse accessibility score.

---

### L4. Cap Three.js DPR and GPU Settings
**File:** `src/components/three/SceneCanvas.tsx`
```tsx
// Change:
dpr={[1, 2]}
gl={{ powerPreference: "high-performance", ... }}
// To:
dpr={[1, 1.5]}
gl={{ powerPreference: "default", ... }}
```

---

### L5. Add llms.txt Link to Homepage Footer
**File:** `src/components/Footer.tsx`
Add a small "AI crawler info" or `llms.txt` link in the footer alongside Privacy Policy and Terms. This is increasingly expected by AI-first platforms.

---

### L6. Publish Original Benchmark Data
Create a page or blog post with proprietary statistics:
- Agent call latency benchmarks
- x402 payment settlement times on Base
- Registry growth rate
- SDK install counts from npm/PyPI

Original data is the highest-value citation asset for AI search engines.

---

### L7. Build Brand Entity Presence
Long-term GEO investment:
1. **YouTube** — Demo video: "Register and call an AI agent with ZyndAI in 3 minutes" (highest ROI single action for AI citation)
2. **Reddit** — Post in r/LangChain, r/AIAgents, r/ethereum about x402 integration
3. **Hacker News** — "Show HN: ZyndAI — pay AI agents automatically with HTTP x402"
4. **Press** — Target The Block, CoinDesk, or The New Stack for one independent coverage piece (required for Wikipedia eligibility)

---

## Implementation Priority Matrix

| Priority | Action | Effort | SEO Impact |
|----------|--------|--------|------------|
| 1 | Fix OG image path (C1) | 30 min | High |
| 2 | Fix SITE_URL/canonical mismatch (C2) | 1 hr | Critical |
| 3 | Fix agent URL JSON query string (C3) | 2 hr | Critical |
| 4 | Add security headers (C7) | 30 min | High |
| 5 | Move FAQPage schema to homepage only (C4) | 1 hr | High |
| 6 | Complete sitemap (H1) | 30 min | High |
| 7 | Fix Organization logo ImageObject (C5) | 15 min | Medium |
| 8 | Fix SoftwareApplication operatingSystem (H6) | 5 min | Low |
| 9 | Add BlogPosting schema to blog post (H4) | 1 hr | High |
| 10 | Add /registry layout metadata (H5) | 30 min | High |
| 11 | Fix newsletter form (H7) | 2-4 hr | Trust |
| 12 | Fix H1 useEffect pattern (H8) | 1 hr | High |
| 13 | Fix agentCount CLS (H9) | 1 hr | Medium |
| 14 | Move wallet providers to auth routes (H13) | 4-6 hr | Critical perf |
| 15 | Gate FrameSequence preload (H12) | 2 hr | High perf |
| 16 | Add contact page (C6) | 2 hr | Critical trust |
| 17 | Publish 4 new blog posts (M1) | 4-8 days | Critical content |
| 18 | Create about/team page (M2) | 1 day | High E-E-A-T |
| 19 | Self-host Chakra Petch font (H11) | 1 hr | Medium perf |
| 20 | Add BreadcrumbList schema (M3) | 2 hr | Medium |
