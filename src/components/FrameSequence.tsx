"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNTS: Record<string, number> = {
  benefits: 118,
};

interface FrameSequenceProps {
  folder: "benefits";
  triggerSelector: string;
  scrollStart?: string;
  scrollEnd?: string;
  className?: string;
  startFrame?: number;
}

function getFramePath(folder: string, index: number): string {
  const padded = String(index + 1).padStart(6, "0");
  return `/assets/frames/${folder}/${padded}.png`;
}

export function FrameSequence({
  folder,
  triggerSelector,
  scrollStart = "top top",
  scrollEnd = "bottom 75%",
  className,
  startFrame = 0,
}: FrameSequenceProps) {
  const rawTotal = FRAME_COUNTS[folder] ?? 150;
  const totalFrames = rawTotal - startFrame;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const loadedCountRef = useRef(0);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 800;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const padding = 1.15;
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight) * padding;
    const dx = (w - img.naturalWidth * scale) / 2;
    const dy = (h - img.naturalHeight * scale) / 2;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
  }, []);

  // Preload all frames — frame 0 first for immediate paint
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(totalFrames);
    let cancelled = false;

    const firstImg = new Image();
    firstImg.src = getFramePath(folder, startFrame);
    firstImg.onload = () => {
      if (!cancelled) {
        images[0] = firstImg;
        imagesRef.current = images;
        setFirstFrameLoaded(true);
        requestAnimationFrame(() => drawFrame(0));
      }
    };
    images[0] = firstImg;

    for (let i = 1; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFramePath(folder, startFrame + i);
      img.onload = () => {
        if (!cancelled) {
          loadedCountRef.current++;
          if (i === currentFrameRef.current) {
            drawFrame(i);
          }
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;

    return () => {
      cancelled = true;
      images.forEach((img) => {
        if (img) {
          img.onload = null;
          img.src = "";
        }
      });
    };
  }, [folder, startFrame, drawFrame]);

  // ResizeObserver: redraw when the container resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      drawFrame(currentFrameRef.current);
    });

    const container = canvas.parentElement ?? canvas;
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawFrame]);

  // GSAP scroll-driven frame animation
  useEffect(() => {
    const state = { frame: 0 };

    const tween = gsap.to(state, {
      frame: totalFrames - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: triggerSelector,
        start: scrollStart,
        end: scrollEnd,
        scrub: 1.6,
      },
      onUpdate: () => {
        const frameIndex = Math.round(state.frame);
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [totalFrames, triggerSelector, scrollStart, scrollEnd, drawFrame]);

  return (
    <>
      {!firstFrameLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid rgba(255,255,255,0.1)",
              borderTopColor: "#8B5CF6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </>
  );
}
