import { fetchCardByHandle, cardCanonicalUrl } from "@/lib/cards";

export const revalidate = 60;

interface Params {
  params: Promise<{ handle: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { handle } = await params;
  const card = await fetchCardByHandle(handle);

  if (!card) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { identity } = card;
  const canonical = cardCanonicalUrl(card);

  const sameAs = Object.values(identity.links)
    .filter((v): v is string => Boolean(v))
    .filter((v) => /^https?:\/\//.test(v));

  const image = /^https?:\/\//.test(identity.avatar_url || "") ? identity.avatar_url : undefined;

  const entity = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": canonical,
    name: identity.name,
    url: canonical,
    description: card.summary || identity.headline,
    ...(image ? { image } : {}),
    ...(identity.headline ? { jobTitle: identity.headline } : {}),
    ...(identity.location ? { address: { "@type": "PostalAddress", addressLocality: identity.location } } : {}),
    sameAs,
    knowsAbout: card.skills.map((s) => s.name),
    ...(card.skills.length
      ? {
          hasCredential: card.skills.map((s) => ({
            "@type": "EducationalOccupationalCredential",
            name: s.name,
            competencyRequired: s.level,
          })),
        }
      : {}),
    ...(card.projects.length
      ? {
          worksFor: card.projects
            .filter((p) => /^https?:\/\//.test(p.url || ""))
            .map((p) => ({
              "@type": "Project",
              name: p.name,
              description: p.description,
              url: p.url,
            })),
        }
      : {}),
    // Zynd-specific extensions
    "zynd:handle": handle,
    "zynd:card_id": card.id,
    "zynd:citation": card.citation_snippet,
    "zynd:facts": card.searchable_facts,
    "zynd:verified_at": card.updated_at,
  };

  return new Response(JSON.stringify(entity, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
