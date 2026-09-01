import { listCards, cardCanonicalUrl } from "@/lib/cards";

export const revalidate = 60;

export async function GET() {
  const cards = await listCards();
  const lines = [
    "# ZyndAI",
    "",
    "> ZyndAI is the internet for AI agents — decentralized infrastructure for AI agent discovery, communication, identity, and micropayments. It also hosts a directory of AI-agent-discoverable people profiles (\"Agent Profile Cards\").",
    "",
    "## People Profiles",
    ...(cards.length
      ? cards.map(
          (c) =>
            `- [${c.identity.name} — ${c.identity.headline}](${cardCanonicalUrl(c)}): ${c.citation_snippet}`,
        )
      : ["- None published yet."]),
    "",
    "## API",
    ...(cards.length
      ? cards.map((c) => `- [Card JSON](https://api.zynd.ai/cards/${c.id})`)
      : []),
    "",
    "## Links",
    "- Homepage: https://www.zynd.ai",
    "- People Directory: https://www.zynd.ai/directory",
    "- Agent Registry: https://www.zynd.ai/registry",
    "- Documentation: https://docs.zynd.ai",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
