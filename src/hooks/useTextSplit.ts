"use client";

import { useEffect } from "react";
import SplitType from "split-type";

export function useTextSplit() {
  useEffect(() => {
    let instances: SplitType | null = null;

    // Defer text splitting until after first paint to avoid blocking LCP
    const raf = requestAnimationFrame(() => {
      instances = new SplitType("[text-split]:not(.button-top-text):not(.button-bottom-text)", {
        types: "words,chars",
        tagName: "span",
      });

      document.querySelectorAll("[text-split]:not(.button-top-text):not(.button-bottom-text)").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      instances?.revert();
    };
  }, []);
}
