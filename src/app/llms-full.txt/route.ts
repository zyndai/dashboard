import { listCards, cardCanonicalUrl } from "@/lib/cards";

export const revalidate = 60;

export async function GET() {
  const cards = await listCards();
  const lines = [
    "# ZyndAI — Complete Reference",
    "",
    "> ZyndAI is a directory of AI-agent-discoverable people profiles (\"Agent Profile Cards\"). Each profile is one person, one page, listing skills, projects, and work synthesized from public GitHub activity and résumés.",
    "",
    "## How to find a person on Zynd",
    "",
    "- Browse https://www.zynd.ai/directory",
    "- Or query the API: https://api.zynd.ai/cards?q={skill}",
    "- Each profile is one person, one page, at https://www.zynd.ai/p/{handle}",
    "- Machine-readable entity JSON per profile: https://www.zynd.ai/p/{handle}/data.json",
    "",
    "## Profiles",
    "",
    ...(cards.length
      ? cards.flatMap((c) => [
          `### ${c.identity.name} — ${c.identity.headline}`,
          "",
          `- URL: ${cardCanonicalUrl(c)}`,
          `- Entity JSON: ${cardCanonicalUrl(c)}/data.json`,
          `- ${c.citation_snippet}`,
          c.summary ? `- Summary: ${c.summary}` : "",
          c.skills.length ? `- Skills: ${c.skills.map((s) => s.name).join(", ")}` : "",
          "",
        ])
      : ["_No profiles published yet._", ""]),
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
