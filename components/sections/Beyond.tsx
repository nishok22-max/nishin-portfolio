"use client";

import { useRef, useState } from "react";
import { Network, LayoutTemplate, TriangleAlert, Plus } from "lucide-react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, DUR_REVEAL, EASE_OUT, EASE_SNAP, STAGGER_ITEMS } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";

const ICONS = { network: Network, wireframe: LayoutTemplate, warning: TriangleAlert } as const;

export default function Beyond() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const { beyond } = site;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        gsap.from("[data-beyond-row] [data-row-text]", {
          yPercent: 110,
          duration: DUR_REVEAL,
          ease: EASE_OUT,
          stagger: STAGGER_ITEMS,
          scrollTrigger: { trigger: "[data-beyond-list]", start: "top 80%", once: true },
        });
        const close = gsap.timeline({
          scrollTrigger: { trigger: "[data-beyond-close]", start: "top 85%", once: true },
        });
        close
          .from("[data-beyond-close] [data-close-text]", { yPercent: 110, duration: DUR_REVEAL, ease: EASE_OUT })
          .from("[data-flourish]", { scaleX: 0, duration: DUR_BASE, ease: EASE_SNAP }, "-=0.5")
          .from("[data-flourish-dot]", { scale: 0, duration: 0.5, ease: "back.out(3)" }, "-=0.2");
      });
      // Collapsed example panels (content stays in the DOM for assistive tech).
      gsap.set("[data-example]", { height: 0 });
    },
    { scope: root },
  );

  const refresh = useRef<gsap.core.Tween | null>(null);
  const expand = contextSafe((index: number | null) => {
    setOpen(index);
    // Row heights change: re-measure the pinned sections below once settled.
    refresh.current?.kill();
    refresh.current = gsap.delayedCall(0.6, () => ScrollTrigger.refresh());
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    const d = reduce ? 0 : 0.5;
    gsap.utils.toArray<HTMLElement>("[data-beyond-row]").forEach((row, i) => {
      const example = row.querySelector("[data-example]");
      const isOpen = i === index;
      gsap.to(example, { height: isOpen ? "auto" : 0, duration: d, ease: EASE_SNAP, overwrite: true });
      gsap.to(row, { opacity: index === null || isOpen ? 1 : 0.35, duration: reduce ? 0 : 0.35, overwrite: "auto" });
    });
  });

  return (
    <section ref={root} id="beyond" aria-labelledby="beyond-title" className="py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader index={beyond.index} label={beyond.label} />
        <SplitReveal as="h2" id="beyond-title" className="display display-lg mt-[clamp(48px,7vw,96px)]">
          {beyond.title}
        </SplitReveal>
        <p className="prose-body mt-8 text-[clamp(1.1rem,1.5vw,1.35rem)] text-fg">{beyond.lead}</p>

        <ul data-beyond-list className="mt-14 border-t border-line-strong" onPointerLeave={() => expand(null)}>
          {beyond.rows.map((row, i) => {
            const Icon = ICONS[row.icon];
            const id = `beyond-example-${i}`;
            return (
              <li key={row.text} data-beyond-row className="border-b border-line-strong">
                <button
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={id}
                  onPointerEnter={(e) => e.pointerType === "mouse" && expand(i)}
                  onFocus={() => expand(i)}
                  onClick={() => expand(open === i ? null : i)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-7 text-left md:gap-8 md:py-9"
                >
                  <Icon aria-hidden="true" strokeWidth={1.25} className="h-6 w-6 text-fg-dim transition-colors group-hover:text-accent md:h-8 md:w-8" />
                  <span className="line-mask">
                    <span data-row-text className="block text-[clamp(1.35rem,3vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.03em]">
                      {row.text}
                    </span>
                  </span>
                  <Plus
                    aria-hidden="true"
                    strokeWidth={1.25}
                    className={`h-5 w-5 text-fg-dim transition-transform duration-500 ${open === i ? "rotate-45 text-accent" : ""}`}
                  />
                </button>
                <div id={id} data-example className="overflow-hidden" role="region" aria-label={row.text}>
                  <p className="mono pb-7 pl-11 text-fg-muted md:pl-16">{row.example}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <p data-beyond-close className="mt-14 flex items-center gap-4">
          <span className="line-mask">
            <span data-close-text className="display block text-[clamp(2rem,5vw,4.5rem)]">
              {beyond.close}
            </span>
          </span>
          <span aria-hidden="true" className="flex flex-1 items-center">
            <span data-flourish className="h-px flex-1 origin-left bg-accent" />
            <span data-flourish-dot className="h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
        </p>
      </div>
    </section>
  );
}
