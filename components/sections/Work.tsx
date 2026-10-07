"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { site, type ProjectVisual } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, DUR_REVEAL, EASE_OUT, EASE_SNAP, readConditions, STAGGER_CHARS } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";
import Rich from "@/components/ui/Rich";

export type VisualProps = { active: boolean };

const VisualFallback = () => <div className="h-full w-full" aria-hidden="true" />;
const visuals: Record<ProjectVisual, ComponentType<VisualProps>> = {
  thinksync: dynamic(() => import("@/components/work/visuals/ThinkSyncVisual"), { ssr: false, loading: VisualFallback }),
  finax: dynamic(() => import("@/components/work/visuals/FinaxVisual"), { ssr: false, loading: VisualFallback }),
  lexiq: dynamic(() => import("@/components/work/visuals/LexiqVisual"), { ssr: false, loading: VisualFallback }),
};

const realHref = (href?: string) => (href && !href.startsWith("[") ? href : undefined);

/** Mounts children only once the element is near the viewport. */
function WhenNear({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "60% 0px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {near && children}
    </div>
  );
}

/** Rolling odometer digit for the section header counter. */
function Odometer({ value, total }: { value: number; total: number }) {
  const reel = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    gsap.to(reel.current, { yPercent: -10 * value, duration: reduce ? 0 : DUR_BASE, ease: EASE_SNAP });
  }, [value]);
  return (
    <span className="whitespace-nowrap tabular-nums text-fg">
      0
      <span className="relative inline-block h-[1.4em] overflow-hidden align-top">
        <span ref={reel} className="flex flex-col">
          {Array.from({ length: 10 }, (_, d) => (
            <span key={d} className="h-[1.4em]">
              {d}
            </span>
          ))}
        </span>
      </span>
      <span className="text-fg-dim"> / {String(total).padStart(2, "0")}</span>
    </span>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const { work, projects } = site;

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]");
      const sentinels = gsap.utils.toArray<HTMLElement>("[data-work-sentinel]");
      const list = root.current!.querySelector("[data-work-list]");

      // Which card is "active" (drives visuals + odometer) at every breakpoint.
      sentinels.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: s,
          start: "top 60%",
          endTrigger: sentinels[i + 1] ?? list,
          end: sentinels[i + 1] ? "top 60%" : "bottom 40%",
          onToggle: (self) => self.isActive && setActive(i),
          onLeaveBack: () => i === 0 && setActive(-1),
        });
      });

      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isMobile } = readConditions(ctx);
        if (reduceMotion) return;

        if (isMobile) {
          cards.forEach((card) =>
            gsap.from(card, {
              y: 48,
              opacity: 0,
              duration: DUR_BASE,
              ease: EASE_OUT,
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
            }),
          );
          return;
        }

        // Stacked cards: the card underneath recedes as the next slides over.
        cards.forEach((card, i) => {
          const next = sentinels[i + 1];
          if (!next) return;
          const inner = card.querySelector("[data-work-inner]");
          const dim = card.querySelector("[data-work-dim]");
          gsap
            .timeline({
              scrollTrigger: { trigger: next, start: "top bottom", end: "top top+=120", scrub: true },
            })
            .to(inner, { scale: 0.92, ease: "none", transformOrigin: "50% 0%" }, 0)
            .to(dim, { opacity: 0.5, ease: "none" }, 0);
        });

        // Titles: chars rise once, the first time each card becomes active.
        const splits = cards.map((card) => {
          const title = card.querySelector<HTMLElement>("[data-work-title]")!;
          const split = SplitText.create(title, { type: "lines,chars", mask: "lines", aria: "auto" });
          const chips = card.querySelectorAll("[data-chip]");
          gsap.set(split.chars, { yPercent: 110 });
          gsap.set(chips, { opacity: 0, y: 10 });
          ScrollTrigger.create({
            trigger: card,
            start: "top 65%",
            once: true,
            onEnter: () => {
              gsap.to(split.chars, { yPercent: 0, duration: DUR_REVEAL, ease: EASE_OUT, stagger: STAGGER_CHARS });
              gsap.to(chips, { opacity: 1, y: 0, duration: 0.6, ease: EASE_OUT, stagger: 0.04, delay: 0.3 });
            },
          });
          return split;
        });
        return () => splits.forEach((s) => s.revert());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader
          index={work.index}
          label={work.label}
          extra={<Odometer value={Math.max(0, active) + 1} total={projects.length} />}
        />
        <SplitReveal as="h2" id="work-title" className="display display-lg mt-[clamp(48px,7vw,96px)]">
          {work.title}
        </SplitReveal>
      </div>

      <ol data-work-list className="shell mt-14 flex flex-col gap-6 md:gap-[12vh]">
        {projects.map((p, i) => {
          const Visual = visuals[p.visual];
          const links = [
            { label: "Case study", href: realHref(p.links.caseStudy), icon: ArrowRight, external: false },
            { label: "GitHub", href: realHref(p.links.github), icon: ArrowUpRight, external: true },
            { label: "Live", href: realHref(p.links.live), icon: ArrowUpRight, external: true },
          ];
          return (
            <li key={p.slug} className="contents">
              <span data-work-sentinel aria-hidden="true" className="block h-0" />
              <article
                data-work-card
                aria-labelledby={`work-${p.slug}`}
                className="work-card"
                style={{ ["--stack-i" as string]: i }}
              >
                <div
                  data-work-inner
                  className="relative grid h-full overflow-hidden rounded-[24px] border border-line bg-bg-elev md:grid-cols-[40%_60%]"
                >
                  <div className="relative z-[1] flex flex-col p-7 md:p-10">
                    <p className="mono">
                      <span className="text-fg">{p.index}</span> / {String(projects.length).padStart(2, "0")}
                    </p>
                    <h3
                      id={`work-${p.slug}`}
                      data-work-title
                      className="display mt-8 text-[clamp(2rem,3.4vw,3.5rem)] uppercase"
                    >
                      {p.title}
                    </h3>
                    <p className="mt-4 text-[clamp(1.05rem,1.3vw,1.25rem)] font-medium text-fg">{p.tagline}</p>
                    <p className="prose-body mt-4 text-[15px] leading-[1.6]">
                      <Rich text={p.description} />
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
                      {p.stack.map((s) => (
                        <li
                          key={s}
                          data-chip
                          className="mono mono-sm rounded-full border border-line-strong px-2.5 py-1 text-fg-muted"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-8">
                      {links.map(({ label, href, icon: Icon, external }) =>
                        href ? (
                          <a
                            key={label}
                            href={href}
                            className="mono inline-flex items-center gap-1.5 text-fg underline-offset-4 hover:text-accent hover:underline"
                            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                          >
                            {label}
                            <Icon size={13} aria-hidden="true" />
                            <span className="sr-only">— {p.title}</span>
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>

                  <WhenNear className="relative min-h-[300px] border-t border-line md:min-h-0 md:border-l md:border-t-0">
                    <Visual active={active === i} />
                  </WhenNear>

                  <div
                    data-work-dim
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[2] bg-black opacity-0"
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
