"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS } from "@/lib/motion";

/** Faint blueprint dot grid that drifts slightly with page scroll. */
export default function DotGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(CONDITIONS.motionOK, () => {
      gsap.to(ref.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: true },
      });
    });
  });

  return <div ref={ref} className="dot-grid" aria-hidden="true" />;
}
