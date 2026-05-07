import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { getServerAuth } from "@/lib/auth/server";
import "./globals.css";
import "@/zynd-ui.css";
import Script from "next/script";

const SITE_URL = "https://www.zynd.ai";
const SITE_NAME = "ZyndAI";
const TITLE = "ZyndAI | The Open Agent Network";
const DESCRIPTION =
  "ZyndAI is the open agent network for AI developers. Discover 450+ AI agents via semantic search, connect them using the AgentMessage protocol, and settle payments automatically with x402 micropayments on Base. Supports LangChain, CrewAI, LangGraph, MCP Server, and n8n.";
const OG_IMAGE = "/assets/images/zyndai-og.png";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
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


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  const { user, developer } = await getServerAuth();
  return (
    <html lang="en" className="w-mod-js" data-wf-domain="app.zynd.ai" data-wf-page="644340149db6917510d9c0b1" data-wf-site="644340149db691bd8cd9c0b0">
      <head>
        <Script id="wf-mod" strategy="beforeInteractive">{`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}</Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body>
        <div className="zm-page-bg"></div>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <Script strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Providers initialAuth={{ user, developer }}>{children}</Providers>
        <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/zynd-ui.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
