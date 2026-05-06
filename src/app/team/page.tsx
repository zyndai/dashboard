import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { WebflowInit } from "@/components/WebflowInit";
// import { Footer } from "@/components/Footer";
import { TEAM_MEMBERS, type SocialPlatform } from "@/data/team";

export const metadata: Metadata = {
  title: "Team — The People Behind ZyndAI",
  description:
    "Engineers and operators behind the open network for AI agents. Meet the team building ZyndAI.",
  alternates: {
    canonical: "https://www.zynd.ai/team",
  },
  openGraph: {
    title: "Team — The People Behind ZyndAI",
    description:
      "Engineers and operators behind the open network for AI agents.",
    url: "https://www.zynd.ai/team",
    type: "website",
  },
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  linkedin: "in",
  github: "gh",
  x: "x",
};

const TEAM_PAGE_CSS = `
/* Page-level wrapper bg so the gradient extends behind the navbar AND footer.
   background-attachment: fixed keeps the highlight in the upper viewport
   regardless of scroll position. */
.team-page-w {
  background:
    radial-gradient(ellipse 70% 55% at 50% 28%, rgba(29, 37, 112, 0.40) 0%, transparent 65%),
    radial-gradient(ellipse 90% 70% at 50% 100%, rgba(42, 31, 90, 0.28) 0%, transparent 70%),
    #02060d;
  background-attachment: fixed;
  min-height: 100vh;
}
.team-page {
  position: relative;
  padding: 0 60px 60px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  background: transparent;
}
.team-stage {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}
/* Decorative ring that haloes the headline — positioned to peek above
   the headline like the reference design. Sits behind text + cards via
   DOM order (no z-index battle needed). */
.team-stage::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  height: 520px;
  border-radius: 50%;
  border: 1px solid rgba(139, 158, 255, 0.13);
  pointer-events: none;
}
@media (max-width: 600px) {
  .team-stage::before {
    width: 360px;
    height: 360px;
    top: 30px;
  }
}
@media (max-width: 768px) {
  .team-page { padding: 16px 24px 60px; }
}
/* Defeat the global h1 silver-gradient + capitalize + 86px rules from zynd-vendor.css */
.team-page .team-headline {
  font-family: 'Chakra Petch', sans-serif !important;
  font-weight: 400 !important;
  font-size: clamp(36px, 5vw, 56px) !important;
  line-height: 1.15 !important;
  letter-spacing: -0.02em !important;
  margin: 0 auto 24px !important;
  text-transform: none !important;
  background: none !important;
  background-image: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
  -webkit-text-fill-color: #ffffff !important;
  color: #ffffff !important;
  max-width: 920px;
}
.team-page .team-headline-accent {
  font-family: 'Instrument Serif', serif !important;
  font-style: italic !important;
  font-weight: 400 !important;
  color: #8fa1ff !important;
  -webkit-text-fill-color: #8fa1ff !important;
  background: none !important;
  background-image: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
  display: block;
  margin-top: 8px;
  text-transform: none !important;
}
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 260px);
  gap: 28px 24px;
  justify-content: center;
  perspective: 1600px;
}
@media (max-width: 900px) {
  .team-grid { grid-template-columns: repeat(2, minmax(160px, 200px)); gap: 16px 14px; }
}
@media (max-width: 520px) {
  .team-grid { grid-template-columns: minmax(180px, 220px); }
}
.team-card {
  width: 100%;
  aspect-ratio: 3 / 4.2;
  perspective: 1400px;
  cursor: pointer;
}
.team-card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-style: preserve-3d;
}
.team-card:hover .team-card-flipper,
.team-card:focus-within .team-card-flipper {
  transform: rotateY(180deg) translateY(-8px);
}
.team-card-face {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.team-card-front {
  background:
    radial-gradient(ellipse 100% 60% at 50% 0%, #5168e8 0%, transparent 60%),
    linear-gradient(180deg, #2a3286 0%, #181a4a 100%);
}
.team-card-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 20%;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 55%, transparent 95%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 55%, transparent 95%);
}
.team-card-front .team-card-meta {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  text-align: left;
  z-index: 2;
}
.team-card-back {
  transform: rotateY(180deg);
  background:
    radial-gradient(ellipse 100% 80% at 50% 0%, #5d70eb 0%, transparent 70%),
    linear-gradient(180deg, #3340a0 0%, #1d2370 100%);
  padding: 18px;
  text-align: left;
  display: flex;
  flex-direction: column;
}
.team-card-back::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}
.team-card-name {
  position: relative;
  z-index: 1;
  font-family: 'Chakra Petch', sans-serif !important;
  font-size: 18px !important;
  font-weight: 500 !important;
  letter-spacing: -0.01em !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  background: none !important;
  background-image: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
  line-height: 1.15 !important;
  margin: 0 !important;
  text-transform: none !important;
}
.team-card-back .team-card-name { font-size: 22px !important; }
.team-card-role {
  position: relative;
  z-index: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(143, 161, 255, 0.85);
  margin: 6px 0 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.team-card-bio {
  position: relative;
  z-index: 1;
  margin: auto 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}
.team-card-links {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  display: flex;
  gap: 10px;
}
.team-card-links a {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  text-decoration: none;
  transition: background 0.15s ease;
}
.team-card-links a:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
`;

export default function TeamPage(): React.ReactElement {
  return (
    <div
      className="page-w team-page-w"
      data-wf-page="644340149db6917510d9c0b1"
      data-wf-site="644340149db691bd8cd9c0b0"
    >
      <div className="styles w-embed">
        <style>{TEAM_PAGE_CSS}</style>
      </div>
      <WebflowInit />
      <Navbar />
      <div className="page-cont-w">
        <main className="team-page">
          <div className="team-stage">
          <h1 className="team-headline">
            Engineers and operators behind
            <span className="team-headline-accent">
              the open network for AI agents.
            </span>
          </h1>

          <div className="team-grid">
            {TEAM_MEMBERS.map((member) => (
              <article key={member.slug} className="team-card" tabIndex={0}>
                <div className="team-card-flipper">
                  <div className="team-card-face team-card-front">
                    <div
                      className="team-card-photo"
                      style={{ backgroundImage: `url("${member.photo}")` }}
                      role="img"
                      aria-label={`Photo of ${member.name}`}
                    />
                    <div className="team-card-meta">
                      <h2 className="team-card-name">{member.name}</h2>
                      <p className="team-card-role">{member.role}</p>
                    </div>
                  </div>
                  <div className="team-card-face team-card-back">
                    <h2 className="team-card-name">{member.name}</h2>
                    <p className="team-card-role">{member.role}</p>
                    <p className="team-card-bio">{member.bio}</p>
                    {member.socials.length > 0 && (
                      <div className="team-card-links">
                        {member.socials.map((social) => (
                          <a
                            key={social.platform}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on ${social.platform}`}
                          >
                            {SOCIAL_LABELS[social.platform]}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
