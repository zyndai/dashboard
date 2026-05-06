import { Navbar } from "@/components/Navbar";
import BlogList from "@/components/blogs/blog-list";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog — AI Agent Infrastructure Insights | ZyndAI",
  description:
    "Read the latest from ZyndAI — insights on AI agent infrastructure, x402 micropayments on Base, agent identity, and the open agent network.",
  path: "/blogs",
});

export default function BlogsPage() {
  return (
    <>
      <Navbar />
      <BlogList />
    </>
  );
}
