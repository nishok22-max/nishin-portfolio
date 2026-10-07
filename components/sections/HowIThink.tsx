"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS, DUR_BASE, EASE_OUT, readConditions } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";

/* Static per-letter misalignment for the "rough" state (baseline in em). */
const ROUGH_OFFSETS = [0.06, -0.04, 0.02, -0.07, 0.05, -0.02, 0.08, -0.05];

export default function HowIThink() {
  const root = useRef<HTMLElement>(null);
  const { thinking } = site;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isMobile } = readConditions(ctx);
        if (reduceMotion) return;

        // Always-on subtle jitter on the rough letters while visible.
        const jitter = gsap.to("[data-rough-char]", {
          x: () => gsap.utils.random(-1.5, 1.5),
          y: () => gsap.utils.random(-1.5, 1.5),
          duration: 0.12,
          ease: "steps(1)",
          repeat: -1,
          repeatRefresh: true,
          paused: true,
        });

        const tags = gsap.utils.toArray<HTMLElement>("[data-fail]");
        const checks = gsap.utils.toArray<HTMLElement>("[data-check]");

        if (isMobile) {
          gsap.set(checks, { opacity: 0 });
          gsap.from("[data-think-block]", {
            y: 40,
            opacity: 0,
            duration: DUR_BASE,
            ease: EASE_OUT,
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 70%", once: true, onEnter: () => jitter.play() },
          });
          tags.forEach((tag, i) =>
            gsap.to(checks[i], {
              opacity: 1,
              duration: 0.3,
              scrambleText: { text: "✓", chars: "×✓/" },
              scrollTrigger: { trigger: tag, start: "top 80%", once: true },
            }),
          );
          return;
        }

        /* ── Pinned, scrubbed sequence ─────────────────────────── */
        gsap.set(checks, { opacity: 0 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 1,
            onToggle: (self) => (self.isActive ? jitter.play() : jitter.pause()),
          },
        });

        // 1 → 2: the phrases start together, then physically separate.
        tl.from("[data-rough]", { y: "18vh", duration: 1 }, 0)
          .from("[data-clean]", { y: "-18vh", opacity: 0, duration: 1 }, 0)
          .from("[data-and]", { opacity: 0, duration: 0.4 }, 0.2)
          .from("[data-gap-line]", { scaleX: 0, duration: 0.8 }, 0.5)
          .from("[data-gap-label]", { opacity: 0, duration: 0.4 }, 0.8)
          // 3: failure modes land in the gap…
          .from(tags, { opacity: 0, y: 16, stagger: 0.15, duration: 0.4 }, 1.1);
        // 4: …and each gets stamped ✓.
        checks.forEach((c, i) => {
          tl.to(c, { opacity: 1, duration: 0.15, scrambleText: { text: "✓", chars: "×✓/" } }, 1.9 + i * 0.18);
          tl.to(tags[i], { borderColor: "var(--accent)", color: "var(--fg)", duration: 0.15 }, "<");
        });
        tl.from("[data-think-body]", { opacity: 0, y: 24, duration: 0.5 }, ">");
      });
    },
    { scope: root },
  );

  const roughChars = [...thinking.rough];

  return (
    <section
      ref={root}
      id="thinking"
      aria-labelledby="think-title"
      className="relative flex min-h-[100svh] flex-col py-[clamp(88px,10vw,120px)]"
    >
      <div className="shell">
        <SectionHeader index={thinking.index} label={thinking.label} />
      </div>

      <div className="shell flex flex-1 flex-col items-center justify-center text-center">
        <h2 id="think-title" className="sr-only">
          {thinking.before} “{thinking.rough}” {thinking.and} “{thinking.clean}”
        </h2>

        <p data-think-block aria-hidden="true" className="mono mt-10">
          {thinking.before}
        </p>

        <p
          data-think-block
          data-rough
          aria-hidden="true"
          className="mt-6 font-mono text-[clamp(2.5rem,7vw,6.5rem)] font-medium leading-none tracking-[-0.03em] text-fg-muted"
        >
          “
          {roughChars.map((ch, i) => (
            <span
              key={i}
              data-rough-char
              className="relative inline-block"
              style={{ top: `${ROUGH_OFFSETS[i % ROUGH_OFFSETS.length]}em`, rotate: `${(i % 3) - 1}deg` }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
          ”
        </p>

        {/* The gap */}
        <div data-think-block className="relative my-8 w-full max-w-[880px] md:my-10">
          <div aria-hidden="true" className="flex items-center gap-3">
            <span data-and className="mono">{thinking.and}</span>
            <span data-gap-line className="relative h-px flex-1 origin-center bg-fg-dim">
              <span className="absolute -top-1 left-0 h-2 w-px bg-fg-dim" />
              <span className="absolute -top-1 right-0 h-2 w-px bg-fg-dim" />
            </span>
            <span data-gap-label className="mono text-accent">
              ← {thinking.gapLabel} →
            </span>
            <span data-gap-line className="relative h-px flex-1 origin-center bg-fg-dim">
              <span className="absolute -top-1 right-0 h-2 w-px bg-fg-dim" />
            </span>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="What a product has to handle">
            {thinking.failures.map((f) => (
              <li
                key={f}
                data-fail
                className="mono flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-fg-muted"
              >
                <span data-check aria-hidden="true" className="inline-block w-3 text-accent">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p
          data-think-block
          data-clean
          aria-hidden="true"
          className="display text-[clamp(2.5rem,7.5vw,7.5rem)] leading-[0.95] text-fg"
        >
          “{thinking.clean}”
        </p>

        <p data-think-block data-think-body className="prose-body mx-auto mt-12 text-[clamp(1.05rem,1.4vw,1.25rem)]">
          {thinking.body}
        </p>
      </div>
    </section>
  );
}
