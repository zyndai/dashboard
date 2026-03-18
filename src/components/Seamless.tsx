"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { AccentCorners } from "./ui/AccentCorners";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_LOTTIE_URL = "/assets/json/AgentYard-Asset-Exported.json?v=6";


// 1x1 fully transparent PNG
const CLEAR_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function stripHexAssets(json: Record<string, unknown>): Record<string, unknown> {
  const assets = json.assets as Array<{ id: string; w: number; h: number; p: string }>;
  if (!assets) return json;

  // Desktop: 960 (hex bg), 158/328 (logo placeholders)
  // Mobile: 432 (hex bg), 96 (logo placeholders)
  const stripWidths = new Set([960, 158, 328, 432, 96]);
  const cleaned = assets.map((a) => {
    if (a.w && stripWidths.has(a.w)) return { ...a, p: CLEAR_PX };
    return a;
  });

  return { ...json, assets: cleaned };
}

function useLottieData(url: string | null): Record<string, unknown> | null {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    let cancelled = false;

    fetch(url)
      .then((res) => res.json())
      .then((json: Record<string, unknown>) => {
        if (!cancelled) setData(stripHexAssets(json));
      })
      .catch((err: unknown) => {
        console.error("Failed to load Lottie animation:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return data;
}

const CATEGORIES = [
  "Blockchain Network",
  "Automations",
  "(DeFi) Protocols",
  "User Applications",
  "Development Tools",
  "Analytics",
];

function MobileNetworkDiagram() {
  return (
    <div
      style={{
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.875rem",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        {LOGO_DATA.map((logo) => (
          <div
            key={logo.label}
            style={{
              width: "100%",
              aspectRatio: "1",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <img
              src={logo.src}
              alt={logo.label}
              style={{ width: "48%", height: "48%", objectFit: "contain" }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/zynd.png"
          alt="ZyndAI"
          style={{ width: "56px", height: "auto" }}
        />
        <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, marginTop: "6px", letterSpacing: "0.01em" }}>Zynd<span style={{ color: "#8B5CF6" }}>AI</span></span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.625rem",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            style={{
              padding: "0.5rem 0.625rem",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "0.75rem",
              lineHeight: "1.4",
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}

const LOGO_DATA = [
  { label: "Gemini",    src: "/assets/images/logos/gemini.svg" },
  { label: "Claude",    src: "/assets/images/logos/anthropic.svg" },
  { label: "OpenAI",    src: "/assets/images/logos/openai.svg" },
  { label: "LangChain", src: "/assets/images/logos/langchain.svg" },
  { label: "n8n",       src: "/assets/images/logos/n8n.svg" },
  { label: "Base",      src: "/assets/images/logos/base.svg" },
  { label: "CrewAI",    src: "/assets/images/logos/crewai.svg" },
  { label: "Pydantic",  src: "/assets/images/logos/pydantic.svg" },
];

function injectLogos(container: HTMLElement): void {
  const svgEl = container.querySelector("svg");
  if (!svgEl) return;

  const NS = "http://www.w3.org/2000/svg";
  svgEl.querySelectorAll(".injected-label, .injected-logo").forEach((el) => el.remove());

  const images = Array.from(svgEl.querySelectorAll("image"));
  // Desktop: 158px/328px, Mobile: 96px
  const logoWidths = new Set(["158px", "328px", "96px"]);
  const logoImages = images.filter((img) => {
    const w = img.getAttribute("width") || "";
    return logoWidths.has(w);
  });

  logoImages.forEach((img, i) => {
    const logo = LOGO_DATA[i];
    if (!logo) return;

    const w = parseFloat(img.getAttribute("width") || "0");
    const h = parseFloat(img.getAttribute("height") || "0");
    const parent = img.parentElement;
    if (!parent) return;

    img.style.opacity = "0";

    const logoSize = Math.min(w, h) * 0.7;
    const logoX = (w - logoSize) / 2;
    const logoY = (h - logoSize) / 2 - 8;

    const logoImg = document.createElementNS(NS, "image");
    logoImg.setAttribute("class", "injected-logo");
    logoImg.setAttribute("href", logo.src);
    logoImg.setAttribute("x", String(logoX));
    logoImg.setAttribute("y", String(logoY));
    logoImg.setAttribute("width", String(logoSize));
    logoImg.setAttribute("height", String(logoSize));
    parent.appendChild(logoImg);
  });

}

function ScrollDrivenLottie({
  data,
  className,
  showLabels = false,
}: {
  data: Record<string, unknown>;
  className: string;
  showLabels?: boolean;
}) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    const instance = lottieRef.current;
    if (!instance) return;

    instance.pause();
    const totalFrames = instance.getDuration(true) || 1;
    const mobile = window.innerWidth <= 767;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 15%",
      end: mobile ? "+=150%" : "+=200%",
      pin: true,
      pinType: mobile ? "transform" : "fixed",
      onUpdate: (self) => {
        const frame = Math.round(self.progress * (totalFrames - 1));
        instance.goToAndStop(frame, true);
      },
    });

    if (showLabels && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) injectLogos(containerRef.current);
      }, 100);
    }

    return () => {
      trigger.kill();
    };
  }, [isReady, showLabels]);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={false}
        autoplay={false}
        onDOMLoaded={() => setIsReady(true)}
      />
    </div>
  );
}

export function Seamless(): React.JSX.Element {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const desktopLottie = useLottieData(isMobile ? null : DESKTOP_LOTTIE_URL);

  return (
    <section className="seamless">
      <div className="padding-global">
        <div className="container">
          <div className="seamless-wrapper">
            <div className="seamless-top-wrap">
              <div className="seamless-heading-wrap">
                <h2 text-split="" blur-text="">Autonomous Agent Commerce </h2>
                <div className="hero-accent" hero-accent="">
                  <div className="text-h2 z-index-4" text-split="" blur-text="">
                    Across the Network
                  </div>
                  <div className="accent-border-overlay auto" />
                  <div className="accent-background-overlay" />
                  <div className="accent-background" />
                  <AccentCorners />
                </div>
              </div>
              <div className="hero-max-width">
                <div
                  className="text-large text-align-center"
                  text-split=""
                  blur-text=""
                >
                  Agents discover peers, negotiate services, and settle
                  payments autonomously across the ZyndAI network
                </div>
              </div>
            </div>

            <div className="seamless-bottom-wrap is-sticky">
              {isMobile
                ? (
                  <MobileNetworkDiagram />
                )
                : desktopLottie ? (
                  <ScrollDrivenLottie
                    data={desktopLottie}
                    className="sticky-lottie is-show-desktop"
                    showLabels
                  />
                ) : (
                  <div className="sticky-lottie is-show-desktop" style={{ minHeight: "50vh" }} />
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
