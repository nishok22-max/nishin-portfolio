"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_SLOW, EASE_INOUT, readConditions } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";

/** Splits a line around its key phrase so the phrase can flash accent. */
function Keyed({ text, keyPhrase, flash }: { text: string; keyPhrase: string; flash?: boolean }) {
  const at = text.indexOf(keyPhrase);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span data-key={flash || undefined}>{keyPhrase}</span>
      {text.slice(at + keyPhrase.length)}
    </>
  );
}

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const { manifesto } = site;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isMobile } = readConditions(ctx);
        if (reduceMotion) return;
        const fills = gsap.utils.toArray<HTMLElement>("[data-fill]");
        const keys = gsap.utils.toArray<HTMLElement>("[data-key]");
        const HIDDEN = "inset(-10% 100% -10% 0%)";
        const SHOWN = "inset(-10% 0% -10% 0%)";

        if (isMobile) {
          fills.forEach((fill) =>
            gsap.fromTo(
              fill,
              { clipPath: HIDDEN },
              {
                clipPath: SHOWN,
                duration: DUR_SLOW,
                ease: EASE_INOUT,
                scrollTrigger: { trigger: fill, start: "top 75%", once: true },
              },
            ),
          );
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=250%", pin: true, scrub: 1 },
        });
        fills.forEach((fill) => tl.fromTo(fill, { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 1 }));
        // Once the last line lands, the accent runs once through the three key words.
        tl.to(keys, { color: "var(--accent)", duration: 0.2, stagger: 0.15 }, "+=0.05").to(
          keys,
          { color: "var(--fg)", duration: 0.3, stagger: 0.15 },
          "+=0.1",
        );
        tl.to({}, { duration: 0.3 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="manifesto"
      aria-labelledby="manifesto-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden py-[clamp(88px,10vw,120px)]"
    >
      <div className="shell">
        <SectionHeader index={manifesto.index} label={manifesto.label} />
      </div>
      <h2 id="manifesto-title" className="sr-only">
        {manifesto.lines.map((l) => l.text).join(" ")}
      </h2>
      <div aria-hidden="true" className="shell flex flex-1 flex-col justify-center gap-[clamp(12px,2vw,28px)] py-10">
        {manifesto.lines.map((line) => (
          <p key={line.text} className="display relative text-[clamp(2.25rem,6.2vw,6.75rem)] leading-[0.95]">
            <span className="text-outline-strong block">{line.text}</span>
            <span data-fill className="absolute inset-0 block text-fg">
              <Keyed text={line.text} keyPhrase={line.key} flash />
            </span>
          </p>
        ))}
      </div>
    </section>
  );
}
