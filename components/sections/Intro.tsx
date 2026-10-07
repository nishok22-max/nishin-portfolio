"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_SLOW, EASE_OUT } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";
import Rich from "@/components/ui/Rich";

export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const { intro } = site;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        // Scroll-scrubbed reading highlight: words brighten in order.
        const blocks = gsap.utils.toArray<HTMLElement>("[data-highlight]");
        const splits = blocks.map((el) => SplitText.create(el, { type: "words", aria: "none" }));
        splits.forEach((split, i) => {
          gsap.fromTo(
            split.words,
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: blocks[i], start: "top 85%", end: "bottom 45%", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-row-line]").forEach((line) => {
          gsap.from(line, {
            scaleX: 0,
            duration: DUR_SLOW,
            ease: EASE_OUT,
            scrollTrigger: { trigger: line, start: "top 90%", once: true },
          });
        });

        return () => splits.forEach((s) => s.revert());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="intro" aria-labelledby="intro-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="shell">
        <SectionHeader index={intro.index} label={intro.label} />

        <SplitReveal as="h2" id="intro-title" className="display display-xl mt-[clamp(48px,8vw,120px)]">
          {intro.title}
        </SplitReveal>

        <p data-highlight className="mt-10 max-w-[28ch] text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.02em] text-fg [&_strong]:font-medium [&_strong]:text-accent">
          <Rich text={intro.lead} />
        </p>

        <ol className="mt-[clamp(48px,7vw,96px)]">
          {intro.statements.map((s, i) => (
            <li key={s.keyword} className="relative">
              <div data-row-line className="hairline" aria-hidden="true" />
              <div className="grid grid-cols-[3rem_1fr] items-baseline gap-x-4 py-6 md:grid-cols-12 md:py-8">
                <span className="mono md:col-span-1" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p data-highlight className="text-[clamp(1.35rem,2.6vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em] md:col-span-8">
                  {s.text}
                </p>
                <span className="mono col-start-2 mt-2 md:col-span-3 md:col-start-10 md:mt-0 md:text-right" aria-hidden="true">
                  {s.keyword}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <div data-row-line className="hairline" aria-hidden="true" />

        <p data-highlight className="prose-body mt-[clamp(40px,6vw,72px)] text-[clamp(1.1rem,1.6vw,1.35rem)] leading-[1.5] text-fg md:ml-[calc(100%/12*4)]">
          {intro.close}
        </p>
      </div>
    </section>
  );
}
