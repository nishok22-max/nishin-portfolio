"use client";

import Image from "next/image";
import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, DUR_SLOW, EASE_INOUT, EASE_OUT, STAGGER_ITEMS } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";
import Rich from "@/components/ui/Rich";

const CORNERS = [
  { pos: "left-0 top-0", border: "border-l border-t", from: { x: -14, y: -14 } },
  { pos: "right-0 top-0", border: "border-r border-t", from: { x: 14, y: -14 } },
  { pos: "left-0 bottom-0", border: "border-l border-b", from: { x: -14, y: 14 } },
  { pos: "right-0 bottom-0", border: "border-r border-b", from: { x: 14, y: 14 } },
];

export default function About() {
  const root = useRef<HTMLElement>(null);
  const { about } = site;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        const frame = root.current!.querySelector("[data-portrait]");
        const tl = gsap.timeline({
          defaults: { ease: EASE_OUT },
          scrollTrigger: { trigger: frame, start: "top 80%", once: true },
        });
        tl.fromTo("[data-portrait-clip]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR_SLOW, ease: EASE_INOUT })
          .from("[data-portrait-img]", { scale: 1.3, duration: DUR_SLOW + 0.4 }, 0)
          .from("[data-corner]", {
            x: (i) => CORNERS[i].from.x,
            y: (i) => CORNERS[i].from.y,
            opacity: 0,
            duration: DUR_BASE,
            stagger: STAGGER_ITEMS,
          }, 0.4)
          .from("[data-dim]", { opacity: 0, duration: DUR_BASE, stagger: 0.1 }, 0.7);

        gsap.utils.toArray<HTMLElement>("[data-underline]").forEach((el) => {
          gsap.fromTo(
            el,
            { "--u": "0%" },
            { "--u": "100%", duration: DUR_SLOW, ease: EASE_INOUT, scrollTrigger: { trigger: el, start: "top 80%", once: true } },
          );
        });

        gsap.from("[data-about-p]", {
          opacity: 0,
          y: 24,
          duration: DUR_BASE,
          ease: EASE_OUT,
          stagger: STAGGER_ITEMS,
          scrollTrigger: { trigger: "[data-about-copy]", start: "top 80%", once: true },
        });
      });
    },
    { scope: root },
  );

  // Subtle RGB split on hover (SVG filter offsets tweened via attr).
  const split = contextSafe((on: boolean) => {
    if (window.matchMedia(CONDITIONS.reduceMotion).matches) return;
    const target = root.current!.querySelector<HTMLElement>("[data-portrait-img]")!;
    if (on) target.style.filter = "url(#about-rgb)";
    gsap.to("#about-rgb-r", { attr: { dx: on ? 5 : 0 }, duration: 0.5, ease: EASE_OUT, overwrite: true });
    gsap.to("#about-rgb-b", {
      attr: { dx: on ? -5 : 0, dy: on ? 2 : 0 },
      duration: 0.5,
      ease: EASE_OUT,
      overwrite: true,
      onComplete: () => {
        if (!on) target.style.filter = "";
      },
    });
  });

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="py-[clamp(96px,12vw,180px)]">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="about-rgb" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
          <feOffset id="about-rgb-r" in="r" dx="0" dy="0" result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
          <feOffset id="about-rgb-b" in="b" dx="0" dy="0" result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" />
        </filter>
      </svg>

      <div className="shell">
        <SectionHeader index={about.index} label={about.label} />

        <div className="mt-[clamp(48px,7vw,96px)] grid gap-14 md:grid-cols-12 md:gap-8">
          {/* CAD frame portrait */}
          <figure
            data-portrait
            className="relative mx-auto w-full max-w-[480px] p-5 md:col-span-5 md:mx-0"
            onPointerEnter={() => split(true)}
            onPointerLeave={() => split(false)}
          >
            {CORNERS.map((c, i) => (
              <span key={i} data-corner aria-hidden="true" className={`absolute h-5 w-5 border-fg ${c.pos} ${c.border}`} />
            ))}

            <div data-dim aria-hidden="true" className="mono mono-sm absolute inset-x-5 -top-3 flex items-center gap-2">
              <span className="h-2 w-px bg-fg-dim" />
              <span className="h-px flex-1 bg-line-strong" />
              W: 480
              <span className="h-px flex-1 bg-line-strong" />
              <span className="h-2 w-px bg-fg-dim" />
            </div>
            <div
              data-dim
              aria-hidden="true"
              className="mono mono-sm absolute inset-y-5 -right-3 flex flex-col items-center gap-2 [writing-mode:vertical-rl]"
            >
              <span className="h-px w-2 bg-fg-dim" />
              <span className="w-px flex-1 bg-line-strong" />
              H: 600
              <span className="w-px flex-1 bg-line-strong" />
              <span className="h-px w-2 bg-fg-dim" />
            </div>

            <div data-portrait-clip className="relative aspect-[4/5] overflow-hidden bg-bg-elev">
              <div data-portrait-img className="absolute inset-0">
                {about.portrait ? (
                  <Image
                    src={about.portrait}
                    alt={about.portraitAlt}
                    fill
                    sizes="(min-width: 768px) 40vw, 90vw"
                    className="object-cover object-[50%_12%] grayscale"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`${about.portraitAlt} (placeholder)`}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 50% 20%, #2a2a2a 0%, #151515 55%, #0d0d0d 100%)",
                    }}
                  >
                    <span className="display text-outline-strong select-none text-[clamp(8rem,22vw,18rem)] leading-none">
                      N
                    </span>
                    <span className="mono mono-sm absolute bottom-4 left-4">Portrait — placeholder</span>
                  </div>
                )}
              </div>
              {/* crosshair */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.18)_0_4px,transparent_4px_10px)]" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.18)_0_4px,transparent_4px_10px)]" />
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-accent" />
              </div>
            </div>
            <figcaption className="mono mono-sm mt-3 flex justify-between">
              <span>Fig. 01 — {site.name}</span>
              <span>{site.hero.meta}</span>
            </figcaption>
          </figure>

          <div data-about-copy className="md:col-span-6 md:col-start-7">
            <SplitReveal as="h2" id="about-title" className="display display-lg">
              {about.title}
            </SplitReveal>
            <div className="mt-10 space-y-6 text-[clamp(1.05rem,1.3vw,1.2rem)]">
              {about.paragraphs.map((p, i) => (
                <p key={i} data-about-p className="prose-body">
                  <Rich text={p} underline={i === 2} />
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
