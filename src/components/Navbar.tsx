"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar(): React.ReactElement {
  const { authenticated, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <div className="navbar-w">
      <style>{`
        .zynd-mobile-toggle {
          display: none;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }
        .zynd-mobile-toggle:hover { border-color: rgba(255,255,255,0.2); }
        @media (max-width: 991px) {
          .zynd-mobile-toggle { display: inline-flex; }
        }
        .zynd-mobile-sheet {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: rgba(8, 11, 19, 0.96);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          padding: 24px 24px 40px;
          gap: 12px;
          overflow-y: auto;
        }
        .zynd-mobile-sheet__header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 28px;
        }
        .zynd-mobile-sheet__close {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
        }
        .zynd-mobile-sheet a {
          color: #fff;
          font-size: 22px;
          font-weight: 600;
          padding: 16px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .zynd-mobile-sheet a:hover { color: #6366F1; }
        .zynd-mobile-sheet button {
          margin-top: 18px;
          background: #182644;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
        }

        .zynd-nav-cta {
          color: #fff !important;
          cursor: pointer !important;
          border-radius: 16px !important;
          padding: 9px 22px !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #182644 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          transition: all 0.2s ease !important;
          white-space: nowrap !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .zynd-nav-cta:hover {
          background: #1e3058 !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
      <div
        data-w-id="2ded8559-79a1-9264-5cb7-a4c9eee1ba3b"
        data-animation="default"
        data-collapse="medium"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        role="banner"
        className="navbar w-nav"
      >
        <div className="page-padd">
          <div className="page-container">
            <div className="navbar-vert">
              <div className="navbar-cont-w">
                <div className="navbar-cont-c">
                  <div className="navbar-brand-w">
                    <a
                      href="/"
                      aria-current="page"
                      className="navbar-brand w-nav-brand w--current"
                    >
                      <div className="navbar-brand-img-b" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src="/assets/zynd-logo.png"
                          loading="lazy"
                          alt="ZyndAI"
                          style={{ width: "40px", height: "40px", filter: "brightness(0) invert(1)" }}
                        />
                        <span style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          letterSpacing: "0.005em",
                          textTransform: "uppercase" as const,
                          color: "#fff",
                          fontFamily: "'Chakra Petch', 'Space Grotesk', sans-serif",
                        }}>ZYND<span style={{ color: "#6366F1" }}>AI</span></span>
                      </div>
                    </a>
                  </div>
                  <nav role="navigation" className="navbar-menu w-nav-menu">
                    <div className="navbar-menu-c">
                      <div className="navbar-menu-b">
                        <div className="navbar-link-b">
                          <Link
                            href="/registry"
                            className="navbar-link w-nav-link"
                          >
                            Registry
                          </Link>
                          <a
                            href="https://docs.zynd.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link w-nav-link"
                          >
                            Docs
                          </a>
                          <Link
                            href="/blogs"
                            className="navbar-link w-nav-link"
                          >
                            Blogs
                          </Link>
                          <Link
                            href="/team"
                            className="navbar-link w-nav-link"
                          >
                            Team
                          </Link>
                          {authenticated && (
                            <Link
                              href="/dashboard"
                              className="navbar-link w-nav-link"
                              style={{ color: "#6366F1", fontWeight: 600 }}
                            >
                              Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="navbar-button-w">
                          <div className="navbar-button-c">
                            <div className="navbar-button-b">
                              {authenticated ? (
                                <button
                                  onClick={logout}
                                  className="zynd-nav-cta"
                                >
                                  Sign Out
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={login}
                                  className="zynd-nav-cta"
                                >
                                  Sign In
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </nav>
                  <button
                    type="button"
                    className="zynd-mobile-toggle"
                    aria-label="Open menu"
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div
          className="zynd-mobile-sheet"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ display: "contents" }}>
            <div className="zynd-mobile-sheet__header">
              <button
                type="button"
                className="zynd-mobile-sheet__close"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <Link href="/registry" onClick={() => setMobileOpen(false)}>Registry</Link>
            <a href="https://docs.zynd.ai" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>Docs</a>
            <Link href="/blogs" onClick={() => setMobileOpen(false)}>Blogs</Link>
            <Link href="/team" onClick={() => setMobileOpen(false)}>Team</Link>
            {authenticated && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: "#6366F1" }}>
                Dashboard
              </Link>
            )}
            {authenticated ? (
              <button type="button" onClick={() => { setMobileOpen(false); logout(); }}>Sign Out</button>
            ) : (
              <button type="button" onClick={() => { setMobileOpen(false); login(); }}>Sign In</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
