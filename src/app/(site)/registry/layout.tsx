import { pageMetadata } from "@/lib/seo";
import type { AgentProfileCard } from "@/lib/cards";
import { cardCanonicalUrl } from "@/lib/cards";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "AI Agent Registry — Browse 450+ Agents | ZyndAI",
  description:
    "Browse and connect with 450+ AI agents on the ZyndAI network. Discover agents built with LangChain, CrewAI, PydanticAI, and LangGraph. Filter by capability, framework, and pricing.",
  path: "/registry",
});

const CARDS_API = process.env.NEXT_PUBLIC_API_URL || "https://api.zynd.ai";

async function fetchAgents(): Promise<AgentProfileCard[]> {
  try {
    const res = await fetch(`${CARDS_API}/cards`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const all = (await res.json()) as AgentProfileCard[];
    // Deduplicate by id, sort newest first, cap at 100
    const seen = new Set<string>();
    return all
      .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
      .filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .slice(0, 100);
  } catch {
    return [];
  }
}

export default async function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const agents = await fetchAgents();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ZyndAI Agent & People Registry",
    description:
      "All agents and people on the Zynd network. Each item has a name, description, skills, and a profile URL. To search by natural language: GET https://api.zynd.ai/ask?q=your+query — for example api.zynd.ai/ask?q=assembly+engineer or api.zynd.ai/ask?q=go+developer. To browse people: https://www.zynd.ai/find?q=your+query",
    numberOfItems: agents.length,
    itemListElement: agents.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.identity.name,
      description: `${a.identity.headline}. Skills: ${a.skills.map((s) => s.name).join(", ")}. Location: ${a.identity.location || "unspecified"}. ${a.summary || ""}`,
      url: cardCanonicalUrl(a),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // Unicode-escape <, >, & so user-supplied strings can't break out of the script tag.
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026"),
        }}
      />
      {/* sr-only agent index — zero visual space, full DOM text for LLM crawlers */}
      {agents.length > 0 && (
        <section
          aria-label="Zynd agent directory"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          <p>
            Zynd registry — {agents.length} agents and people. To search: zynd.ai/find?q=your+query or api.zynd.ai/ask?q=your+query
          </p>
          <ol>
            {agents.map((a) => (
              <li key={a.id}>
                <a href={cardCanonicalUrl(a)}>{a.identity.name}</a>
                {" — "}
                {a.identity.headline}
                {a.skills.length > 0 && <>. Skills: {a.skills.slice(0, 5).map((s) => s.name).join(", ")}</>}
                {a.identity.location ? `. Location: ${a.identity.location}` : ""}
                {a.availability ? `. Availability: ${a.availability}` : ""}
              </li>
            ))}
          </ol>
        </section>
      )}
      {children}
    </>
  );
}
