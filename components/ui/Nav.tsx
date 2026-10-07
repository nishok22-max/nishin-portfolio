"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { site } from "@/content/site";
import { Flip, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "@/lib/lenis";
import { CONDITIONS, DUR_BASE, DUR_FAST, EASE_OUT, EASE_SNAP, STAGGER_ITEMS } from "@/lib/motion";
import MagneticButton from "./MagneticButton";
import ScrambleLink from "./ScrambleLink";

type FlipState = ReturnType<typeof Flip.getState>;

export default function Nav() {
  const lenis = useLenis();
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const flipState = useRef<FlipState | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  openRef.current = open;

  const changeActive = useCallback((id: string | null) => {
    setActive((prev) => {
      if (prev === id) return prev;
      flipState.current = Flip.getState("[data-flip-id='nav-dot']");
      return id;
    });
  }, []);

  // Move the accent dot between links with Flip after React re-renders.
  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || window.matchMedia(CONDITIONS.reduceMotion).matches) return;
    Flip.from(state, { duration: DUR_BASE, ease: EASE_SNAP, targets: "[data-flip-id='nav-dot']" });
  }, [active]);

  useGSAP(
    (_ctx, contextSafe) => {
      // Active section tracking. The page segment can hydrate after the
      // layout, so wait until every target section exists.
      let raf = 0;
      let tries = 0;
      const track = contextSafe!(() => {
        const ready = site.nav.every(({ id }) => document.getElementById(id));
        if (!ready && tries++ < 120) {
          raf = requestAnimationFrame(track);
          return;
        }
        site.nav.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) changeActive(id);
              else if (self.direction === -1 && id === site.nav[0].id) changeActive(null);
            },
          });
        });
      });
      track();

      // Hide on scroll down, reveal on scroll up.
      const mm = gsap.matchMedia();
      mm.add(CONDITIONS.motionOK, () => {
        let hidden = false;
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const shouldHide = self.direction === 1 && self.scroll() > 240 && !openRef.current;
            if (shouldHide === hidden) return;
            hidden = shouldHide;
            gsap.to(bar.current, {
              yPercent: shouldHide ? -120 : 0,
              duration: DUR_FAST,
              ease: EASE_SNAP,
              overwrite: true,
            });
          },
        });
      });
      return () => cancelAnimationFrame(raf);
    },
    { scope: bar, dependencies: [] },
  );

  // Mobile overlay open / close.
  const { contextSafe } = useGSAP({ scope: overlay });
  const animateOverlay = contextSafe((to: boolean) => {
    const el = overlay.current!;
    const links = el.querySelectorAll("[data-overlay-item]");
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    if (to) {
      gsap.set(el, { display: "flex" });
      if (reduce) return;
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: DUR_BASE, ease: "power3.inOut" });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: EASE_OUT, stagger: STAGGER_ITEMS, delay: 0.25 });
    } else {
      if (reduce) {
        gsap.set(el, { display: "none" });
        return;
      }
      gsap.to(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => gsap.set(el, { display: "none" }),
      });
    }
  });

  useEffect(() => {
    if (open) {
      lenis?.stop();
      animateOverlay(true);
      requestAnimationFrame(() => overlay.current?.querySelector<HTMLElement>("a")?.focus());
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          menuButton.current?.focus();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (overlay.current && overlay.current.style.display === "flex") animateOverlay(false);
    lenis?.start();
  }, [open, lenis, animateOverlay]);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(lenis, id);
  };

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[80] text-white mix-blend-difference"
        style={{ height: "var(--nav-h)" }}
      >
        <nav aria-label="Primary" className="shell mono flex h-full items-center justify-between text-white">
          <a
            href="#top"
            onClick={go("top")}
            data-hero-hide
            data-nav-item
            className="text-[13px] font-medium tracking-[0.04em] text-white"
          >
            NISHOK.
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {site.nav.map(({ id, label }) => (
              <li key={id} data-hero-hide data-nav-item className="relative">
                <MagneticButton as="span" strength={0.3}>
                  <ScrambleLink
                    text={label.toUpperCase()}
                    aria-label={label}
                    href={`#${id}`}
                    onClick={go(id)}
                    aria-current={active === id ? "location" : undefined}
                    className="relative py-2 text-white"
                  >
                    {active === id && (
                      <span
                        data-flip-id="nav-dot"
                        aria-hidden="true"
                        className="absolute -bottom-1 left-1/2 -ml-[3px] h-1.5 w-1.5 rounded-full bg-accent"
                      />
                    )}
                  </ScrambleLink>
                </MagneticButton>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {site.available && (
              <span data-hero-hide data-nav-item className="hidden items-center gap-2 text-white sm:inline-flex">
                <span aria-hidden="true" className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-accent" />
                </span>
                Available
              </span>
            )}
            <button
              ref={menuButton}
              type="button"
              data-hero-hide
              data-nav-item
              className="mono flex h-10 items-center gap-2 text-white md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
              <span aria-hidden="true" className="flex w-5 flex-col gap-1">
                <span className="h-px w-full bg-white" />
                <span className="h-px w-3/5 bg-white" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        ref={overlay}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-[75] flex-col justify-end bg-bg pb-16 md:hidden"
        style={{ display: "none" }}
      >
        <ul className="shell flex flex-col gap-2">
          {[{ id: "top", label: "Index" }, ...site.nav].map(({ id, label }, i) => (
            <li key={id} className="line-mask">
              <a
                href={`#${id}`}
                onClick={go(id)}
                data-overlay-item
                className="display flex items-baseline gap-4 py-1 text-[clamp(2.75rem,14vw,5rem)]"
              >
                <span className="mono">{String(i).padStart(2, "0")}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="shell mono mt-10">
          {site.hero.meta} / {site.location}
        </p>
      </div>
    </>
  );
}
