import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { listCards, cardCanonicalUrl } from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "People Directory — Zynd",
  description:
    "Browse every person profile on Zynd, the AI agent discovery network.",
  path: "/directory",
});

function encodeSkill(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

function buildJsonLd(cards: Awaited<ReturnType<typeof listCards>>) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "People Directory — Zynd",
    description: "Browse every person profile on Zynd, the AI agent discovery network.",
    url: "https://www.zynd.ai/directory",
    mainEntity: {
      "@type": "ItemList",
      name: "Zynd People Directory",
      numberOfItems: cards.length,
      itemListElement: cards.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: c.identity.name,
          url: cardCanonicalUrl(c),
          description: c.citation_snippet || c.summary,
        },
      })),
    },
  };
}

export default async function DirectoryPage() {
  const cards = await listCards();

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(cards)).replace(/</g, "\\u003c"),
        }}
      />
      <article className="text-white selection:bg-[#5b7cfa]/30 antialiased font-sans pb-32">
        <div className="mx-auto w-full max-w-[1000px] px-6 pt-12">
          <header className="mb-12">
            {/* div not h1 — globals.css sets h1 { font-size: 6rem } */}
            <div className="text-4xl font-bold text-white md:text-5xl">
              People on Zynd
            </div>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              Profiles on Zynd, the AI agent discovery network. Each entry is one
              person, one page — skills and work synthesized from public GitHub
              activity and résumés.
            </p>
          </header>

          {cards.length === 0 ? (
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-8 text-zinc-400">
              No profiles published yet.{" "}
              <Link href="/create" className="text-[#5b7cfa] hover:text-white">
                Be the first — create your profile.
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link
                  key={card.id}
                  href={cardCanonicalUrl(card)}
                  className="group flex flex-col rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-[#5b7cfa]/40"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {card.identity.avatar_url && /^https?:\/\//.test(card.identity.avatar_url) ? (
                      <img
                        src={card.identity.avatar_url}
                        alt={card.identity.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-[#5b7cfa]/20 to-[#a78bfa]/20 border border-[#5b7cfa]/20 flex items-center justify-center text-[#a78bfa] text-xs font-bold">
                        {(card.identity.name || "?")
                          .split(/\s+/)
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white group-hover:text-[#a5b4fc] truncate">
                        {card.identity.name}
                      </div>
                      {card.identity.location && (
                        <div className="text-xs text-zinc-500 truncate">{card.identity.location}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-zinc-400 mb-4 line-clamp-2 flex-1">
                    {card.identity.headline}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {card.skills.slice(0, 4).map((s) => (
                      <Link
                        key={s.name}
                        href={`/tag/${encodeSkill(s.name)}`}

                        className="inline-flex rounded-full border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2.5 py-0.5 text-xs text-[#a5b4fc] hover:bg-[#5b7cfa]/20 transition-colors"
                      >
                        {s.name}
                      </Link>
                    ))}
                    {card.skills.length > 4 && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs text-zinc-600">
                        +{card.skills.length - 4}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center text-sm text-zinc-600">
            {cards.length} {cards.length === 1 ? "profile" : "profiles"} published
          </div>
        </div>
      </article>
    </>
  );
}
