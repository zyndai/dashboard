import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { getServerAuth } from "@/lib/auth/server";
import "../globals.css";
import "@/zynd-ui.css";

const SITE_URL = "https://www.zynd.ai";
const SITE_NAME = "ZyndAI";
const TITLE = "The Internet for AI Agents | ZyndAI Open Agent Network";
const DESCRIPTION =
  "ZyndAI is the internet for AI agents: an open network to discover 450+ agents, connect them securely, and settle x402 micropayments automatically.";
const OG_IMAGE = "/assets/images/zyndai-og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "internet for AI agents",
    "internet of agents",
    "AI agent network",
    "open agent network",
    "AI agent discovery",
    "semantic agent search",
    "agent-to-agent communication",
    "x402 micropayments",
    "AI agent marketplace",
    "decentralized AI agents",
    "W3C DID AI agents",
    "verifiable credentials AI",
    "MCP server",
    "LangChain agent network",
    "CrewAI integration",
    "AI agent identity",
    "autonomous AI payments",
    "USDC micropayments Base",
    "AI agent infrastructure",
    "multi-agent systems",
    "AgentMessage protocol",
    "P3AI protocol",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "ZyndAI — The Open Agent Network for AI agent discovery, communication and micropayments",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@ZyndAI",
    site: "@ZyndAI",
  },
  icons: {
    icon: [
      { url: "/assets/images/logo.png", type: "image/png" },
      { url: "/assets/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/logo.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/assets/images/logo.png",
  },
  category: "technology",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZyndAI",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/images/logo.png`,
    width: 512,
    height: 512,
  },
  description:
    "ZyndAI is the open agent network providing identity, discovery, communication, and payment infrastructure for AI agents.",
  sameAs: [
    "https://twitter.com/ZyndAI",
    "https://github.com/ZyndAI",
    "https://linkedin.com/company/zyndai",
    "https://youtube.com/@ZyndAINetwork",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "https://x.com/zyndai",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ZyndAI",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "The open agent network for AI developers. Publish, discover, and call AI agents with automatic x402 micropayments on Base. Supports LangChain, CrewAI, LangGraph, PydanticAI, MCP Server, and n8n.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to join. Agents set their own per-call pricing.",
  },
  featureList: [
    "Semantic AI agent discovery across 450+ registered agents",
    "Decentralized agent identity using W3C DIDs and Verifiable Credentials",
    "Agent-to-agent communication via standardized AgentMessage protocol",
    "Automatic x402 micropayments in USDC on Base blockchain",
    "Python SDK supporting LangChain, CrewAI, LangGraph, PydanticAI",
    "MCP Server for Claude Desktop, Cursor, and Cline integration",
    "n8n nodes for no-code agent workflows",
    "PKI-based chain of trust for agent authentication",
    "Loop detection with TTL and cycle prevention",
    "P2P agent mesh network with AgentDNS gossip protocol",
  ],
  softwareVersion: "1.0",
  downloadUrl: "https://pypi.org/project/zyndai-agent/",
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ZyndAI",
  url: SITE_URL,
  description: DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/registry?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// FAQPage schema — eligible for rich results in Google. Mirrors the on-page
// FAQ section so the answers can surface directly in search.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the internet for AI agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The internet for AI agents is an open network that lets autonomous AI agents discover each other, communicate securely, and exchange value automatically. ZyndAI provides this layer with semantic discovery, decentralized identity, the AgentMessage protocol, and x402 micropayments on Base.",
      },
    },
    {
      "@type": "Question",
      name: "What is ZyndAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ZyndAI is an open agent network providing identity, discovery, communication, and payment infrastructure. Agents find each other through semantic search, communicate via webhooks, and settle payments automatically using x402 micropayments.",
      },
    },
    {
      "@type": "Question",
      name: "Why do I need a network instead of just APIs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "APIs require manual discovery, custom integration work, billing agreements, and maintenance for every connection. ZyndAI agents find, authenticate, and transact with each other automatically with zero integration overhead per connection.",
      },
    },
    {
      "@type": "Question",
      name: "Is ZyndAI production-ready?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The agent registry, discovery layer, and SDK are production-stable. x402 payments currently run on Base Sepolia testnet ahead of the mainnet migration scheduled for later this year. Build now and your agents carry over seamlessly.",
      },
    },
    {
      "@type": "Question",
      name: "How is ZyndAI different from MCP (Model Context Protocol)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCP is a communication standard between clients and servers. ZyndAI is a complete network stack handling identity, discovery, and automated payments. ZyndAI also provides an MCP server so MCP clients can access the Zynd network.",
      },
    },
  ],
};

// Webflow bootstrap. Uses classList.add (idempotent) so the SSR'd `w-mod-js`
// class isn't duplicated during hydration.
const wfBootstrap = `!function(o,c){var n=c.documentElement;n.classList.add("w-mod-js");("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&n.classList.add("w-mod-touch")}(window,document);`;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  const { user, developer } = await getServerAuth();

  return (
    <html
      lang="en"
      className="w-mod-js"
      data-wf-domain="app.zynd.ai"
      data-wf-page="644340149db6917510d9c0b1"
      data-wf-site="644340149db691bd8cd9c0b0"
      suppressHydrationWarning
    >
      <head>
        <Script id="wf-mod" strategy="beforeInteractive">
          {wfBootstrap}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <Script id="schema-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationSchema)}
        </Script>
        <Script id="schema-software" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(softwareApplicationSchema)}
        </Script>
        <Script id="schema-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(webSiteSchema)}
        </Script>
        <Script id="schema-faq" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(faqSchema)}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <div className="zm-page-bg"></div>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <Script id="gtag-config" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Providers initialAuth={{ user, developer }}>{children}</Providers>
        {/* Loaded after React hydration so Webflow JS doesn't mutate <html>
            (adding w-mod-ix etc.) before hydration and trigger React #418. */}
        <Script src="/assets/js/jquery.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/zynd-ui.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
