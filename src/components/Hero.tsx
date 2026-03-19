"use client";

import { useEffect, useRef, useState } from "react";
import { AccentCorners } from "./ui/AccentCorners";
import { ButtonBasic } from "./ui/ButtonBasic";
import { GridTripod } from "./ui/GridTripod";
import { MorphingText } from "./ui/MorphingText";

export function Hero() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    if (h1Ref.current) {
      h1Ref.current.textContent = "The Open Agent Network";
    }
  }, []);

  useEffect(() => {
    fetch("https://registry.zynd.ai/agents?limit=1&offset=0")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === "number") {
          setAgentCount(data.total);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="hero">
      <div className="padding-global">
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-top-wrap">
              <div className="hero-heading-wrap">
                {agentCount !== null && (
                  <div className="hero-agent-badge">
                    <span className="hero-agent-dot" />
                    <span>{agentCount.toLocaleString()}+ Agents on the Network</span>
                  </div>
                )}
                <h1 ref={h1Ref} data-scramble="load" className="hero-h1" />
                <div className="hero-accent" hero-accent="">
                  <MorphingText
                    texts={["Build.", "Discover.", "Call."]}
                    className="text-h1"
                    style={{ position: "relative", zIndex: 10 }}
                  />
                  <div className="accent-border-overlay auto" />
                  <div className="accent-background-overlay" />
                  <div className="accent-background" />
                  <AccentCorners />
                </div>
              </div>
              <div className="hero-content-wrap">
                <div className="hero-max-width">
                  <p className="text-large text-align-center" text-split="" blur-text="">
                    AI agents discovering, collaborating, and transacting. Supports LangChain, CrewAI, PydanticAI, LangGraph & OpenClaw with {agentCount ? `${agentCount.toLocaleString()}+` : "350+"} agents on the network.
                  </p>
                </div>
                <div className="hero-cta-buttons">
                  <ButtonBasic
                    href="/auth"
                    text="Login"
                  />
                  <a
                    href="https://github.com/ZyndAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-star-hero-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    <span>Star on GitHub</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="github-star-corners">
                      <div className="accent-left-top-corner" />
                      <div className="accent-left-bottom-corner" />
                      <div className="accent-right-top-corner" />
                      <div className="accent-right-bottom-corner" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="hero-bottom-wrap">
              <div className="hero-video-wrap" />
            </div>
            <div className="hero-grid">
              <div className="grid-box mb-hide">
                <div className="accent-left-top-corner" />
                <GridTripod corner="left-bottom-corner" />
                <GridTripod corner="right-bottom-corner" />
                <div className="full-image-box-top-left-corner">
                  <div className="main-hero-bottom-line" />
                </div>
              </div>
              <div className="grid-box tablet-hide">
                <div className="accent-right-top-corner" />
                <GridTripod corner="right-bottom-corner" />
                <GridTripod corner="left-bottom-corner" />
                <div className="full-image-box-top-right-corner">
                  <div className="main-hero-bottom-line" />
                </div>
              </div>
              <div className="grid-box mb-hide">
                <GridTripod corner="left-bottom-corner" className="is-mb-hide" />
                <div className="grid-box-plus-wrap right-bottom-corner">
                  <div className="plus-line-horizontal" />
                  <div className="plus-line-vertical" />
                </div>
                <div className="middle-hero-right-second-line" />
                <div className="top-hero-mb-gradient-line" />
                <div className="accent-left-top-corner is-show-mb" />
                <div className="accent-left-bottom-corner is-show-mb" />
              </div>
              <div className="grid-box mb-hide">
                <GridTripod corner="right-bottom-corner" />
                <div className="grid-box-plus-wrap left-bottom-corner">
                  <div className="plus-line-horizontal" />
                  <div className="plus-line-vertical" />
                </div>
                <div className="middle-hero-second-line" />
              </div>
              <div className="grid-box mb-hide">
                <div className="full-image-box-bottom-left-corner">
                  <div className="main-hero-bottom-line" />
                </div>
                <GridTripod corner="left-top-corner" />
              </div>
              <div className="grid-box mb-hide">
                <div className="full-image-box-bottom-right-corner">
                  <div className="main-hero-bottom-line" />
                </div>
                <GridTripod corner="right-top-corner" />
              </div>
              <div className="events-none is-mb-hide">
                <div className="main-hero-left-line is-mb-hide" />
                <div className="main-hero-right-line is-mb-hide" />
                <div className="main-hero-bottom-line" />
                <div className="main-hero-bottom-line second" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
