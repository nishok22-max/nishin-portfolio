"use client";

import { useEffect, useRef } from "react";
import { CONDITIONS } from "@/lib/motion";

/**
 * Play / pause a set of looping animations with the card's active state.
 * Under reduced motion the loops never start (visuals show a still frame).
 */
export function useLoop(active: boolean, getAnimations: () => (gsap.core.Animation | undefined)[]) {
  const getter = useRef(getAnimations);
  getter.current = getAnimations;
  useEffect(() => {
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    getter.current().forEach((a) => {
      if (!a) return;
      if (active && !reduce) a.play();
      else a.pause();
    });
  }, [active]);
}
