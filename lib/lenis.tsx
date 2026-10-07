"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { CONDITIONS } from "./motion";

const LenisContext = createContext<Lenis | null>(null);

export const NAV_OFFSET = 72;

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Refresh triggers once real fonts and images have settled layout.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    const mql = window.matchMedia(CONDITIONS.reduceMotion);
    let instance: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      instance = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
      instance.on("scroll", ScrollTrigger.update);
      tick = (time: number) => instance?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (document.documentElement.classList.contains("intro-lock")) instance.stop();
      setLenis(instance);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      instance?.destroy();
      instance = null;
      tick = null;
      gsap.ticker.lagSmoothing(500, 33);
      setLenis(null);
    };
    const sync = () => {
      stop();
      if (!mql.matches) start();
    };

    sync();
    mql.addEventListener("change", sync);
    return () => {
      mql.removeEventListener("change", sync);
      window.removeEventListener("load", refresh);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

/** Scroll to an element id (or 0) through Lenis, falling back to native scrolling. */
export function scrollToTarget(lenis: Lenis | null, target: string | number, offset = -NAV_OFFSET) {
  if (typeof target === "number") {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target, behavior: "auto" });
    return;
  }
  const el = document.getElementById(target);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "auto" });
  }
  // Move focus for keyboard and screen-reader users without scrolling again.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
