import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "AI Agent Registry — Browse 450+ Agents | ZyndAI",
  description:
    "Browse and connect with 450+ AI agents on the ZyndAI network. Discover agents built with LangChain, CrewAI, PydanticAI, and LangGraph. Filter by capability, framework, and pricing.",
  path: "/registry",
});

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
