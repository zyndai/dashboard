"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    function createScrollTrigger(element: Element, timeline: gsap.core.Timeline) {
      triggers.push(
        ScrollTrigger.create({
          trigger: element,
          start: "top bottom",
          onLeaveBack: () => timeline.progress(0).pause(),
        })
      );
      triggers.push(
        ScrollTrigger.create({
          trigger: element,
          start: "top 90%",
          onEnter: () => timeline.play(),
        })
      );
    }

    // Defer all scroll animations past first paint
    const rafId = requestAnimationFrame(() => {
      const blurElements = document.querySelectorAll("[blur-text], [data-blur-text]");
      blurElements.forEach((el) => {
        const tl = gsap.timeline({ paused: true });
        tl.from(el.querySelectorAll(".word"), {
          opacity: 0,
          filter: "blur(15px)",
          duration: 1,
          ease: "back.in(1)",
          stagger: { amount: 0.2 },
        });
        createScrollTrigger(el, tl);
      });

      const accentElements = document.querySelectorAll("[hero-accent], [data-hero-accent]");
      accentElements.forEach((el) => {
        const tl = gsap.timeline({ paused: true });
        tl.from(el, {
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          opacity: 0,
          duration: 0.8,
          ease: "back.out(2)",
        });
        createScrollTrigger(el, tl);
      });

      document.querySelectorAll("[text-split]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });

      const benefitsCards = document.querySelectorAll(".solution-right-colm > .solution-card");
      benefitsCards.forEach((card) => {
        const topWrap = card.querySelector(".solution-top-lines-wrap");
        const bottomWrap = card.querySelector(".solution-bottom-lines-wrap");

        if (topWrap) {
          const topTween = gsap.from(Array.from(topWrap.children), {
            y: "-100%",
            opacity: 0,
            duration: 1,
            stagger: { each: 0.1, from: "random" },
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "bottom 60%",
              scrub: 1.1,
            },
          });
          if (topTween.scrollTrigger) triggers.push(topTween.scrollTrigger);
        }

        if (bottomWrap) {
          const bottomTween = gsap.from(Array.from(bottomWrap.children), {
            y: "100%",
            opacity: 0,
            duration: 1,
            stagger: { each: 0.1, from: "random" },
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 40%",
              end: "bottom top",
              scrub: true,
            },
          });
          if (bottomTween.scrollTrigger) triggers.push(bottomTween.scrollTrigger);
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      triggers.forEach((t) => t.kill());
    };
  }, []);
}
