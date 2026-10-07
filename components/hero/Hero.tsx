"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";
import {
  CONDITIONS,
  DUR_REVEAL,
  EASE_INOUT,
  EASE_OUT,
  readConditions,
  SCRAMBLE_CHARS,
  STAGGER_ITEMS,
  STAGGER_WORDS,
} from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Rich from "@/components/ui/Rich";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowDownRight, Github } from "lucide-react";
import Preloader from "./Preloader";
import VectorWordmark, { type VectorWordmarkHandle } from "./VectorWordmark";

const INTRO_KEY = "nishok:intro";
const COUNTER_STEPS = ["000", "012", "027", "041", "058", "073", "086", "100"];

type Props = {
  /** Resolved next/font family string for the display face. */
  fontFamily: string;
};

export default function Hero({ fontFamily }: Props) {
  const root = useRef<HTMLElement>(null);
  const preloader = useRef<HTMLDivElement>(null);
  const wordmark = useRef<VectorWordmarkHandle>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const played = useRef(false);

  useGSAP(
    () => {
      const html = document.documentElement;
      const mm = gsap.matchMedia();

      mm.add(CONDITIONS, (ctx) => {
        const { reduceMotion, isMobile } = readConditions(ctx);
        let skip: (e: Event) => void = () => undefined;

        const finish = () => {
          played.current = true;
          try {
            sessionStorage.setItem(INTRO_KEY, "1");
          } catch {
            /* storage unavailable: intro simply plays again next time */
          }
          html.classList.remove("intro", "intro-lock");
          lenisRef.current?.start();
          gsap.set(document.querySelectorAll("[data-hero-hide]"), { autoAlpha: 1 });
          if (preloader.current) gsap.set(preloader.current, { display: "none" });
          window.removeEventListener("pointerdown", skip);
          window.removeEventListener("keydown", skip);
          requestAnimationFrame(() => ScrollTrigger.refresh());
        };

        // Reduced motion, or a breakpoint change after the intro already ran.
        if (reduceMotion || played.current) {
          if (wordmark.current) {
            wordmark.current.reveal.value = 1;
            gsap.set(wordmark.current.labels(), { opacity: 0.6 });
          }
          finish();
          if (reduceMotion) return;
        }

        /* ── Intro master timeline (once) ────────────────────────── */
        let splits: SplitText[] = [];
        if (!played.current) {
          // Safety timeout fallback: guarantee finish() is called even if animations stall
          const timer = setTimeout(() => {
            if (!played.current) finish();
          }, 4000);

          try {
            const isIntro = html.classList.contains("intro");
            const tl = gsap.timeline({
              defaults: { ease: EASE_OUT },
              onComplete: () => {
                clearTimeout(timer);
                finish();
              },
            });
            skip = (e: Event) => {
              if (e instanceof KeyboardEvent && !["Escape", "Enter", " "].includes(e.key)) return;
              clearTimeout(timer);
              tl.progress(1);
            };
            window.addEventListener("pointerdown", skip);
            window.addEventListener("keydown", skip);

            let t0 = 0.1;
            if (isIntro && preloader.current) {
              const count = preloader.current.querySelector("[data-preloader-count]");
              const line = preloader.current.querySelector("[data-preloader-line]");
              tl.to(line, { scaleX: 1, duration: 1.2, ease: EASE_INOUT }, 0);
              COUNTER_STEPS.forEach((value, i) => {
                tl.to(
                  count,
                  { duration: 0.14, scrambleText: { text: value, chars: "0123456789", speed: 1 }, ease: "none" },
                  i * (1.1 / COUNTER_STEPS.length),
                );
              });
              tl.to(preloader.current, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: EASE_INOUT }, 1.2);
              t0 = 1.6;
            }

            // Wordmark wipe + coordinate labels.
            const wm = wordmark.current;
            tl.set("[data-hero-wordmark]", { visibility: "visible" }, t0);
            if (wm) {
              tl.fromTo(wm.reveal, { value: 0 }, { value: 1, duration: 1, ease: EASE_INOUT }, t0);
              tl.fromTo(wm.labels(), { opacity: 0 }, { opacity: 0.6, duration: 0.6, stagger: 0.12 }, t0 + 0.5);
            }

            // Copy.
            const tCopy = t0 + 0.6;
            const headline = root.current!.querySelector<HTMLElement>("[data-hero-headline]");
            const sub = root.current!.querySelector<HTMLElement>("[data-hero-sub]");
            if (headline && sub) {
              const headSplit = SplitText.create(headline, { type: "lines,words", mask: "lines", aria: "none" });
              const subSplit = SplitText.create(sub, { type: "lines", mask: "lines", aria: "none" });
              splits = [headSplit, subSplit];
              tl.from(headSplit.words, { yPercent: 110, duration: DUR_REVEAL, stagger: STAGGER_WORDS }, tCopy);
              tl.from(subSplit.lines, { yPercent: 110, duration: DUR_REVEAL, stagger: STAGGER_WORDS }, tCopy + 0.15);
            }

            const navItems = document.querySelectorAll("[data-nav-item]");
            tl.set("[data-hero-copy], [data-hero-meta], [data-hero-header]", { visibility: "visible" }, tCopy);
            tl.fromTo(
              navItems,
              { y: -20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.8, stagger: STAGGER_ITEMS },
              tCopy + 0.1,
            );
            root.current!.querySelectorAll<HTMLElement>("[data-hero-tag]").forEach((tag, i) => {
              const text = tag.dataset.heroTag!;
              tl.fromTo(
                tag,
                { opacity: 0 },
                { opacity: 1, duration: 0.6, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.8 }, ease: "none" },
                tCopy + 0.2 + i * 0.12,
              );
            });
            tl.from("[data-hero-meta], [data-hero-header]", { opacity: 0, duration: 0.6, stagger: 0.1 }, tCopy + 0.4);
            tl.from(
              "[data-hero-ctas] > *",
              { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "back.out(1.6)" },
              tCopy + 0.45,
            );
            // Splits exist only for the intro; restore clean text afterwards.
            tl.call(() => splits.forEach((sp) => sp.revert()));
          } catch (err) {
            console.error("Hero intro animation error:", err);
            clearTimeout(timer);
            finish();
          }
        }

        // Scroll cue bob (independent loop).
        gsap.to("[data-scroll-cue]", { y: 6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 });

        /* ── Scroll-out: hero pins while the next section slides over ── */
        if (!isMobile) {
          const out = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=100%",
              pin: true,
              pinSpacing: false,
              scrub: true,
            },
          });
          out
            .to("[data-hero-wordmark]", { scale: 0.85, opacity: 0.15, ease: "none", duration: 0.6 }, 0)
            .to("[data-hero-headline]", { y: -120, ease: "none", duration: 0.6 }, 0)
            .to("[data-hero-sub]", { y: -200, ease: "none", duration: 0.6 }, 0)
            .to("[data-hero-tags]", { y: -60, ease: "none", duration: 0.6 }, 0)
            .to("[data-hero-ctas]", { y: -90, autoAlpha: 0, ease: "none", duration: 0.5 }, 0)
            .to({}, { duration: 0.4 });

          const sheet = document.querySelector<HTMLElement>("[data-sheet]");
          if (sheet) {
            gsap.fromTo(
              sheet,
              { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                ease: "none",
                scrollTrigger: { trigger: sheet, start: "top bottom", end: "top top", scrub: true },
              },
            );
          }
        }

        return () => {
          window.removeEventListener("pointerdown", skip);
          window.removeEventListener("keydown", skip);
          splits.forEach((sp) => sp.revert());
        };
      });
    },
    { scope: root },
  );

  const { hero } = site;

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-bg md:h-[100svh]"
    >
      <Preloader ref={preloader} />
      <h1 id="hero-title" className="sr-only">
        {hero.srTitle}
      </h1>

      <div
        data-hero-wordmark
        data-hero-hide
        className="relative h-[70svh] md:absolute md:inset-0 md:h-full"
      >
        <VectorWordmark
          ref={wordmark}
          text={hero.wordmark}
          font={{ fontFamily, fontWeight: 800, fontSize: "300px", letterSpacing: "-0.04em" }}
          background="#0A0A0A"
          textColor="#F2F2F2"
          shade="#1A1A1A"
          accent="rgba(189,232,90,0.55)"
          reach={320}
          speed={45}
          damping={55}
          handles={{ size: 96, spread: 26, labels: true }}
          initialReveal={1}
          className="h-full"
        />
      </div>

      <div className="shell pointer-events-none absolute inset-x-0 top-0 z-[3] pt-[calc(var(--nav-h)+4px)]">
        <div data-hero-header data-hero-hide className="pointer-events-auto">
          <SectionHeader index={hero.index} label={hero.label} />
        </div>
      </div>

      <div className="shell pointer-events-none relative z-[3] flex flex-col pb-6 md:absolute md:inset-x-0 md:bottom-0">
        <div className="grid items-end gap-6 md:grid-cols-12">
          <div data-hero-copy data-hero-hide className="md:col-span-6">
            <p
              data-hero-headline
              className="display max-w-[16ch] text-[clamp(2rem,3.6vw,3.5rem)] leading-[0.95] text-fg"
            >
              {hero.headline}
            </p>
          </div>
          <div data-hero-copy data-hero-hide className="md:col-span-5 md:col-start-8">
            <p data-hero-sub className="prose-body text-[15px] leading-[1.55]">
              <Rich text={hero.sub} />
            </p>
            <ul data-hero-tags className="mono mt-5 flex flex-wrap gap-x-2 gap-y-1 text-fg" aria-label="Focus areas">
              {hero.tags.map((tag, i) => (
                <li key={tag} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true" className="text-accent">•</span>}
                  <span data-hero-tag={tag}>{tag}</span>
                </li>
              ))}
            </ul>
            <div data-hero-ctas className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
              <MagneticButton
                as="a"
                href="#work"
                onClick={(e: React.MouseEvent) => {
                  if (!lenis) return;
                  e.preventDefault();
                  lenis.scrollTo("#work", { offset: -8 });
                }}
                className="group items-center gap-2 rounded-full bg-accent px-5 py-3 text-[14px] font-semibold text-bg transition-transform active:scale-[0.97]"
              >
                View selected work
                <ArrowDownRight size={16} strokeWidth={2} aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-[-45deg]" />
              </MagneticButton>
              <MagneticButton
                as="a"
                href={site.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="items-center gap-2 rounded-full border border-line-strong bg-bg/60 px-5 py-3 text-[14px] font-medium text-fg backdrop-blur-md transition-colors hover:border-accent hover:text-accent active:scale-[0.97]"
              >
                <Github size={16} strokeWidth={2} aria-hidden="true" />
                GitHub
              </MagneticButton>
            </div>
          </div>
        </div>

        <div data-hero-meta data-hero-hide className="mono mt-8 flex items-center justify-between">
          <span>
            {hero.meta} &nbsp;/&nbsp; Based in {site.city}
          </span>
          <span className="flex items-center gap-2">
            <span data-scroll-cue aria-hidden="true" className="inline-block text-accent">
              ↓
            </span>
            {hero.scrollCue}
          </span>
        </div>
      </div>
    </section>
  );
}
