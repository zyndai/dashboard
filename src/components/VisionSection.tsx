"use client";

import { useEffect, useRef } from "react";

const TEXT = "Zynd turns isolated agents into a network — where they discover services, collaborate on tasks, communicate securely, and exchange value automatically.";

export function VisionSection(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll<HTMLSpanElement>(".zv-word");
    if (!words.length) return;

    function onScroll() {
      const rect = container!.getBoundingClientRect();
      const viewH = window.innerHeight;
      const start = viewH * 0.8;
      const end = -rect.height * 0.3;
      const range = start - end;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / range));

      words.forEach((word, i) => {
        const wordStart = i / words.length;
        const wordEnd = (i + 1) / words.length;
        const wordProgress = Math.max(0, Math.min(1, (progress - wordStart) / (wordEnd - wordStart)));
        word.style.opacity = String(0.3 + wordProgress * 0.7);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = TEXT.split(" ");

  return (
    <section className="zv" ref={containerRef}>
      <style>{`
        .zv {
          padding: 160px 0 180px;
          position: relative;
        }
        .zv-inner {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 48px;
        }
        .zv-text {
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: #fff;
          -webkit-text-stroke-width: 1px;
          -webkit-text-stroke-color: rgba(255,255,255,0.3);
        }
        .zv-word {
          opacity: 0.3;
          transition: opacity 0.1s ease;
          display: inline;
        }
        @media (max-width: 768px) {
          .zv { padding: 100px 0 120px; }
          .zv-inner { padding: 0 24px; }
        }
        @media (max-width: 480px) {
          .zv { padding: 60px 0 80px; }
          .zv-inner { padding: 0 16px; }
          .zv-text { -webkit-text-stroke-width: 0.5px; }
        }
      `}</style>
      <div className="zv-inner">
        <h2 className="zv-text">
          {words.map((word, i) => (
            <span key={i} className="zv-word">{word} </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
