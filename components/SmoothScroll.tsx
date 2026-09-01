"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Step 6 — Smooth scrolling (Lenis)
 *
 * Lenis intercepts the native wheel/touch scroll and interpolates it into a
 * smooth, physics-based scroll position. The critical wiring here is:
 *   1. Drive Lenis from GSAP's own ticker (not a separate rAF loop) so both
 *      systems share one frame clock and never drift apart.
 *   2. Tell ScrollTrigger to read scroll position from Lenis, and to scroll
 *      the page via Lenis.scrollTo — otherwise pinned sections (Step 5) will
 *      visibly jitter against the smoothed scroll.
 *   3. Respect prefers-reduced-motion by skipping the smoothing entirely and
 *      falling back to native scroll.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
