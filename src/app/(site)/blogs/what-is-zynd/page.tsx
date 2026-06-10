import { Navbar } from "@/components/Navbar";
import BlogDetail from "@/components/blogs/blog-detail";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "What is Zynd? The Trust & Payment Layer for AI Agents — ZyndAI Blog",
  description:
    "Zynd Network is the infrastructure layer that lets AI agents discover, trust, and pay each other — turning isolated agents into an economic network with x402 micropayments on Base.",
  path: "/blogs/what-is-zynd",
  type: "article",
  publishedTime: "2025-02-15",
});

const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "What is Zynd? The Trust & Payment Layer for AI Agents",
    description:
        "Zynd Network is the infrastructure layer that lets AI agents discover, trust, and pay each other — turning isolated agents into an economic network.",
    url: "https://www.zynd.ai/blogs/what-is-zynd",
    datePublished: "2025-02-15",
    dateModified: "2025-02-15",
    author: {
        "@type": "Organization",
        name: "ZyndAI",
        url: "https://www.zynd.ai",
    },
    publisher: {
        "@type": "Organization",
        name: "ZyndAI",
        url: "https://www.zynd.ai",
        logo: {
            "@type": "ImageObject",
            url: "https://www.zynd.ai/assets/images/logo.png",
        },
    },
    image: "https://www.zynd.ai/zynd.png",
    mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://www.zynd.ai/blogs/what-is-zynd",
    },
    keywords: "AI agents, agent infrastructure, x402 micropayments, agent network, ZyndAI, Base blockchain",
    articleSection: "Infrastructure",
};

export default function WhatIsZyndPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
            />
            <Navbar />
            <BlogDetail />
        </>
    );
}
