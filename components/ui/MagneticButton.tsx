"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS, EASE_ELASTIC } from "@/lib/motion";

type Props<T extends ElementType> = {
  as?: T;
  strength?: number;
  radius?: number;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/** Pulls toward the cursor within `radius` px and snaps back elastically. */
export default function MagneticButton<T extends ElementType = "button">({
  as,
  strength = 0.35,
  radius = 80,
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "button") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${CONDITIONS.finePointer} and (min-width: 768px) and (prefers-reduced-motion: no-preference)`, () => {
        const el = ref.current!;
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        let engaged = false;

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          // Measure from the element's resting position, not its offset one.
          const tx = Number(gsap.getProperty(el, "x"));
          const ty = Number(gsap.getProperty(el, "y"));
          const cx = r.left - tx + r.width / 2;
          const cy = r.top - ty + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const inside =
            Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
          if (inside) {
            engaged = true;
            xTo(dx * strength);
            yTo(dy * strength);
          } else if (engaged) {
            engaged = false;
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: EASE_ELASTIC, overwrite: true });
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
          window.removeEventListener("pointermove", onMove);
          gsap.set(el, { x: 0, y: 0 });
        };
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...rest} style={{ display: "inline-flex", ...(rest as { style?: object }).style }}>
      {children}
    </Tag>
  );
}
