"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { formatAddress } from "@/lib/utils";

const NAV_LINKS_BASE = [
  { label: "Registry", href: "/registry" },
  { label: "Docs", href: "https://docs.zynd.ai" },
  { label: "Litepaper", href: "/docs/litepaper.pdf" },
  { label: "Blog", href: "/blogs" },
] as const;

export function Navbar(): React.ReactElement {
  const router = useRouter();
  const burgerRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);
  const slideMenuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { ready, authenticated, registryToken, walletAddress, login: privyLogin } = useAuth();
  const loginIntentRef = useRef(false);

  const handleGetStarted = useCallback(() => {
    if (authenticated && registryToken) {
      router.push("/dashboard");
      return;
    }
    loginIntentRef.current = true;
    privyLogin();
  }, [authenticated, registryToken, router, privyLogin]);

  useEffect(() => {
    if (loginIntentRef.current && authenticated && registryToken) {
      loginIntentRef.current = false;
      router.push("/dashboard");
    }
  }, [authenticated, registryToken, router]);

  const NAV_LINKS = authenticated && registryToken
    ? [{ label: "Dashboard", href: "/dashboard" }, ...NAV_LINKS_BASE]
    : NAV_LINKS_BASE;

  const buttonLabel = !ready
    ? "GET STARTED"
    : authenticated && registryToken
      ? formatAddress(walletAddress || "")
      : "GET STARTED";

  useEffect(() => {
    const burger = burgerRef.current;
    const menuContent = menuContentRef.current;
    const menuLinks = menuLinksRef.current;

    if (!burger || !menuContent || !menuLinks) return;

    const hasExtraLinks = NAV_LINKS.length > 4;
    const desktopWidth = window.innerWidth < 1440
      ? hasExtraLinks ? "62%" : "50%"
      : hasExtraLinks ? "48rem" : "38rem";

    gsap.set(burger, { width: "12.5%" });
    gsap.set(menuContent, { y: 0, display: "flex", flexDirection: "row" });

    const tl = gsap.timeline({ paused: true, reversed: true });

    tl.to(burger, { width: desktopWidth, duration: 0.5, ease: "power2.inOut" })
      .to(menuContent, { y: "-200%", duration: 0.5, ease: "power2.inOut" }, "<")
      .set(menuContent, { display: "none" })
      .set(menuLinks, { display: "flex" })
      .to(menuLinks, { opacity: 1, duration: 0.4, ease: "power4.out" });

    const onEnter = () => tl.play();
    const onLeave = () => tl.reverse(0.5);

    burger.addEventListener("mouseenter", onEnter);
    burger.addEventListener("mouseleave", onLeave);

    return () => {
      burger.removeEventListener("mouseenter", onEnter);
      burger.removeEventListener("mouseleave", onLeave);
      tl.kill();
    };
  }, [NAV_LINKS.length]);

  useEffect(() => {
    const slideMenu = slideMenuRef.current;
    if (!slideMenu) return;

    const isMobile = window.innerWidth <= 479;
    if (mobileOpen) {
      gsap.to(slideMenu, {
        [isMobile ? "y" : "x"]: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(slideMenu, {
        [isMobile ? "y" : "x"]: isMobile ? "-100%" : "100%",
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="padding-global">
        <div className="container">
          <div className="nav-content-wrap">
            <Link href="/" className="nav-logo-link">
              <img
                src="/zynd.png"
                alt="ZyndAI"
                className="nav-logo"
              />
              <span className="nav-logo-text">ZYND<span className="nav-logo-accent">AI</span></span>
            </Link>

            <div className="burger menu" ref={burgerRef}>
              <div className="menu-content-wrap" ref={menuContentRef}>
                <div className="menu-icon-wrap">
                  <img src="/assets/images/burger-icon.svg" alt="Menu" className="menu-icon" />
                </div>
                <div>Menu</div>
              </div>
              <div className="menu-links-wrap" ref={menuLinksRef}>
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      className="link-wrap"
                      key={link.label}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.querySelector(link.href);
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {link.label}
                    </a>
                  ) : link.href.startsWith("http") || link.href.endsWith(".pdf") ? (
                    <a
                      href={link.href}
                      className="link-wrap"
                      key={link.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="link-wrap"
                      key={link.label}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <div className="burger-left-corner" />
              <div className="burger-right-corner" />
            </div>

            <button
              onClick={handleGetStarted}
              disabled={!ready}
              className="nav-cta-link is-hide-mb"
              style={{
                cursor: !ready ? "wait" : "pointer",
              }}
            >
              {buttonLabel}
              <span className="nav-cta-arrow">
                <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
                </svg>
              </span>
            </button>

            <button
              className="mb-burger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <div className="slide-menu" ref={slideMenuRef}>
              <button
                className="slide-menu-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <div className="burger-links-list">
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-regular is-black caps"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        const target = document.querySelector(link.href);
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {link.label}
                    </a>
                  ) : link.href.startsWith("http") || link.href.endsWith(".pdf") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-regular is-black caps"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-regular is-black caps"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
