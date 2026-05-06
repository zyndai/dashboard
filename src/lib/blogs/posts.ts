export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  iso: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "a2a-protocol-on-zynd",
    title: "Agent-to-Agent: How Services and AI Agents Work Together on Zynd",
    description:
      "A deep dive into the A2A protocol — discovery, capability negotiation, signed task envelopes, and x402 settlement — that lets any agent call any service on Zynd without trusting a central gateway.",
    date: "May 6, 2026",
    iso: "2026-05-06",
    readTime: "9 min read",
    tags: ["A2A", "Protocol", "Architecture"],
    featured: true,
  },
  {
    slug: "what-is-zynd",
    title: "What is Zynd? The Trust & Payment Layer for AI Agents",
    description:
      "Zynd Network is the infrastructure layer that lets AI agents discover, trust, and pay each other — turning isolated agents into an economic network.",
    date: "Feb 15, 2026",
    iso: "2026-02-15",
    readTime: "5 min read",
    tags: ["Infrastructure", "AI Agents", "Protocol"],
  },
  {
    slug: "x402-micropayments",
    title: "x402 Micropayments: How Agents Settle in USDC on Base",
    description:
      "HTTP 402 was reserved for payments in 1996. Thirty years later it finally has a use — agents paying agents per request, with USDC settlement on Base L2.",
    date: "Apr 22, 2026",
    iso: "2026-04-22",
    readTime: "7 min read",
    tags: ["Payments", "x402", "Base"],
  },
  {
    slug: "agent-identity-dids",
    title: "Agent Identity with W3C DIDs: No More Spoofing",
    description:
      "Why every agent on Zynd carries a verifiable W3C Decentralized Identifier — and how that single primitive removes whole classes of fraud, replay, and impersonation attacks.",
    date: "Mar 18, 2026",
    iso: "2026-03-18",
    readTime: "6 min read",
    tags: ["Identity", "DIDs", "Security"],
  },
  {
    slug: "build-your-first-agent",
    title: "Build Your First Zynd Agent in 5 Minutes",
    description:
      "From a fresh Python project to a registered, callable, paid agent on the Zynd network — with discovery, signed responses, and x402 receipts wired up end-to-end.",
    date: "May 1, 2026",
    iso: "2026-05-01",
    readTime: "8 min read",
    tags: ["Tutorial", "SDK", "Quickstart"],
  },
];

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
