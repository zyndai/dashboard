"use client";

import { Navbar } from "@/components/Navbar";
import { HomeContent } from "@/components/HomeContent";
import { useLenis } from "@/hooks/useLenis";

export function PageShell() {
  useLenis();

  return (
    <div className="page-wrapper">
      <main className="main-wrapper">
        <div className="background-light">
          <div className="color-overlay" />
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="video-background"
            poster="/assets/images/video-poster.jpg"
            style={{ objectFit: "cover" }}
          >
            <source src="/assets/videos/background-video.webm" type="video/webm" />
            <source src="/assets/videos/background-video.mp4" type="video/mp4" />
          </video>
        </div>
        <Navbar />
        <HomeContent />
      </main>
    </div>
  );
}
