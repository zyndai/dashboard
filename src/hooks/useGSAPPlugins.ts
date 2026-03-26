"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    ScrambleTextPlugin: any;
    SplitText: any;
  }
}

export function useGSAPPlugins(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.ScrambleTextPlugin && window.SplitText) {
      gsap.registerPlugin(window.ScrambleTextPlugin, window.SplitText);
      setReady(true);
      return;
    }

    function loadPlugins() {
      let loaded = 0;
      const scripts: HTMLScriptElement[] = [];

      function onLoad() {
        loaded++;
        if (loaded === 2 && window.ScrambleTextPlugin && window.SplitText) {
          gsap.registerPlugin(window.ScrambleTextPlugin, window.SplitText);
          setReady(true);
        }
      }

      ["/assets/SplitText.min.js", "/assets/ScrambleTextPlugin.min.js"].forEach((src) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = onLoad;
        script.onerror = () => {
          console.error(`Failed to load GSAP plugin: ${src}`);
        };
        document.head.appendChild(script);
        scripts.push(script);
      });

      return scripts;
    }

    let scripts: HTMLScriptElement[] = [];

    // Defer plugin loading until after first paint to avoid blocking LCP
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(() => {
        scripts = loadPlugins();
      }, { timeout: 2000 });
      return () => {
        cancelIdleCallback(id);
        scripts.forEach((s) => s.remove());
      };
    }

    const timer = setTimeout(() => {
      scripts = loadPlugins();
    }, 100);
    return () => {
      clearTimeout(timer);
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return ready;
}
