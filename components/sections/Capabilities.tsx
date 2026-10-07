"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, EASE_OUT, readConditions } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";

type GlyphKind = (typeof site.capabilities.items)[number]["glyph"];

function Glyph({ kind }: { kind: GlyphKind }) {
  const common = {
    className: "glyph h-16 w-24",
    viewBox: "0 0 96 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    "aria-hidden": true,
  } as const;

  switch (kind) {
    case "graph": {
      const nodes = [
        [14, 32], [38, 12], [38, 52], [62, 22], [82, 44],
      ];
      const edges = [
        [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [2, 4],
      ];
      return (
        <svg {...common}>
          {edges.map(([a, b], i) => (
            <line key={`l${i}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="var(--line-strong)" />
          ))}
          {edges.map(([a, b], i) => (
            <line
              key={`e${i}`}
              className="g-edge"
              x1={nodes[a][0]}
              y1={nodes[a][1]}
              x2={nodes[b][0]}
              y2={nodes[b][1]}
              stroke="var(--accent)"
              style={{ transitionDelay: `${i * 60}ms` }}
            />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={i} className="g-node" cx={x} cy={y} r={3.5} fill="var(--bg)" stroke="var(--fg)" style={{ transitionDelay: `${i * 70}ms` }} />
          ))}
        </svg>
      );
    }
    case "layers":
      return (
        <svg {...common}>
          {[16, 30, 44].map((y, i) => (
            <path
              key={y}
              className={`g-layer g-layer-${i + 1}`}
              d={`M48 ${y - 10} L80 ${y} L48 ${y + 10} L16 ${y} Z`}
              fill="var(--bg-elev)"
              stroke="var(--fg)"
            />
          ))}
        </svg>
      );
    case "scatter": {
      // Points converge onto the fit line y = 52 - 0.42x on hover.
      const pts = [
        [14, 26], [22, 52], [30, 30], [40, 48], [48, 18], [56, 40], [66, 14], [74, 34], [84, 22],
      ];
      return (
        <svg {...common}>
          <line x1="8" y1="58" x2="90" y2="58" stroke="var(--line-strong)" />
          <line x1="8" y1="6" x2="8" y2="58" stroke="var(--line-strong)" />
          <line className="g-fit" x1="10" y1="47.8" x2="90" y2="14.2" stroke="var(--accent)" />
          {pts.map(([x, y], i) => {
            const ty = 52 - 0.42 * x - y;
            return (
              <circle
                key={i}
                className="g-pt"
                cx={x}
                cy={y}
                r={2.2}
                fill="var(--fg)"
                stroke="none"
                style={{ ["--tx" as string]: "0px", ["--ty" as string]: `${ty}px`, transitionDelay: `${i * 40}ms` }}
              />
            );
          })}
        </svg>
      );
    }
    case "cursor":
      return (
        <svg {...common}>
          <rect x="10" y="10" width="76" height="44" rx="3" stroke="var(--line-strong)" />
          <circle className="g-ripple" cx="44" cy="30" r="14" stroke="var(--accent)" />
          <path className="g-pointer" d="M44 30 L44 48 L49 43 L53 51 L56 49.5 L52 42 L59 42 Z" fill="var(--fg)" stroke="var(--bg)" />
        </svg>
      );
  }
}

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const { capabilities } = site;

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-cap-card]");
      const mm = gsap.matchMedia();

      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isDesktop, isTablet, finePointer } = readConditions(ctx);
        if (reduceMotion) return;

        gsap.set(cards, { y: 60, opacity: 0 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: DUR_BASE + 0.2, ease: EASE_OUT, stagger: 0.1, overwrite: true }),
        });

        if (!finePointer || !(isDesktop || isTablet)) return;
        const maxTilt = isDesktop ? 6 : 3;
        const cleanups = cards.map((card) => {
          gsap.set(card, { transformPerspective: 800 });
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
          const setX = gsap.quickSetter(card, "--mx", "px");
          const setY = gsap.quickSetter(card, "--my", "px");
          let rect: DOMRect | null = null;

          const enter = () => {
            rect = card.getBoundingClientRect();
          };
          const move = (e: PointerEvent) => {
            if (!rect) rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setX(x);
            setY(y);
            ry(((x / rect.width) - 0.5) * 2 * maxTilt);
            rx(-((y / rect.height) - 0.5) * 2 * maxTilt);
          };
          const leave = () => {
            rect = null;
            rx(0);
            ry(0);
          };
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          return () => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          };
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="capabilities" aria-labelledby="cap-title" className="py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader index={capabilities.index} label={capabilities.label} />
        <SplitReveal as="h2" id="cap-title" className="display display-lg mt-[clamp(48px,7vw,96px)]">
          {capabilities.title}
        </SplitReveal>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 md:gap-5">
          {capabilities.items.map((item) => (
            <li
              key={item.index}
              data-cap-card
              className="cap-card group relative flex min-h-[320px] flex-col overflow-hidden rounded-[20px] border border-line bg-bg-elev p-7 transition-colors duration-300 hover:border-line-strong focus-visible:border-line-strong md:p-9"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* cursor spotlight */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(189,232,90,0.07), transparent 60%)",
                }}
              />
              <div className="relative flex items-start justify-between">
                <span className="mono">{item.index}</span>
                <span className="text-fg-dim transition-colors duration-300 group-hover:text-fg">
                  <Glyph kind={item.glyph} />
                </span>
              </div>
              <h3 className="display relative mt-auto pt-16 text-[clamp(1.75rem,2.6vw,2.5rem)] uppercase">{item.title}</h3>
              <p className="prose-body relative mt-4 text-[16px] leading-[1.6]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
