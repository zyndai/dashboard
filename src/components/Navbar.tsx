"use client";

import Link from "next/link";
import { LottieAnimation } from "./LottieAnimation";
import { useAuth } from "@/hooks/useAuth";

export function Navbar(): React.ReactElement {
  const { authenticated, login, logout } = useAuth();
  return (
    <div className="navbar-w">
      <style>{`
        .zynd-nav-cta {
          color: #fff !important;
          cursor: pointer !important;
          border-radius: 16px !important;
          padding: 11px 24px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
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
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                          textTransform: "uppercase" as const,
                          color: "#fff",
                          fontFamily: "'Space Grotesk', sans-serif",
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
                  <div className="navbar-hamb-menu w-nav-button">
                    <div className="menu_container">
                      <img
                        src="/assets/images/hamburger-menu.svg"
                        loading="lazy"
                        alt=""
                        className="hamburger-menu_wrap"
                      />
                      <LottieAnimation
                        src="/assets/lottie/hamburger-menu.json"
                        loop={false}
                        autoplay={false}
                        className="mobile-menu_lottie"
                        dataWId="80f7cef5-2b81-674e-8a87-6e8bbf2e3d1e"
                        dataIsIx2Target="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
