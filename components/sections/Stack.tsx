"use client";

import { useRef, useState } from "react";
import { site, stackChips, type StackGroupKey } from "@/content/site";
import { Flip, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, EASE_OUT, EASE_SNAP } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";
import Marquee from "@/components/ui/Marquee";

type FilterKey = "all" | StackGroupKey;

const marqueeRows = [
  [...site.stack.languages.items, ...site.stack.dev.items],
  [...site.stack.aiml.items],
  [...site.stack.data.items],
];

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const { stackSection } = site;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        const chips = gsap.utils.toArray<HTMLElement>("[data-tech]");
        gsap.set(chips, { opacity: 0, y: 16 });
        ScrollTrigger.batch(chips, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: DUR_BASE, ease: EASE_OUT, stagger: 0.03, overwrite: true }),
        });
      });
    },
    { scope: root },
  );

  // Filter with Flip: leaving chips fade/scale out, the rest reflow smoothly.
  const applyFilter = contextSafe((next: FilterKey) => {
    if (next === filter) return;
    setFilter(next);
    const chips = gsap.utils.toArray<HTMLElement>("[data-tech]");
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    const state = reduce ? null : Flip.getState(chips);
    chips.forEach((chip) => {
      const show = next === "all" || chip.dataset.group === next;
      chip.style.display = show ? "" : "none";
      chip.setAttribute("aria-hidden", show ? "false" : "true");
    });
    // The grid's height changes, so every trigger below it must re-measure.
    if (!state) {
      ScrollTrigger.refresh();
      return;
    }
    Flip.from(state, {
      duration: DUR_BASE,
      ease: EASE_SNAP,
      absolute: true,
      stagger: 0.015,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.02 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.6, duration: 0.35, ease: EASE_SNAP }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  });

  const visibleCount = filter === "all" ? stackChips.length : site.stack[filter].items.length;

  return (
    <section ref={root} id="stack" aria-labelledby="stack-title" className="py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader index={stackSection.index} label={stackSection.label} />
        <SplitReveal as="h2" id="stack-title" className="display display-lg mt-[clamp(48px,7vw,96px)]">
          {stackSection.title}
        </SplitReveal>
      </div>

      <Marquee rows={marqueeRows} className="mt-14" />

      <div className="shell mt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter technologies" className="flex flex-wrap gap-2">
            {stackSection.filters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => applyFilter(f.key)}
                className="mono rounded-full border px-3.5 py-2 transition-colors duration-300 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-bg border-line-strong hover:border-fg hover:text-fg"
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="mono" aria-live="polite">
            Showing {String(visibleCount).padStart(2, "0")} / {stackChips.length}
          </p>
        </div>

        <ul className="relative mt-8 flex flex-wrap gap-2.5">
          {stackChips.map((chip) => (
            <li
              key={`${chip.group}-${chip.name}`}
              data-tech
              data-group={chip.group}
              className="flex items-center gap-3 rounded-full border border-line-strong bg-bg-elev py-2 pl-4 pr-2.5"
            >
              <span className="text-[15px] font-medium text-fg">{chip.name}</span>
              <span className="mono mono-sm rounded-full border border-line px-2 py-0.5">
                {chip.group === "aiml" ? "AI-ML" : chip.group.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
