"use client";

import { CustomEase, gsap } from "./gsap";

/* ── Motion vocabulary ─────────────────────────────────────────── */
export const EASE_OUT = "expo.out";
export const EASE_INOUT = "power3.inOut";
export const EASE_SNAP = CustomEase.create("snap", "0.7,0,0.2,1");
export const EASE_ELASTIC = "elastic.out(1, 0.4)";

export const DUR_FAST = 0.35;
export const DUR_BASE = 0.8;
export const DUR_SLOW = 1.4;
export const DUR_REVEAL = 1;

export const STAGGER_CHARS = 0.02;
export const STAGGER_WORDS = 0.06;
export const STAGGER_ITEMS = 0.08;

export const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ── Responsive / preference conditions for gsap.matchMedia() ─── */
export const CONDITIONS = {
  isDesktop: "(min-width: 1280px)",
  isTablet: "(min-width: 768px) and (max-width: 1279.98px)",
  isMobile: "(max-width: 767.98px)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
  motionOK: "(prefers-reduced-motion: no-preference)",
} as const;

export type Conditions = { [K in keyof typeof CONDITIONS]: boolean };

/** Read matchMedia conditions inside a gsap.matchMedia() callback. */
export function readConditions(ctx: gsap.Context): Conditions {
  return ctx.conditions as Conditions;
}

/** Reduced-motion stand-in for any reveal: a short fade, nothing else. */
export const REDUCED_FROM: gsap.TweenVars = { opacity: 0, duration: 0.3, ease: "none" };

export { gsap };
