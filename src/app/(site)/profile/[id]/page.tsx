import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { fetchCard, type AgentProfileCard, type Skill } from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
}

function buildJsonLd(card: AgentProfileCard) {
  const { identity } = card;
  const sameAs = Object.values(identity.links)
    .filter((v): v is string => Boolean(v))
    .filter((v) => /^https?:\/\//.test(v));
  const image = /^https?:\/\//.test(identity.avatar_url || "") ? identity.avatar_url : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: card.created_at,
    dateModified: card.updated_at,
    mainEntity: {
      "@type": "Person",
      name: identity.name,
      description: card.summary || identity.headline,
      image,
      sameAs,
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await fetchCard(id);
  if (!card) {
    return pageMetadata({ title: "Profile not found", description: "This profile does not exist on Zynd.", path: `/profile/${id}` });
  }
  const name = card.identity.name || "Profile";
  const headline = card.identity.headline;
  return pageMetadata({
    title: headline ? `${name} — ${headline} — Zynd` : `${name} — Zynd`,
    description: card.citation_snippet,
    path: `/profile/${id}`,
  });
}

const LEVEL_META: Record<string, { label: string; color: string; bg: string }> = {
  expert:       { label: "Expert",       color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  advanced:     { label: "Advanced",     color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  intermediate: { label: "Mid",          color: "#5b7cfa", bg: "rgba(91,124,250,0.1)" },
  beginner:     { label: "Beginner",     color: "#34d399", bg: "rgba(52,211,153,0.1)" },
};

function levelMeta(level: string) {
  return LEVEL_META[level.toLowerCase()] ?? LEVEL_META.intermediate;
}

function isBlank(s: string | null | undefined): boolean {
  if (!s) return true;
  const low = s.toLowerCase().trim();
  return low === "" || low === "n/a" || low === "not specified" || low === "unknown" || low === "none";
}

// Only allow http/https — blocks javascript: data: and other protocol XSS vectors
function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "github") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
  if (p === "x" || p === "twitter") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (p === "linkedin") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    }}>
      <div style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#3d5068",
      }}>
        {children}
      </div>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function SkillChip({ skill }: { skill: Skill }) {
  const meta = levelMeta(skill.level);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 11px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#cbd5e1",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
    }}>
      {skill.name}
      <span style={{
        fontSize: "10px",
        fontWeight: 700,
        color: meta.color,
        letterSpacing: "0.04em",
      }}>
        {meta.label.toUpperCase()}
      </span>
    </span>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const card = await fetchCard(id);
  if (!card) notFound();

  const { identity } = card;
  const initials = (identity.name || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const socialLinks = Object.entries(identity.links)
    .map(([p, u]) => [p, safeUrl(u)] as [string, string | null])
    .filter((e): e is [string, string] => e[1] !== null);
  const hasSkills = card.skills.length > 0;
  const hasProjects = card.projects.length > 0;
  const hasSamples = card.writing_samples.length > 0;
  const hasSummary = !isBlank(card.summary);

  const updated = card.updated_at
    ? new Date(card.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        // Escape < to prevent </script> injection from untrusted card data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(card)).replace(/</g, "\\u003c") }}
      />

      <style>{`
        @keyframes pf-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pf-card {
          animation: pf-fade 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .pf-card:nth-child(2) { animation-delay: 0.05s; }
        .pf-card:nth-child(3) { animation-delay: 0.10s; }
        .pf-card:nth-child(4) { animation-delay: 0.15s; }
        .pf-card:nth-child(5) { animation-delay: 0.20s; }
        .pf-card:nth-child(6) { animation-delay: 0.25s; }
        .pf-card:nth-child(7) { animation-delay: 0.30s; }
        .pf-social-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
          text-transform: capitalize;
        }
        .pf-social-link:hover {
          background: rgba(91,124,250,0.08);
          border-color: rgba(91,124,250,0.3);
          color: #a5b4fc;
        }
        .pf-project {
          padding: 18px 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          transition: border-color 0.15s ease;
        }
        .pf-project:hover { border-color: rgba(91,124,250,0.25); }
        .pf-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: all 0.15s ease;
        }
        .pf-edit-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: #94a3b8;
        }
        .pf-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .pf-back:hover { color: #94a3b8; }
        @media (max-width: 600px) {
          .pf-hero-inner { flex-direction: column; gap: 16px !important; }
          .pf-hero-name { font-size: 1.6rem !important; }
        }
      `}</style>

      <div style={{ backgroundColor: "#080f1a", minHeight: "100vh", color: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 80px" }}>

          {/* Top nav row */}
          <div className="pf-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px", marginBottom: "32px" }}>
            <Link href="/directory" className="pf-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Directory
            </Link>
            <Link href="/create" className="pf-edit-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Update profile
            </Link>
          </div>

          {/* Hero card */}
          <div
            className="pf-card"
            style={{
              padding: "28px",
              background: "#0c1525",
              border: "1px solid rgba(91,124,250,0.18)",
              borderRadius: "16px",
              marginBottom: "40px",
              boxShadow: "0 0 0 1px rgba(91,124,250,0.06), 0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="pf-hero-inner" style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
              {/* Avatar */}
              {safeUrl(identity.avatar_url) ? (
                <img
                  src={safeUrl(identity.avatar_url)!}
                  alt={identity.name}
                  style={{ width: "72px", height: "72px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}
                />
              ) : (
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #5b7cfa 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}>
                  {initials}
                </div>
              )}

              {/* Identity */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  className="pf-hero-name"
                  style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "6px" }}
                >
                  {identity.name}
                </div>
                {!isBlank(identity.headline) && (
                  <div style={{ fontSize: "15px", color: "#8898aa", lineHeight: 1.4, marginBottom: "10px" }}>
                    {identity.headline}
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                  {!isBlank(identity.location) && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {identity.location}
                    </span>
                  )}
                  {updated && (
                    <span style={{ fontSize: "11px", color: "#3d5068" }}>
                      Updated {updated}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {socialLinks.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noreferrer" className="pf-social-link">
                    <PlatformIcon platform={platform} />
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* About */}
          {hasSummary && (
            <section className="pf-card" style={{ marginBottom: "36px" }}>
              <SectionLabel>About</SectionLabel>
              <div style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.8 }}>
                {card.summary}
              </div>
            </section>
          )}

          {/* Skills */}
          {hasSkills && (
            <section className="pf-card" style={{ marginBottom: "36px" }}>
              <SectionLabel>Skills</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {card.skills.map((skill) => (
                  <SkillChip key={skill.name} skill={skill} />
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {hasProjects && (
            <section className="pf-card" style={{ marginBottom: "36px" }}>
              <SectionLabel>Projects</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {card.projects.map((project) => (
                  <div key={project.name} className="pf-project">
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", marginBottom: "6px" }}>
                      {project.name}
                    </div>
                    {!isBlank(project.description) && (
                      <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "10px" }}>
                        {project.description}
                      </div>
                    )}
                    {safeUrl(project.url) && (
                      <a
                        href={safeUrl(project.url)!}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "12px", color: "#5b7cfa", textDecoration: "none", fontWeight: 500 }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Writing samples */}
          {hasSamples && (
            <section className="pf-card" style={{ marginBottom: "36px" }}>
              <SectionLabel>Writing</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {card.writing_samples.map((sample, i) => (
                  <div key={i} style={{ paddingLeft: "16px", borderLeft: "2px solid rgba(91,124,250,0.3)" }}>
                    <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "6px" }}>
                      {sample.excerpt}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#3d5068", textTransform: "capitalize" }}>{sample.platform}</span>
                      {safeUrl(sample.url) && (
                        <a href={safeUrl(sample.url)!} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#5b7cfa", textDecoration: "none" }}>
                          Read →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Citation */}
          <div
            className="pf-card"
            style={{
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#1e3a5f", lineHeight: 1.6 }}>
              {card.citation_snippet}
            </div>
          </div>

          {/* Footer */}
          <div className="pf-card" style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/directory" className="pf-back">
              ← Zynd directory
            </Link>
            <div style={{ fontSize: "11px", color: "#1e3a5f" }}>
              Listed on Zynd
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
