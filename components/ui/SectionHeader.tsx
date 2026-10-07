"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { bindPointer, pointer } from "@/lib/pointer";
import { CONDITIONS, DUR_SLOW, EASE_OUT, SCRAMBLE_CHARS } from "@/lib/motion";

type Props = {
  index: string;
  label: string;
  /** Optional right-side slot rendered before the coordinates (e.g. a counter). */
  extra?: React.ReactNode;
  className?: string;
};

const pad = (n: number) => String(Math.max(0, Math.min(99, Math.round(n)))).padStart(2, "0");

/**
 * `[0X] — SECTION NAME ———————— x: 00 y: 00`
 * Coordinates track the pointer (x across the viewport, y within the
 * section) while the section is on screen. Decorative: aria-hidden.
 */
export default function SectionHeader({ index, label, extra, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const xEl = useRef<HTMLSpanElement>(null);
  const yEl = useRef<HTMLSpanElement>(null);
  const nameEl = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      bindPointer();
      const section = root.current!.closest("section") ?? root.current!;
      let frame = 0;
      let lx = "";
      let ly = "";

      const tick = () => {
        if (++frame % 3) return; // ~20 updates/sec is plenty for a readout
        const st = trigger;
        const top = st.start + window.innerHeight;
        const height = Math.max(1, st.end - st.start - window.innerHeight);
        const x = pad((pointer.x / window.innerWidth) * 100);
        const y = pad(((window.scrollY + pointer.y - top) / height) * 100);
        if (x !== lx && xEl.current) xEl.current.textContent = lx = x;
        if (y !== ly && yEl.current) yEl.current.textContent = ly = y;
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });

      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        gsap.from("[data-sh-line]", {
          scaleX: 0,
          duration: DUR_SLOW,
          ease: EASE_OUT,
          scrollTrigger: { trigger: root.current, start: "top 90%", once: true },
        });
      });

      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  const scramble = contextSafe(() => {
    if (window.matchMedia(CONDITIONS.reduceMotion).matches) return;
    gsap.to(nameEl.current, {
      duration: 0.4,
      scrambleText: { text: label, chars: SCRAMBLE_CHARS, speed: 0.6 },
      overwrite: true,
    });
  });

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`mono flex items-center gap-3 md:gap-4 ${className}`}
      onPointerEnter={scramble}
    >
      <span className="text-fg">[{index}]</span>
      <span>—</span>
      <span ref={nameEl} className="whitespace-nowrap">
        {label}
      </span>
      <span data-sh-line className="hairline min-w-6 flex-1" />
      {extra}
      <span className="whitespace-nowrap tabular-nums">
        x: <span ref={xEl}>00</span> y: <span ref={yEl}>00</span>
      </span>
    </div>
  );
}
