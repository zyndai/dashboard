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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
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
      <style>{`
        .dir-page {
          position: relative;
          min-height: 100vh;
          background: #d5dde8;
          background-image: radial-gradient(rgba(15,23,42,0.045) 1px, transparent 0);
          background-size: 22px 22px;
          color: #0b1220;
          font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
          padding: 48px 24px 96px;
        }
        .dir-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(560px 560px at 88% -8%, rgba(129,140,248,0.38), transparent 60%),
            radial-gradient(480px 480px at 6% 92%, rgba(196,181,253,0.32), transparent 62%);
        }
        .dir-wrap { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; }
        .dir-kicker {
          font-family: ui-monospace, "Space Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #4f46e5;
          margin-bottom: 12px;
        }
        .dir-title {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #0b1220;
          margin: 0;
        }
        .dir-lede {
          margin: 16px 0 0;
          max-width: 640px;
          font-size: 17px;
          line-height: 1.6;
          color: #1e293b;
        }
        .dir-meta {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .dir-pill {
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid #94a3b8;
          color: #0f172a;
        }
        .dir-cta {
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          background: #4f46e5;
          color: #fff !important;
          text-decoration: none;
        }
        .dir-empty {
          margin-top: 40px;
          background: #fff;
          border: 1px solid #94a3b8;
          border-radius: 24px;
          padding: 32px;
          color: #334155;
        }
        .dir-grid {
          margin-top: 40px;
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .dir-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .dir-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .dir-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 220px;
          background: #fff;
          border: 1px solid #94a3b8;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 22px 40px -28px rgba(15,23,42,0.4);
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
        }
        .dir-card:hover {
          transform: translateY(-2px);
          border-color: #4f46e5;
          box-shadow: 0 28px 48px -24px rgba(79,70,229,0.35);
        }
        .dir-card a.dir-cover {
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: 24px;
        }
        .dir-head { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
        .dir-av {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
        }
        .dir-av-fb {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #5c56f6, #4f46e5);
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
        }
        .dir-name {
          font-size: 16px;
          font-weight: 800;
          color: #0b1220;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .dir-loc {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          color: #475569;
          margin-top: 2px;
        }
        .dir-headline {
          font-size: 14px;
          line-height: 1.5;
          color: #334155;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .dir-chips { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
        .dir-chip {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          background: #eef2ff;
          color: #312e81;
          border: 1px solid #c7d2fe;
          text-decoration: none;
        }
        .dir-chip:hover { background: #4f46e5; color: #fff; border-color: #4f46e5; }
        .dir-more { font-family: ui-monospace, monospace; font-size: 11px; color: #64748b; padding: 4px 6px; }
        .dir-foot {
          margin-top: 48px;
          text-align: center;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
        }
      `}</style>
      <article className="dir-page">
        <div className="dir-wrap">
          <header>
            <div className="dir-kicker">{"// PEOPLE DIRECTORY"}</div>
            <h1 className="dir-title">People on Zynd</h1>
            <p className="dir-lede">
              Profiles on Zynd, the AI agent discovery network. Each entry is one
              person, one page — skills and work synthesized from public GitHub
              activity and résumés.
            </p>
            <div className="dir-meta">
              <span className="dir-pill">{cards.length} {cards.length === 1 ? "profile" : "profiles"} published</span>
              <Link href="/create" className="dir-cta">Create your Living Profile →</Link>
            </div>
          </header>

          {cards.length === 0 ? (
            <div className="dir-empty">
              No profiles published yet.{" "}
              <Link href="/create" style={{ color: "#4f46e5", fontWeight: 700 }}>
                Be the first — create your profile.
              </Link>
            </div>
          ) : (
            <div className="dir-grid">
              {cards.map((card) => (
                <div key={card.id} className="dir-card">
                  <Link
                    href={cardCanonicalUrl(card)}
                    className="dir-cover"
                    aria-label={`View ${card.identity.name}'s profile`}
                  />
                  <div className="dir-head">
                    {card.identity.avatar_url && /^https?:\/\//.test(card.identity.avatar_url) ? (
                      <img
                        src={card.identity.avatar_url}
                        alt={card.identity.name}
                        width={44}
                        height={44}
                        className="dir-av"
                      />
                    ) : (
                      <div className="dir-av-fb">{initials(card.identity.name)}</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div className="dir-name">{card.identity.name}</div>
                      {card.identity.location ? (
                        <div className="dir-loc">{card.identity.location}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="dir-headline">{card.identity.headline}</div>
                  <div className="dir-chips">
                    {card.skills.slice(0, 4).map((s) => (
                      <Link key={s.name} href={`/tag/${encodeSkill(s.name)}`} className="dir-chip">
                        {s.name}
                      </Link>
                    ))}
                    {card.skills.length > 4 ? (
                      <span className="dir-more">+{card.skills.length - 4}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dir-foot">
            {cards.length} {cards.length === 1 ? "profile" : "profiles"} · living identities
          </div>
        </div>
      </article>
    </>
  );
}
