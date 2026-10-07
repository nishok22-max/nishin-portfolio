"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS } from "@/lib/motion";

type Props = {
  rows: string[][];
  className?: string;
};

/**
 * Infinite outlined-type marquees. Scroll velocity speeds them up, scroll
 * direction flips them, and they skew with velocity. Decorative only —
 * the same content is available in the accessible grid beneath.
 */
export default function Marquee({ rows, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee-track]");
        const loops = tracks.map((track, i) => {
          const base = i % 2 === 0 ? 1 : -1;
          const tween = gsap.fromTo(
            track,
            { xPercent: base > 0 ? 0 : -50 },
            { xPercent: base > 0 ? -50 : 0, duration: 40 + i * 8, ease: "none", repeat: -1 },
          );
          // Park far from zero so a reversed (negative timeScale) loop never hits the start.
          tween.totalTime(tween.duration() * 500);
          tween.pause();
          return { tween, base };
        });

        const skewTo = gsap.quickTo(tracks, "skewX", { duration: 0.5, ease: "power3.out" });
        let velocity = 0;
        let direction = 1;

        // One ticker eases timeScale + skew toward the latest scroll velocity.
        const tick = () => {
          velocity *= 0.92;
          const target = direction * (1 + Math.min(Math.abs(velocity) / 400, 6));
          loops.forEach(({ tween }) => tween.timeScale(tween.timeScale() + (target - tween.timeScale()) * 0.12));
          skewTo(gsap.utils.clamp(-12, 12, velocity / -300));
        };

        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            loops.forEach(({ tween }) => (self.isActive ? tween.resume() : tween.pause()));
            if (self.isActive) gsap.ticker.add(tick);
            else gsap.ticker.remove(tick);
          },
          onUpdate: (self) => {
            velocity = self.getVelocity();
            direction = self.direction;
          },
        });
        return () => gsap.ticker.remove(tick);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className={`overflow-hidden ${className}`}>
      {rows.map((words, r) => (
        <div key={r} className="flex overflow-hidden py-1">
          <div data-marquee-track className="flex shrink-0 will-change-transform">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {words.map((w) => (
                  <span
                    key={`${copy}-${w}`}
                    className="display text-outline-strong px-[0.25em] text-[clamp(3rem,8vw,7.5rem)] leading-[1.05] whitespace-nowrap transition-colors duration-300 hover:text-fg"
                  >
                    {w}
                    <span className="text-outline px-[0.25em]">/</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
