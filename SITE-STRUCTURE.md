# ZyndAI Site Structure & URL Architecture
**Generated:** 2026-03-22

---

## Recommended URL Hierarchy

```
zynd.ai/
├── (home)
│
├── /platform
│   ├── /discovery          — Semantic agent search feature
│   ├── /communication      — AgentMessage protocol
│   ├── /payments           — x402 micropayments on Base
│   └── /identity           — DID + reputation system
│
├── /integrations
│   ├── /langchain          — LangChain integration guide
│   ├── /crewai             — CrewAI integration guide
│   ├── /langgraph          — LangGraph integration guide
│   ├── /pydanticai         — PydanticAI integration guide
│   ├── /mcp-server         — MCP Server setup guide
│   ├── /n8n                — n8n nodes integration
│   └── /python-sdk         — Python SDK reference
│
├── /registry               — Live agent marketplace (authenticated)
│
├── /compare
│   ├── /zyndai-vs-fetchai  — vs Fetch.ai
│   ├── /zyndai-vs-composio — vs Composio
│   └── /zyndai-vs-smithery — vs Smithery/MCP marketplaces
│
├── /solutions
│   ├── /for-ai-developers  — Developer-focused landing
│   ├── /for-enterprises    — Enterprise-focused landing
│   └── /agent-monetization — Monetize your agent landing
│
├── /blog                   — Technical blog
│   └── /[slug]
│
├── /guides                 — Long-form evergreen guides
│   ├── /what-is-x402
│   ├── /how-to-build-ai-agent
│   ├── /agent-to-agent-communication
│   └── /ai-agent-monetization
│
├── /glossary               — AI agent terminology definitions
│
├── /about
├── /pricing                — Pricing page (if applicable)
└── /contact
```

---

## Current State vs Target

| Current | Target | Priority |
|---------|--------|----------|
| `/` (single long-scroll page) | Keep but add internal deep links | Low |
| `/registry` (exists) | Add SEO-friendly public listing | High |
| `/blogs` (route exists) | Populate with content | Critical |
| — | `/platform/*` feature pages | High |
| — | `/integrations/*` per-framework | High |
| — | `/compare/*` comparison pages | Medium |
| — | `/guides/*` evergreen content | High |
| — | `/solutions/*` audience pages | Medium |

---

## Internal Linking Strategy

### Hub-and-Spoke Model

Each **pillar page** (`/platform/*`) links to:
- Related blog posts
- Relevant integration pages
- Comparison pages where applicable

Each **integration page** (`/integrations/*`) links to:
- The relevant platform feature (discovery, payments, etc.)
- Getting started guide in docs.zynd.ai
- Registry to explore agents using that framework

Each **blog post** links to:
- 1-2 pillar pages (contextually)
- 1 integration page (if relevant)
- Registry CTA

### Navigation Links to Add
- Main nav: Home, Platform, Integrations, Registry, Blog, Docs
- Footer: Compare pages, Solutions pages, Glossary, About

---

## robots.txt (Add to `/public/robots.txt`)

```
User-agent: *
Allow: /

# Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://zynd.ai/sitemap.xml
```

---

## sitemap.xml Priority Structure

| URL | Priority | Change Freq |
|-----|----------|-------------|
| / | 1.0 | monthly |
| /platform/* | 0.9 | monthly |
| /integrations/* | 0.9 | monthly |
| /registry | 0.8 | daily |
| /blog/* | 0.8 | weekly |
| /guides/* | 0.8 | monthly |
| /compare/* | 0.7 | monthly |
| /solutions/* | 0.7 | monthly |
| /about, /pricing | 0.6 | monthly |

---

## llms.txt (Add to `/public/llms.txt`)

```
# ZyndAI

ZyndAI is The Open Agent Network — a decentralized infrastructure platform
for AI agent discovery, communication, and autonomous micropayments.

## What ZyndAI Does

- **Agent Discovery**: Semantic search across 350+ published AI agents
- **Agent Communication**: Standardized AgentMessage webhook protocol
- **Autonomous Payments**: x402 micropayment protocol on Base (USDC)
- **Agent Identity**: Decentralized identifiers (DIDs) with on-chain attestation

## Who It's For

AI engineers and developers building with LangChain, CrewAI, LangGraph,
PydanticAI, or any Python-based LLM framework. Also supports MCP Server
(Claude Desktop, Cursor, Cline) and n8n workflow automation.

## Key URLs

- Homepage: https://zynd.ai
- Agent Registry: https://zynd.ai/registry
- Documentation: https://docs.zynd.ai
- Python SDK: https://pypi.org/project/zyndai-agent/
- MCP Server: https://npmjs.com/package/zyndai-mcp-server

## Founded

2024 | Based in: [Location] | Status: Series A (in progress, 2025)
```
