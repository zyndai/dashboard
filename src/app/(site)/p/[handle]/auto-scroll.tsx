"use client";

import { Children, useEffect, useRef, useState } from "react";

interface AutoScrollProps {
  /** Fixed height of one row, in px. Rows must actually be this tall. */
  rowHeight: number;
  /** Vertical gap between rows, in px. */
  gap?: number;
  /** How many rows are visible at once. */
  visible?: number;
  /** Seconds for one row to travel its own height — lower is faster. */
  secondsPerRow?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Vertical marquee that keeps exactly ONE copy of each child in the DOM.
 *
 * The obvious implementation — render the list twice and animate the track to
 * -50% — loops seamlessly with pure CSS, but puts every item's text in the
 * document twice. These profile pages exist to be read and cited by crawlers
 * and LLMs, so duplicated body text is a real cost. Instead the track creeps up
 * by one row and then rotates the first child to the end, resetting the offset
 * in the same frame: continuous motion, no duplicate content, no layout jump.
 *
 * Renders as a plain static list when there is nothing to scroll (fewer rows
 * than fit), when the viewer prefers reduced motion, and in SSR output.
 */
export function AutoScroll({
  rowHeight,
  gap = 0,
  visible = 3,
  secondsPerRow = 3.5,
  className,
  children,
}: AutoScrollProps) {
  const items = Children.toArray(children);
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [animating, setAnimating] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  const count = items.length;
  const scrollable = count > visible;
  const step = rowHeight + gap;

  useEffect(() => {
    if (!scrollable) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setAnimating(true);
    const pxPerMs = step / (secondsPerRow * 1000);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = now - last;
      last = now;

      if (!pausedRef.current) {
        offsetRef.current += dt * pxPerMs;
        if (offsetRef.current >= step) {
          offsetRef.current -= step;
          setOrder(prev => [...prev.slice(1), prev[0]]);
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(${-offsetRef.current}px)`;
        }
      }
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      setAnimating(false);
      offsetRef.current = 0;
    };
  }, [scrollable, step, secondsPerRow]);

  // Keep `order` valid if the child list changes length between renders.
  useEffect(() => {
    setOrder(prev => (prev.length === count ? prev : items.map((_, i) => i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const list = (
    <div
      ref={trackRef}
      className={className}
      style={animating ? { willChange: "transform" } : undefined}
    >
      {order.map(i => items[i])}
    </div>
  );

  if (!scrollable) return list;

  return (
    <div
      className="pf-vscroll"
      style={{ height: rowHeight * visible + gap * (visible - 1) }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocusCapture={() => { pausedRef.current = true; }}
      onBlurCapture={() => { pausedRef.current = false; }}
    >
      {list}
    </div>
  );
}
