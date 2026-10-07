"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Github, Mail, FileText, ArrowUp } from "lucide-react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "@/lib/lenis";
import { CONDITIONS, DUR_BASE, EASE_ELASTIC, EASE_OUT, EASE_SNAP } from "@/lib/motion";
import SectionHeader from "@/components/ui/SectionHeader";
import SplitReveal from "@/components/ui/SplitReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrambleLink from "@/components/ui/ScrambleLink";
import VectorWordmark from "@/components/hero/VectorWordmark";

const RADIUS = 180;
const PULL = 0.35;

const contactLinks = [
  { label: "Email", href: `mailto:${site.email}`, icon: Mail },
  { label: "GitHub", href: site.links.github, icon: Github },
  { label: "Resume (PDF)", href: site.links.resume, icon: FileText },
];

function LocalClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: site.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="mono">
      {site.contact.timeLabel}{" "}
      <time className="tabular-nums text-fg" suppressHydrationWarning>
        {time ?? "--:--:--"}
      </time>{" "}
      {site.timezoneLabel}
    </p>
  );
}

export default function Contact({ fontFamily }: { fontFamily: string }) {
  const root = useRef<HTMLElement>(null);
  const toast = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const [announce, setAnnounce] = useState("");
  const { contact } = site;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${CONDITIONS.finePointer} and (min-width: 768px) and ${CONDITIONS.motionOK}`, () => {
        // Each letter of the CTA leans toward the cursor by proximity.
        const chars = gsap.utils.toArray<HTMLElement>("[data-cta-char]");
        const movers = chars.map((el) => ({
          el,
          x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
          cx: 0,
          cy: 0,
        }));
        const measure = () =>
          movers.forEach((m) => {
            const r = m.el.getBoundingClientRect();
            const tx = Number(gsap.getProperty(m.el, "x"));
            const ty = Number(gsap.getProperty(m.el, "y"));
            m.cx = r.left - tx + r.width / 2 + window.scrollX;
            m.cy = r.top - ty + r.height / 2 + window.scrollY;
          });

        const onMove = (e: PointerEvent) => {
          const px = e.clientX + window.scrollX;
          const py = e.clientY + window.scrollY;
          movers.forEach((m) => {
            const dx = px - m.cx;
            const dy = py - m.cy;
            const d = Math.hypot(dx, dy);
            const f = d < RADIUS ? (1 - d / RADIUS) * PULL : 0;
            m.x(dx * f);
            m.y(dy * f);
          });
        };

        const st = ScrollTrigger.create({
          trigger: "[data-cta]",
          start: "top bottom",
          end: "bottom top",
          onRefresh: measure,
          onToggle: (self) => {
            if (self.isActive) {
              measure();
              window.addEventListener("pointermove", onMove, { passive: true });
            } else {
              window.removeEventListener("pointermove", onMove);
              gsap.to(chars, { x: 0, y: 0, duration: 1, ease: EASE_ELASTIC });
            }
          },
        });
        measure();
        return () => {
          st.kill();
          window.removeEventListener("pointermove", onMove);
        };
      });

      mm.add(CONDITIONS.motionOK, () => {
        gsap.from("[data-cta-char]", {
          yPercent: 110,
          duration: 1,
          ease: EASE_OUT,
          stagger: 0.02,
          scrollTrigger: { trigger: "[data-cta]", start: "top 85%", once: true },
        });
        gsap.from("[data-contact-link]", {
          opacity: 0,
          y: 16,
          duration: DUR_BASE,
          ease: EASE_OUT,
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-contact-links]", start: "top 90%", once: true },
        });
      });
    },
    { scope: root },
  );

  const copyEmail = contextSafe(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      window.location.href = `mailto:${site.email}`;
      return;
    }
    setAnnounce(`${contact.copied} ${site.email}`);
    const reduce = window.matchMedia(CONDITIONS.reduceMotion).matches;
    gsap
      .timeline()
      .fromTo(
        toast.current,
        { autoAlpha: 0, y: reduce ? 0 : 12 },
        { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.35, ease: EASE_SNAP },
      )
      .to(toast.current, { duration: reduce ? 0 : 0.6, scrambleText: reduce ? undefined : { text: contact.copied, chars: "01" } }, "<")
      .to(toast.current, { autoAlpha: 0, duration: 0.3, delay: 1.6 });
  });

  const backToTop = contextSafe(() => scrollToTarget(lenis, "top", 0));

  const ctaWords = contact.cta.split(" ");

  return (
    <section ref={root} id="contact" aria-labelledby="contact-title" className="pt-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeader index={contact.index} label={contact.label} />

        <div className="mt-[clamp(48px,7vw,96px)] grid gap-8 md:grid-cols-12">
          <SplitReveal as="h2" id="contact-title" className="display display-md md:col-span-7">
            {contact.title}
          </SplitReveal>
          <p className="prose-body text-[clamp(1.05rem,1.3vw,1.2rem)] md:col-span-4 md:col-start-9 md:self-end">
            {contact.body}
          </p>
        </div>

        <div data-cta className="relative mt-[clamp(56px,8vw,120px)]">
          <button
            type="button"
            onClick={copyEmail}
            className="group block w-full text-left"
            aria-label={`${contact.cta} ${contact.copyHint}: ${site.email}`}
          >
            <span aria-hidden="true" className="display block overflow-hidden pb-[0.06em] text-[clamp(3rem,10.5vw,10.5rem)] leading-[0.95]">
              {ctaWords.map((word, w) => (
                <Fragment key={w}>
                  {w > 0 && " "}
                  <span className="inline-block whitespace-nowrap">
                    {[...word].map((c, i) => (
                      <span
                        key={i}
                        data-cta-char
                        className="inline-block transition-colors duration-300 group-hover:text-accent"
                        style={{ transitionDelay: `${(w * 6 + i) * 12}ms` }}
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
            <span aria-hidden="true" className="mono mt-4 flex items-center gap-3">
              <span className="h-px w-10 bg-fg-dim" />
              {contact.copyHint} — <span className="text-fg normal-case">{site.email}</span>
            </span>
          </button>
          <span
            ref={toast}
            aria-hidden="true"
            className="mono pointer-events-none invisible absolute right-0 top-0 rounded-full bg-accent px-3 py-1.5 text-bg opacity-0"
          >
            {contact.copied}
          </span>
          <span className="sr-only" role="status" aria-live="polite">
            {announce}
          </span>
        </div>

        <ul data-contact-links className="mt-16 flex flex-wrap gap-x-8 gap-y-4 border-t border-line-strong pt-8">
          {contactLinks.map(({ label, href, icon: Icon }) => {
            const placeholder = href.includes("[");
            const external = href.startsWith("http");
            return (
              <li key={label} data-contact-link>
                <MagneticButton
                  as="a"
                  href={placeholder ? "#contact" : href}
                  className="mono items-center gap-2 text-fg hover:text-accent"
                  {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  {...(label.startsWith("Resume") ? { download: true } : {})}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </MagneticButton>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <LocalClock />
          <ScrambleLink
            as="button"
            type="button"
            text={contact.backToTop}
            onClick={backToTop}
            className="mono inline-flex items-center gap-2 text-fg hover:text-accent"
          >
            <ArrowUp size={14} aria-hidden="true" />
          </ScrambleLink>
        </div>
      </div>

      {/* Footer signature: a second, lazily-mounted wordmark. */}
      <div className="mt-[clamp(56px,8vw,112px)] border-t border-line">
        <VectorWordmark
          text={site.hero.wordmark}
          font={{ fontFamily, fontWeight: 800, fontSize: "300px", letterSpacing: "-0.04em" }}
          background="#0A0A0A"
          textColor="#F2F2F2"
          shade="#141414"
          accent="rgba(189,232,90,0.45)"
          reach={220}
          speed={40}
          damping={60}
          handles={{ size: 64, spread: 26, labels: false }}
          fit={0.92}
          className="h-[28svh] md:h-[40svh]"
        />
      </div>
    </section>
  );
}
