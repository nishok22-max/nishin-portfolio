"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** 1px accent bar tied to page progress plus a mono SCROLL 000% readout. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const setScale = gsap.quickSetter(bar.current, "scaleX");
    let last = -1;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setScale(self.progress);
        const pct = Math.round(self.progress * 100);
        if (pct !== last && readout.current) {
          last = pct;
          readout.current.textContent = String(pct).padStart(3, "0");
        }
      },
    });
    setScale(st.progress);
  });

  return (
    <div aria-hidden="true">
      <div
        ref={bar}
        className="fixed inset-x-0 top-0 z-[95] h-px origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
      <div className="mono mono-sm pointer-events-none fixed right-3 top-1/2 z-[60] hidden origin-center -translate-y-1/2 translate-x-[38%] rotate-90 mix-blend-difference md:block">
        Scroll <span ref={readout}>000</span>%
      </div>
    </div>
  );
}
