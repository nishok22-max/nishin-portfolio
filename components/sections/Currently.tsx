"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS, EASE_SNAP, SCRAMBLE_CHARS } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";

const CELLS = 10;

/** Text that types in visually, while assistive tech always gets the full string. */
function TermText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span data-term-line aria-hidden="true" className={className}>
        {text}
      </span>
    </>
  );
}

export default function Currently() {
  const root = useRef<HTMLElement>(null);
  const { currently } = site;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        // Title: each word rolls through a slot, one after another, on a loop.
        const reels = gsap.utils.toArray<HTMLElement>("[data-reel]");
        const roll = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true });
        reels.forEach((reel, i) => {
          roll
            .to(reel, { yPercent: -50, duration: 0.9, ease: EASE_SNAP }, i * 1.1)
            .to(reel.querySelectorAll("[data-reel-word]"), { color: "var(--accent)", duration: 0.2 }, "<0.45")
            .to(reel.querySelectorAll("[data-reel-word]"), { color: "var(--fg)", duration: 0.6 }, "<0.7")
            .set(reel, { yPercent: 0 }, ">");
        });

        // Terminal panel: lines type in, bars fill, then the cursor blinks.
        const lines = gsap.utils.toArray<HTMLElement>("[data-term-line]");
        const cells = gsap.utils.toArray<HTMLElement>("[data-cell-on]");
        const texts = lines.map((l) => l.textContent ?? "");
        lines.forEach((l) => (l.textContent = " "));
        gsap.set(cells, { opacity: 0.12 });

        const term = gsap.timeline({
          scrollTrigger: { trigger: "[data-terminal]", start: "top 75%", once: true },
        });
        lines.forEach((l, i) => {
          term.to(l, { duration: 0.5, scrambleText: { text: texts[i], chars: SCRAMBLE_CHARS, speed: 1 }, ease: "none" }, i * 0.12);
        });
        term.to(cells, { opacity: 1, duration: 0.05, stagger: 0.012, ease: "none" }, 0.3);
        term.from("[data-term-cursor]", { opacity: 0, duration: 0.2 });

        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? roll.play() : roll.pause()),
        });

        return () => lines.forEach((l, i) => (l.textContent = texts[i]));
      });
    },
    { scope: root },
  );

  const bar = (level: number) => "■".repeat(level) + "□".repeat(CELLS - level);

  return (
    <section ref={root} id="currently" aria-labelledby="currently-title" className="py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader index={currently.index} label={currently.label} />

        <h2
          id="currently-title"
          className="display display-lg mt-[clamp(48px,7vw,96px)] flex flex-wrap gap-x-[0.25em]"
          aria-label={currently.titleWords.join(" ")}
        >
          {currently.titleWords.map((w) => (
            <span key={w} aria-hidden="true" className="block h-[1.1em] overflow-hidden leading-[1.1em]">
              <span data-reel className="block">
                <span data-reel-word className="block h-[1.1em] leading-[1.1em]">
                  {w}
                </span>
                <span data-reel-word className="block h-[1.1em] leading-[1.1em]">
                  {w}
                </span>
              </span>
            </span>
          ))}
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-8">
          <p className="prose-body text-[clamp(1.05rem,1.3vw,1.2rem)] md:col-span-4">{currently.outro}</p>

          <div
            data-terminal
            className="overflow-hidden rounded-[16px] border border-line-strong bg-bg-elev md:col-span-7 md:col-start-6"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
              </span>
              <span className="mono mono-sm">nishok@system — monitor</span>
            </div>
            <div className="overflow-x-auto p-5 font-mono text-[13px] leading-[2] text-fg-muted md:p-7">
              <p className="text-fg">
                <span className="text-accent" aria-hidden="true">
                  &gt;{" "}
                </span>
                <TermText text={currently.command} />
              </p>
              <p className="text-fg-dim">
                <TermText text={currently.intro} />
              </p>
              <ul className="mt-2">
                {currently.items.map((item) => (
                  <li key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 whitespace-nowrap">
                    <span aria-hidden="true" className="tracking-[0.05em]">
                      [
                      {bar(item.level)
                        .split("")
                        .map((c, i) => (
                          <span key={i} data-cell-on={c === "■" ? "" : undefined} className={c === "■" ? "text-accent" : "text-fg-faint"}>
                            {c}
                          </span>
                        ))}
                      ]
                    </span>
                    <span className="text-fg">
                      <TermText text={item.label} />
                    </span>
                    <span className="mono mono-sm text-accent">
                      <span className="sr-only">— </span>
                      {currently.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                <TermText text={`last_updated: ${currently.lastUpdated}`} />
                <span data-term-cursor aria-hidden="true" className="blink ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
