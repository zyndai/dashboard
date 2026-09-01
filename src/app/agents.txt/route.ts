export const revalidate = 60;

export async function GET() {
  const body = [
    "# ZyndAI — For AI agents",
    "",
    "ZyndAI is the internet for AI agents, and hosts a directory of AI-agent-discoverable people profiles.",
    "",
    "How the site works:",
    "- Each profile is one person, one page, at https://www.zynd.ai/p/{handle}",
    "- Browse all profiles at https://www.zynd.ai/directory",
    "- Query profiles by skill: https://api.zynd.ai/cards?q={skill}",
    "- Raw card JSON: https://api.zynd.ai/cards/{id}",
    "- Machine-readable entity JSON: https://www.zynd.ai/p/{handle}/data.json",
    "",
    "Acceptable use: indexing and reading public profile data is permitted.",
    "This site does not instruct AI systems on how to prioritize or cite it.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
