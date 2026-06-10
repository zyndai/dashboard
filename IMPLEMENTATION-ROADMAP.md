# ZyndAI SEO Implementation Roadmap
**Generated:** 2026-03-22

---

## Phase 1 — Foundation (Weeks 1–4: Apr 2026)

**Goal:** Fix critical technical gaps; make the site indexable and crawlable.

### Week 1: Critical Technical Fixes

- [ ] **Add `robots.txt`** to `/public/robots.txt`
  - Allow all bots including GPTBot, ClaudeBot, PerplexityBot
  - Reference sitemap URL

- [ ] **Add `sitemap.xml`** — use Next.js `app/sitemap.ts` for dynamic generation
  - Include `/`, `/blog/*`, `/registry`, `/about`, `/platform/*`, `/integrations/*`

- [ ] **Add canonical tags** to all pages via `<link rel="canonical" />` in metadata

- [ ] **Add `llms.txt`** to `/public/llms.txt` for AI crawler context

- [ ] **Fix metadata gaps:**
  - Add `metadataBase` to layout for proper OG URL resolution
  - Verify all OG image dimensions (1200×630px)
  - Add `robots: "index, follow"` explicitly

### Week 2: Schema Markup

- [ ] **Organization schema** on homepage:
  ```json
  {
    "@type": "Organization",
    "name": "ZyndAI",
    "url": "https://zynd.ai",
    "description": "The Open Agent Network for AI agent discovery, communication, and micropayments",
    "sameAs": ["https://twitter.com/ZyndAI", "https://github.com/ZyndAI", "https://linkedin.com/company/zyndai"]
  }
  ```

- [ ] **SoftwareApplication schema** on homepage:
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "ZyndAI",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web, Python",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  }
  ```

- [ ] **FAQPage schema** — extract FAQ section from homepage component and add JSON-LD

- [ ] **WebSite schema** with `SearchAction` for registry search

### Week 3: Performance Baseline

- [ ] **Measure Core Web Vitals** with PageSpeed Insights
  - Three.js + GSAP will likely hurt LCP/TBT — document baseline
  - Add `loading="lazy"` to all below-fold images
  - Defer non-critical GSAP animations

- [ ] **Add `<link rel="preload">` for hero assets** (fonts, critical images)

- [ ] **Check Three.js canvas for CLS** — ensure canvas has explicit height/width

- [ ] **Add Next.js `<Image>`** for all `<img>` tags in static components

### Week 4: Analytics & Tracking

- [ ] **Google Search Console:** Verify domain, submit sitemap
- [ ] **Bing Webmaster Tools:** Verify and submit sitemap
- [ ] **Set up analytics** (Plausible / GA4) with SEO conversion goals:
  - Registry signup from organic
  - Docs visit from organic
  - Blog page views

---

## Phase 2 — Expansion (Weeks 5–12: May–Jun 2026)

**Goal:** Build content infrastructure; launch blog; create integration pages.

### Content Infrastructure

- [ ] Build `/blog` page with proper listing (title, date, description, author)
- [ ] Add author bio component with credentials field (E-E-A-T)
- [ ] Add `BlogPosting` JSON-LD schema to each post
- [ ] Add `TechArticle` JSON-LD schema to each guide
- [ ] Implement breadcrumbs + `BreadcrumbList` schema

### Integration Pages (1/week)

- [ ] `/integrations/langchain` with CodeExample schema
- [ ] `/integrations/crewai`
- [ ] `/integrations/mcp-server`
- [ ] `/integrations/n8n`
- [ ] `/integrations/langgraph`
- [ ] `/integrations/pydanticai`
- [ ] `/integrations/python-sdk`

Each integration page should have:
- Installation command
- Code snippet (5–10 lines)
- Link to full docs
- "View agents built with [framework]" CTA to registry
- `SoftwareApplication` + `HowTo` schema

### Platform Feature Pages

- [ ] `/platform/discovery` — Semantic search deep-dive
- [ ] `/platform/communication` — AgentMessage protocol
- [ ] `/platform/payments` — x402 on Base
- [ ] `/platform/identity` — DIDs + EigenTrust

### Blog Launch

- [ ] Publish first 8 posts per CONTENT-CALENDAR.md
- [ ] Set up RSS feed at `/blog/feed.xml`
- [ ] Submit to developer newsletters (TLDR AI, The Rundown AI, JavaScript Weekly)

---

## Phase 3 — Scale (Weeks 13–24: Jul–Sep 2026)

**Goal:** Build authority, drive organic traffic, capture long-tail keywords.

### Content Scale
- [ ] Reach 24 published blog posts
- [ ] Publish all 4 evergreen guides
- [ ] Build `/glossary` with 20+ AI agent terms
- [ ] Launch comparison pages (3 total)

### Link Building
- [ ] Submit to `awesome-mcp-servers` GitHub list
- [ ] Submit to `awesome-ai-agents` GitHub list
- [ ] Contribute ZyndAI integration to LangChain docs
- [ ] Publish guest post on Towards Data Science
- [ ] Pitch Coinbase/Base blog for x402 case study

### Registry SEO
- [ ] Make agent listing pages publicly accessible (SEO-indexable)
- [ ] Add `ItemList` schema to agent category pages
- [ ] Create category pages: `/registry/langchain-agents`, `/registry/data-agents`, etc.
- [ ] Add individual agent pages with `SoftwareApplication` schema

### GEO Optimization
- [ ] Audit all pages for passage-level citability
- [ ] Add "Quick Answer" boxes to guides (AI Overviews optimization)
- [ ] Ensure all comparison tables are in clean HTML (not just images)
- [ ] Publish original data: "ZyndAI Agent Network Stats Q3 2026"

---

## Phase 4 — Authority (Months 7–12: Oct 2026–Mar 2027)

**Goal:** Establish ZyndAI as the definitive source for AI agent infrastructure content.

### Thought Leadership
- [ ] Publish "State of AI Agent Networks 2027" annual report
- [ ] Launch quarterly developer survey on agent infrastructure
- [ ] Partner with AI research blogs for co-authored posts
- [ ] Speak at/sponsor developer conferences (publish writeups)

### Technical SEO Advanced
- [ ] Implement `IndexNow` for instant page indexing on publish
- [ ] Add `hreflang` if internationalization begins
- [ ] Implement structured data testing and monitoring pipeline
- [ ] Run quarterly Core Web Vitals optimization sprints

### Content Expansion
- [ ] Launch `/academy` with video + text courses on agent development
- [ ] Launch `/templates` with downloadable agent starter templates
- [ ] Start `/podcast` or `/newsletter` for recurring organic signals

---

## Quick Wins (Do This Week)

These can be done in under 2 hours with high impact:

1. `robots.txt` — 5 min
2. `sitemap.ts` in Next.js App Router — 30 min
3. `llms.txt` — 15 min
4. FAQPage JSON-LD from existing FAQ section — 45 min
5. Organization JSON-LD in layout.tsx — 20 min
6. Submit to Google Search Console — 15 min

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Three.js hurts Core Web Vitals | High | High | Lazy-load 3D canvas; use Intersection Observer |
| Blog remains empty / low quality | Medium | High | Assign dedicated writer; use AI draft + expert review |
| Registry pages not indexable (auth wall) | High | High | Create public preview pages for each agent |
| Competitor publishes x402 content first | Low | Medium | Prioritize x402 guide in Week 1 |
| Domain authority slow to build | High | Medium | Focus on GitHub/dev community backlinks early |
