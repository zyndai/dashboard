"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { GridTripod } from "./ui/GridTripod";

const LINKS = [
  { label: "Registry", href: "/registry" },
  { label: "Docs", href: "https://docs.zynd.ai" },
  { label: "Blog", href: "/blogs" },
  { label: "Litepaper", href: "/docs/litepaper.pdf" },
] as const;

const RESOURCES = [
  { label: "Documentation", href: "https://docs.zynd.ai" },
  { label: "GitHub", href: "https://github.com/ZyndAI" },
  { label: "npm", href: "https://www.npmjs.com/package/zyndai-mcp-server" },
  { label: "Litepaper", href: "/docs/litepaper.pdf" },
] as const;

function GitHubIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor"/>
    </svg>
  );
}

function XTwitterIcon(): React.ReactElement {
  return (
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.80314 5.92804L13.9029 0H12.6944L8.2663 5.14724L4.72958 0H0.650391L5.9986 7.78354L0.650391 14H1.85894L6.53514 8.56434L10.2702 14H14.3494L8.80284 5.92804H8.80314ZM7.14787 7.85211L6.60598 7.07705L2.29439 0.909771H4.15065L7.63015 5.88696L8.17204 6.66202L12.695 13.1316H10.8387L7.14787 7.85241V7.85211Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon(): React.ReactElement {
  return (
    <svg width="16" height="12" viewBox="0 0 24 18" fill="currentColor">
      <path d="M23.498 3.174a3.01 3.01 0 00-2.12-2.134C19.505.5 12 .5 12 .5S4.495.5 2.622 1.04A3.01 3.01 0 00.502 3.174C0 5.065 0 9 0 9s0 3.935.502 5.826a3.01 3.01 0 002.12 2.134C4.495 17.5 12 17.5 12 17.5s7.505 0 9.378-.54a3.01 3.01 0 002.12-2.134C24 12.935 24 9 24 9s0-3.935-.502-5.826zM9.545 12.682V5.318L15.818 9l-6.273 3.682z" />
    </svg>
  );
}

function FooterBoxLines(): React.ReactElement {
  return (
    <>
      <div className="middle-hero-second-line" />
      <div className="middle-hero-right-second-line" />
      <GridTripod corner="right-bottom-corner" />
      <GridTripod corner="left-bottom-corner" />
      <div className="grid-box-under-lines" />
    </>
  );
}

function Newsletter(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="footer-newsletter">
      <div className="text-tiny caps _40-op">Stay Updated</div>
      <p className="footer-newsletter-desc">
        Subscribe for the latest updates on ZyndAI.
      </p>
      {submitted ? (
        <p className="footer-newsletter-thanks">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="footer-newsletter-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="footer-newsletter-input"
          />
          <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe" disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      )}
      {error && <p className="footer-newsletter-thanks" style={{ color: "#ff4444" }}>{error}</p>}
    </div>
  );
}

export function Footer(): React.ReactElement {
  return (
    <footer className="footer">
      <div className="padding-global">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-box is-hide-mb">
              <span style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Chakra Petch', sans-serif", display: "block", width: "100%", textAlign: "center" }}>ZYND<span style={{ color: "var(--color-accent)" }}>AI</span></span>
              <div className="middle-hero-second-line" />
              <div className="middle-hero-right-second-line" />
              <GridTripod corner="right-bottom-corner" />
              <GridTripod corner="left-bottom-corner" />
              <div className="grid-box-under-lines" />
            </div>

            <div className="footer-box">
              <div className="text-tiny caps _40-op">Links</div>
              <div className="footer-links-list">
                {LINKS.map((link) =>
                  link.href.startsWith("http") || link.href.endsWith(".pdf") ? (
                    <a key={link.label} href={link.href} className="footer-text" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="footer-text">
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <FooterBoxLines />
            </div>

            <div className="footer-box">
              <div className="text-tiny caps _40-op">Resources</div>
              <div className="footer-links-list">
                {RESOURCES.map((link) =>
                  link.href.startsWith("http") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="footer-text"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer-text"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <FooterBoxLines />
            </div>

            <div className="footer-box">
              <Newsletter />
              <div className="main-hero-bottom-line" style={{ margin: "1.5rem 0" }} />
              <div className="text-tiny caps _40-op">Socials</div>
              <div className="footer-social-links-wrap">
                <a
                  href="https://x.com/ZyndAI"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="footer-link-icon">
                    <XTwitterIcon />
                  </div>
                  <div className="social-overlay" />
                </a>
                <a
                  href="https://www.linkedin.com/company/zyndai/posts/?feedView=all"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="footer-link-icon">
                    <LinkedInIcon />
                  </div>
                  <div className="social-overlay" />
                </a>
                <a
                  href="https://www.youtube.com/@ZyndAINetwork"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="footer-link-icon">
                    <YouTubeIcon />
                  </div>
                  <div className="social-overlay" />
                </a>
                <a
                  href="https://github.com/ZyndAI"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="footer-link-icon">
                    <GitHubIcon />
                  </div>
                  <div className="social-overlay" />
                </a>
              </div>
              <FooterBoxLines />
            </div>
          </div>

          <div className="footer-legal-wrap">
            <div className="footer-legal-group">
              Copyright &copy; 2026. All Rights Reserved ZyndAI
            </div>
            <div className="footer-legal-group">
              <Link href="/privacy-policy" className="footer-legal-link">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="footer-legal-link">
                Terms of Service
              </Link>
            </div>
            <div className="middle-hero-second-line" />
            <div className="middle-hero-right-second-line" />
          </div>
        </div>
      </div>
    </footer>
  );
}
