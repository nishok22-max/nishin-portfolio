"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_REVEAL, EASE_OUT, REDUCED_FROM, STAGGER_CHARS, STAGGER_WORDS } from "@/lib/motion";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Split granularity inside the line masks. */
  type?: "lines" | "words" | "chars";
  start?: string;
  delay?: number;
};

/** The standard reveal: text rises out of an overflow-clipped line mask. */
export default function SplitReveal({
  as: Tag = "div",
  children,
  className,
  id,
  type = "lines",
  start = "top 85%",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.reduceMotion, () => {
        gsap.from(el, { ...REDUCED_FROM, scrollTrigger: { trigger: el, start, once: true } });
      });
      mm.add(CONDITIONS.motionOK, () => {
        const split = SplitText.create(el, {
          type: type === "lines" ? "lines" : `lines,${type}`,
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          aria: "auto",
          onSplit(self) {
            const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: 110,
              duration: DUR_REVEAL,
              ease: EASE_OUT,
              delay,
              stagger: type === "chars" ? STAGGER_CHARS : STAGGER_WORDS,
              scrollTrigger: { trigger: el, start, once: true },
            });
          },
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
