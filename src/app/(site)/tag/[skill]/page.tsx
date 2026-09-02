import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { listCards, cardCanonicalUrl, type AgentProfileCard } from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ skill: string }>;
}

function decodeSkill(raw: string): string {
  return decodeURIComponent(raw).replace(/-/g, " ").toLowerCase();
}

function encodeSkill(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

function buildJsonLd(skill: string, cards: AgentProfileCard[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${skill} — Zynd People Directory`,
    description: `People on Zynd with ${skill} skills`,
    url: `https://www.zynd.ai/tag/${encodeSkill(skill)}`,
    mainEntity: {
      "@type": "ItemList",
      name: `${skill} practitioners on Zynd`,
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

export async function generateStaticParams() {
  const cards = await listCards();
  const skills = new Set<string>();
  for (const c of cards) {
    for (const s of c.skills) {
      if (s.name) skills.add(encodeSkill(s.name));
    }
  }
  return Array.from(skills).map((skill) => ({ skill }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { skill: rawSkill } = await params;
  const skill = decodeSkill(rawSkill);
  return pageMetadata({
    title: `${skill} — People on Zynd`,
    description: `Browse people on Zynd with ${skill} skills and expertise. AI-verified profiles with evidence.`,
    path: `/tag/${rawSkill}`,
  });
}

const LEVEL_META: Record<string, { label: string; color: string; bg: string }> = {
  expert:       { label: "Expert",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  advanced:     { label: "Advanced",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  intermediate: { label: "Mid",       color: "#5b7cfa", bg: "rgba(91,124,250,0.12)" },
  beginner:     { label: "Beginner",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
};

function levelMeta(level: string) {
  return LEVEL_META[level.toLowerCase()] ?? LEVEL_META.intermediate;
}

export default async function TagPage({ params }: PageProps) {
  const { skill: rawSkill } = await params;
  const skill = decodeSkill(rawSkill);

  const allCards = await listCards();
  const cards = allCards.filter((c) =>
    c.skills.some((s) => s.name.toLowerCase() === skill)
  );

  if (cards.length === 0) notFound();

  // For each matched card, find the specific skill entry (for level display)
  function matchedSkill(card: AgentProfileCard) {
    return card.skills.find((s) => s.name.toLowerCase() === skill);
  }

  const BASE = "https://www.zynd.ai";

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(skill, cards)).replace(/</g, "\\u003c"),
        }}
      />

      <style>{`
        @keyframes tg-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tg-card { animation: tg-fade 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .tg-card:nth-child(2) { animation-delay: 0.04s; }
        .tg-card:nth-child(3) { animation-delay: 0.08s; }
        .tg-card:nth-child(4) { animation-delay: 0.12s; }
        .tg-card:nth-child(5) { animation-delay: 0.16s; }
        .tg-card:hover { border-color: rgba(91,124,250,0.3) !important; transform: translateY(-2px); }
        .tg-card { transition: border-color 0.2s, transform 0.2s; }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "#07090f",
        color: "#e2e8f0",
        fontFamily: "Inter, -apple-system, sans-serif",
        paddingTop: "80px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", fontSize: "13px", color: "#64748b" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Zynd</Link>
            <span>/</span>
            <Link href="/directory" style={{ color: "#64748b", textDecoration: "none" }}>Directory</Link>
            <span>/</span>
            <span style={{ color: "#94a3b8" }}>{skill}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                padding: "6px 14px",
                background: "rgba(91,124,250,0.12)",
                border: "1px solid rgba(91,124,250,0.25)",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#5b7cfa",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>skill</div>
            </div>
            <div style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f1f5f9",
              marginBottom: "8px",
            }}>{skill}</div>
            <div style={{ fontSize: "15px", color: "#64748b" }}>
              {cards.length} {cards.length === 1 ? "person" : "people"} on Zynd with verified {skill} expertise
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cards.map((card, idx) => {
              const s = matchedSkill(card);
              const meta = s ? levelMeta(s.level) : LEVEL_META.intermediate;
              const initials = (card.identity.name || "?")
                .split(/\s+/)
                .map((p) => p[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const otherSkillCount = card.skills.length - 1;

              return (
                <Link
                  key={card.id}
                  href={cardCanonicalUrl(card)}
                  className="tg-card"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    {/* Avatar */}
                    {card.identity.avatar_url && /^https?:\/\//.test(card.identity.avatar_url) ? (
                      <img
                        src={card.identity.avatar_url}
                        alt={card.identity.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg, #5b7cfa22, #a78bfa22)",
                        border: "1px solid rgba(91,124,250,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "15px", fontWeight: 700, color: "#a78bfa",
                      }}>{initials}</div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <div style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
                          {card.identity.name}
                        </div>
                        {s && (
                          <span style={{
                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                            color: meta.color, background: meta.bg,
                            padding: "2px 8px", borderRadius: "4px",
                          }}>{meta.label.toUpperCase()}</span>
                        )}
                      </div>
                      {card.identity.headline && (
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                          {card.identity.headline}
                        </div>
                      )}
                      {card.citation_snippet && (
                        <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "10px" }}>
                          {card.citation_snippet}
                        </div>
                      )}
                      {/* Other skills preview */}
                      {card.skills.length > 1 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {card.skills
                            .filter((sk) => sk.name.toLowerCase() !== skill)
                            .slice(0, 4)
                            .map((sk) => (
                              <Link
                                key={sk.name}
                                href={`${BASE}/tag/${encodeSkill(sk.name)}`}
                                style={{
                                  fontSize: "11px", color: "#64748b",
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: "4px", padding: "2px 8px",
                                  textDecoration: "none",
                                }}
                              >{sk.name}</Link>
                            ))}
                          {otherSkillCount > 4 && (
                            <span style={{ fontSize: "11px", color: "#475569", padding: "2px 4px" }}>
                              +{otherSkillCount - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Link href="/directory" style={{ fontSize: "13px", color: "#5b7cfa", textDecoration: "none" }}>
              ← Browse all profiles
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
