"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, EASE_OUT, readConditions, SCRAMBLE_CHARS } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Approach() {
  const root = useRef<HTMLElement>(null);
  const { approach } = site;
  const steps = approach.steps;

  useGSAP(
    () => {
      const section = root.current!;
      const track = section.querySelector<HTMLElement>("[data-track]")!;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]");
      const nums = gsap.utils.toArray<HTMLElement>("[data-num]");
      const readout = section.querySelector<HTMLElement>("[data-readout]")!;
      const svg = section.querySelector<SVGSVGElement>("[data-path-svg]")!;
      const dashed = svg.querySelector<SVGPathElement>("[data-path]")!;
      const reveal = svg.querySelector<SVGPathElement>("[data-path-mask]")!;
      const ghost = svg.querySelector<SVGPathElement>("[data-path-ghost]")!;

      const setActive = (index: number, animate: boolean) => {
        nodes.forEach((n, i) => (i <= index ? n.setAttribute("data-active", "") : n.removeAttribute("data-active")));
        const label = `Stage ${index + 1}/${steps.length} — ${steps[index].title}`;
        if (animate) {
          gsap.to(readout, { duration: 0.5, scrambleText: { text: label, chars: SCRAMBLE_CHARS, speed: 0.8 }, overwrite: true });
          gsap.fromTo(
            nums[index],
            { scrambleText: { text: "00", chars: "0123456789" } },
            { duration: 0.6, scrambleText: { text: pad(index + 1), chars: "0123456789", speed: 0.6 } },
          );
        } else {
          readout.textContent = label;
        }
      };

      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isMobile } = readConditions(ctx);

        if (reduceMotion) {
          nodes.forEach((n) => n.setAttribute("data-active", ""));
          return;
        }

        /* ── Mobile: vertical timeline, reveal as steps enter ── */
        if (isMobile) {
          panels.forEach((panel, i) => {
            gsap.from(panel.querySelectorAll("[data-panel-copy] > *"), {
              yPercent: 40,
              opacity: 0,
              duration: DUR_BASE,
              ease: EASE_OUT,
              stagger: 0.08,
              scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                once: true,
                onEnter: () => nodes[i].setAttribute("data-active", ""),
              },
            });
          });
          return () => nodes.forEach((n) => n.removeAttribute("data-active"));
        }

        /* ── Tablet / desktop: pinned horizontal pipeline ── */
        section.setAttribute("data-mode", "track");

        // Build the connecting path through node centres (in track space).
        const buildPath = () => {
          const w = track.scrollWidth;
          const h = track.offsetHeight;
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
          svg.style.width = `${w}px`;
          svg.style.height = `${h}px`;
          const pts = nodes.map((n) => {
            // offsetLeft/Top relative to the track (panels are its children).
            const panel = n.closest<HTMLElement>("[data-panel]")!;
            return { x: panel.offsetLeft + n.offsetLeft + n.offsetWidth / 2, y: panel.offsetTop + n.offsetTop + n.offsetHeight / 2 };
          });
          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const mx = (a.x + b.x) / 2;
            const bend = i % 2 ? -36 : 36;
            d += ` C ${mx} ${a.y + bend}, ${mx} ${b.y + bend}, ${b.x} ${b.y}`;
          }
          dashed.setAttribute("d", d);
          ghost.setAttribute("d", d);
          reveal.setAttribute("d", d);
          const len = reveal.getTotalLength();
          reveal.style.strokeDasharray = `${len}`;
          return len;
        };

        let length = buildPath();
        let current = -1;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              length = buildPath();
            },
            onUpdate: (self) => {
              const index = Math.min(steps.length - 1, Math.round(self.progress * (steps.length - 1)));
              if (index !== current) {
                current = index;
                setActive(index, true);
              }
            },
          },
        });
        tl.to(track, { x: () => -distance() }, 0).fromTo(
          reveal,
          { strokeDashoffset: () => length },
          { strokeDashoffset: 0 },
          0,
        );

        setActive(0, false);
        current = 0;

        return () => {
          section.removeAttribute("data-mode");
          nodes.forEach((n) => n.removeAttribute("data-active"));
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="approach"
      aria-labelledby="approach-title"
      className="approach relative flex min-h-[100svh] flex-col overflow-hidden py-[clamp(96px,10vw,140px)]"
    >
      <div className="shell">
        <SectionHeader index={approach.index} label={approach.label} />
        <div className="mt-[clamp(40px,5vw,72px)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SplitReveal as="h2" id="approach-title" className="display display-lg">
            {approach.title}
          </SplitReveal>
          <p className="prose-body max-w-[34ch] text-[clamp(1.05rem,1.4vw,1.25rem)] text-fg">{approach.intro}</p>
        </div>
        <p data-readout aria-hidden="true" className="mono mt-10 hidden text-accent md:block">
          Stage 1/{steps.length} — {steps[0].title}
        </p>
      </div>

      <div className="mt-10 flex-1 md:mt-14">
        <div data-track role="list" className="approach-track shell md:max-w-none">
          <svg
            data-path-svg
            aria-hidden="true"
            className="approach-path pointer-events-none absolute left-0 top-0 overflow-visible"
          >
            <defs>
              <mask id="approach-mask" maskUnits="userSpaceOnUse">
                <path data-path-mask fill="none" stroke="#fff" strokeWidth="6" />
              </mask>
            </defs>
            <path fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 6" data-path-ghost />
            <path data-path fill="none" stroke="var(--accent)" strokeWidth="1.25" strokeDasharray="4 6" mask="url(#approach-mask)" />
          </svg>

          {steps.map((step, i) => (
            <div key={step.title} role="listitem" data-panel className="approach-panel">
              <span data-node className="approach-node mt-1" aria-hidden="true" />
              <div data-panel-copy className="md:mt-10">
                <span
                  data-num
                  aria-hidden="true"
                  className="block font-mono text-[clamp(3.5rem,9vw,8.5rem)] font-medium leading-none tracking-[-0.04em] text-fg"
                >
                  {pad(i + 1)}
                </span>
                <h3 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="prose-body mt-3 max-w-[30ch] text-[clamp(1rem,1.3vw,1.2rem)]">{step.body}</p>

                {i === steps.length - 1 && (
                  <div className="mt-8 flex items-center gap-3 text-accent" aria-hidden="true">
                    <svg width="96" height="40" viewBox="0 0 96 40" fill="none" stroke="currentColor" strokeWidth="1.25">
                      <path d="M90 30 C 90 6, 20 2, 10 24" strokeDasharray="4 5" />
                      <path d="M4 16 L10 25 L19 19" />
                    </svg>
                    <span className="mono text-accent">
                      ↺ {approach.loopLabel} → 01 {steps[0].title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
