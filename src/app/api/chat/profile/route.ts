import { NextRequest, NextResponse } from "next/server";
import { fetchCardByHandle } from "@/lib/cards";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_KEY = process.env.CLOUDFLARE_AI_KEY;
// Fastest capable chat model on Workers AI
const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function buildSystemPrompt(card: Awaited<ReturnType<typeof fetchCardByHandle>>): string {
  if (!card) return "You are a helpful assistant.";
  const id = card.identity;
  const skills = card.skills.slice(0, 10).map((s) => s.name).join(", ");
  const projects = card.projects
    .slice(0, 4)
    .map((p) => `"${p.name}" — ${p.description}`)
    .join("; ");
  const posts = card.writing_samples
    .slice(0, 3)
    .map((w) => w.excerpt)
    .join(" | ");
  const workingOn = card.working_on?.slice(0, 3).join(", ") ?? "";
  const canHelp = card.can_help_with?.slice(0, 3).join(", ") ?? "";
  const topics = card.love_talking_about?.slice(0, 3).join(", ") ?? "";

  return `You're a witty, sharp assistant embedded on ${id.name}'s profile page. \
People visiting this page are curious about ${id.name} — maybe they want to collaborate, hire them, or just learn more. \
Your job is to make that feel like a real conversation, not a Wikipedia lookup.

Facts about ${id.name}:
- Headline: ${id.headline}
- Location: ${id.location || "not shared"}
- Summary: ${card.summary || "not available"}
${skills ? `- Skills: ${skills}` : ""}
${workingOn ? `- Currently working on: ${workingOn}` : ""}
${canHelp ? `- Can help with: ${canHelp}` : ""}
${topics ? `- Loves talking about: ${topics}` : ""}
${projects ? `- Projects: ${projects}` : ""}
${posts ? `- Things they've written: ${posts}` : ""}

Rules:
- Keep answers SHORT — 2 sentences max unless they explicitly ask for more detail.
- Sound like you actually know this person, not like you're reading their LinkedIn bio.
- If something is genuinely unknown, say "I don't have that info, but you could reach out directly."
- Never say "As an AI" or anything that sounds robotic.
- If someone asks something personal or off-topic, redirect with a light touch.
- End with a follow-up question or a nudge when it feels natural.`;
}

export async function POST(req: NextRequest) {
  try {
    const { handle, messages } = await req.json();

    if (!handle || !Array.isArray(messages)) {
      return NextResponse.json({ error: "handle and messages required" }, { status: 400 });
    }

    if (!CF_ACCOUNT_ID || !CF_API_KEY) {
      return new Response("Chatbot not configured.", { status: 503 });
    }

    const card = await fetchCardByHandle(handle);
    const systemPrompt = buildSystemPrompt(card);

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: true,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 300,
        }),
      },
    );

    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => "unknown");
      return NextResponse.json({ error: `CF AI error: ${err}` }, { status: 502 });
    }

    // Cloudflare Workers AI streams SSE in the same format as OpenAI — proxy directly.
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
