"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { VisionSection } from "@/components/VisionSection";
import { VideoSection } from "@/components/VideoSection";
import { AgentEconomy } from "@/components/AgentEconomy";
import { AgentDirectoryMarquee } from "@/components/landing/AgentDirectoryMarquee";
import { DeveloperOnboarding } from "@/components/DeveloperOnboarding";
import Roadmap from "@/components/Roadmap";
import UseCases from "@/components/UseCases";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import { Footer } from "@/components/Footer";
import "@/zynd-vendor.css";

const ZYND_CSS = `
  .button-icon {
    filter: none;
    -webkit-filter: blur(0px);
    -moz-filter: blur(0px);
    -ms-filter: blur(0px);
  }
  @media only screen and (max-width: 479px) and (min-width: 395px) {
    .home-adv-head-e { font-size: 36px; }
  }
  @media only screen and (max-width: 390px) and (min-width: 350px) {
    .home-adv-head-e { font-size: 32px; }
  }
  @media (max-width: 640px) {
    .home-hero-button-c {
      flex-direction: row !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 12px !important;
    }
    .home-hero-button-b { flex: 0 1 auto !important; }
    .button { width: auto !important; min-width: unset !important; }
    .cta-pill-btn { min-width: 0 !important; width: 100%; }
  }
  @media (max-width: 480px) {
    .navbar-brand-img-b span { font-size: 22px !important; }
    .navbar-brand-img-b img { width: 32px !important; height: 32px !important; }
  }
`;

export default function Home() {
  useEffect(() => {
    function initAnimations(): void {
      const w = (window as unknown as Record<string, unknown>).Webflow as
        | { destroy: () => void; ready: () => void; require: (mod: string) => { init: () => void } }
        | undefined;
      if (w) {
        w.destroy();
        w.ready();
        w.require("ix2").init();
      }
    }

    // Animation runtime loads via beforeInteractive,
    
    if ((window as unknown as Record<string, unknown>).Webflow) {
      initAnimations();
    } else {
      const interval = setInterval(() => {
        if ((window as unknown as Record<string, unknown>).Webflow) {
          clearInterval(interval);
          initAnimations();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="page-w" data-wf-page="644340149db6917510d9c0b1" data-wf-site="644340149db691bd8cd9c0b0">
      <div className="styles w-embed">
        <style>{ZYND_CSS}</style>
      </div>
      <Navbar />
      <div className="page-cont-w">
        <Hero />
        <ProblemSection />
        <VisionSection />
        <VideoSection />
        <AgentEconomy />
        <AgentDirectoryMarquee />
        <DeveloperOnboarding />
        <Roadmap />
        <UseCases />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
