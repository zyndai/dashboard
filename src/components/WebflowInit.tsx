"use client";

import { useEffect } from "react";

type WebflowApi = {
  destroy: () => void;
  ready: () => void;
  require: (mod: string) => { init: () => void };
};

export function WebflowInit(): null {
  useEffect(() => {
    function initAnimations(): void {
      const w = (window as unknown as Record<string, unknown>).Webflow as
        | WebflowApi
        | undefined;
      if (w) {
        w.destroy();
        w.ready();
        w.require("ix2").init();
      }
    }

    if ((window as unknown as Record<string, unknown>).Webflow) {
      initAnimations();
      return;
    }

    const interval = setInterval(() => {
      if ((window as unknown as Record<string, unknown>).Webflow) {
        clearInterval(interval);
        initAnimations();
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return null;
}
