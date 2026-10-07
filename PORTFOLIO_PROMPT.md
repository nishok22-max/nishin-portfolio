# BUILD PROMPT — Nishok's Portfolio (GSAP + Interactive)

> Copy everything below this line into your AI coding tool. Paste the full `VectorWordmark` component code where it says `<<PASTE VECTORWORDMARK CODE HERE>>`.

---

## 0. ROLE & MISSION

You are a senior creative front-end engineer who ships award-level (Awwwards / FWA) portfolio sites. You're equally strong at motion design (GSAP), WebGL, performance, and accessibility.

Build a **production-ready, single-page personal portfolio** for **Nishok**, a CSE-AIML student who builds AI systems, full-stack products, and interactive interfaces.

**The site should feel like a system being inspected.** It borrows from engineering blueprints and CAD tools: vector handles, coordinate readouts, dashed guide lines, dot grids, and monospace annotations. The hero `VectorWordmark` sets this language, and every other section continues it. The site should be precise and quiet, with confident motion. Don't make it loud or gimmicky.

The core idea is **"it works" vs "it actually works well."** The site itself has to prove the second half: smooth, fast, accessible, and responsive.

---

## 1. TECH STACK (LOCKED — do not substitute)

| Layer | Choice |
|---|---|
| Framework | **Next.js 15 (App Router)** + **TypeScript (strict)** |
| Styling | **Tailwind CSS v4** + CSS custom properties for design tokens |
| Animation | **GSAP 3.13+** with `@gsap/react` (`useGSAP`), plugins: **ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomEase** (all free now, installed from npm `gsap`) |
| Smooth scroll | **Lenis** (`lenis`), synced to ScrollTrigger via `gsap.ticker` |
| WebGL | Raw WebGL (the provided `VectorWordmark` component). No Three.js unless it's needed for one optional effect |
| Fonts | `next/font`: **Inter** (or **Geist**) for display/body at weights 400/500/800, **JetBrains Mono** (or **Geist Mono**) for labels/annotations |
| Icons | `lucide-react` |
| Deploy | Vercel |

Rules:
- Every GSAP animation lives inside `useGSAP()` with a `scope` ref. No bare `gsap.to` in `useEffect`, and no leaked ScrollTriggers.
- Register plugins exactly once in `lib/gsap.ts` and import from there.
- Use `gsap.matchMedia()` for **all** responsive and `prefers-reduced-motion` branching.
- Animate only `transform` and `opacity` (plus `clip-path` where it's specified). Never animate layout properties.

---

## 2. DESIGN SYSTEM

### 2.1 Color tokens (dark-first)
```css
--bg:          #0A0A0A;   /* page */
--bg-elev:     #111111;   /* cards */
--line:        #1F1F1F;   /* hairlines, grid */
--line-strong: #2E2E2E;
--fg:          #F2F2F2;   /* primary text */
--fg-muted:    #8A8A8A;   /* secondary text */
--fg-dim:      #4A4A4A;   /* annotations */
--accent:      #C6FF3D;   /* single signal color (acid lime) — used sparingly: cursor, active states, one word per section max */
```
Monochrome is the base, with **one** accent color. Pick either acid lime `#C6FF3D` or electric blue `#3D7BFF` and use it everywhere consistently.

### 2.2 Typography
- **Display:** Inter 800, tight tracking (`-0.04em`), line-height `0.9`. Sizes use `clamp()` (e.g. `clamp(3rem, 9vw, 9rem)`).
- **Body:** Inter 400/500, 17–19px, line-height 1.6, max-width `62ch`.
- **Mono labels:** JetBrains Mono 11–12px, uppercase, `letter-spacing: 0.08em`, color `--fg-dim`. Use them for section indices (`[01]`, `[02]`, …), coordinates, and meta info.

### 2.3 Layout & texture
- 12-column grid, `max-width: 1440px`, gutters `clamp(16px, 4vw, 48px)`.
- A faint **dot grid** background (CSS radial-gradient, 24px pitch, `--line` color) that shifts slightly with scroll (parallax `yPercent: -10`).
- A **film grain / noise** overlay (SVG turbulence, `opacity: 0.04`, `pointer-events: none`, fixed).
- Every section opens with a mono header row: `[0X] — SECTION NAME ———————— x: 00 y: 00`. The coordinates update live from the pointer position while the section is in view. This ties back to the hero handles.

### 2.4 Motion language (define these as constants in `lib/motion.ts`)
```ts
EASE_OUT   = "expo.out"        // reveals
EASE_INOUT = "power3.inOut"    // transitions, wipes
EASE_SNAP  = CustomEase "0.7,0,0.2,1"  // UI snaps
DUR_FAST = 0.35, DUR_BASE = 0.8, DUR_SLOW = 1.4
STAGGER_CHARS = 0.02, STAGGER_WORDS = 0.06, STAGGER_ITEMS = 0.08
```
Standard reveal: `yPercent: 110 → 0` inside an `overflow: hidden` line mask, `expo.out`, 1s. Stick to this vocabulary everywhere. **Don't invent a new animation style for each section.**

---

## 3. HERO — THE VECTOR WORDMARK (most important section)

### 3.1 The component
Use the Originkit `VectorWordmark` component below **as the base**. Save it at `components/hero/VectorWordmark.tsx`.

```tsx
<<PASTE VECTORWORDMARK CODE HERE>>
```

### 3.2 Configuration
```tsx
<VectorWordmark
  text="NISHOK"
  font={{
    fontFamily: "Inter",        // must match the next/font family actually loaded
    fontWeight: 800,
    fontSize: "300px",          // relative to 1200px ref width — tune so NISHOK spans ~90% of viewport width
    letterSpacing: "-0.04em",
  }}
  background="#0A0A0A"
  textColor="#F2F2F2"
  shade="#1A1A1A"               // bottom-of-glyph gradient → gives depth
  accent="rgba(198,255,61,0.55)" // accent color, partially transparent
  reach={320}
  speed={45}
  damping={55}
  handles={{ size: 96, spread: 26, labels: true }}
/>
```

### 3.3 Required modifications to the component (do all of them)
1. **Remove `minWidth: 1200` / `minHeight: 800`.** Size to its container instead: `width: 100%`, `height: 100svh` on desktop and `70svh` on mobile.
2. **Fonts:** wait for `document.fonts.ready` and the specific font before the first atlas build. If the canvas draws with a fallback font, the wordmark will look wrong. Pass the resolved `next/font` family name (the CSS variable's actual family string).
3. **Touch support:** also listen to `pointerdown`. Set `hasPointer` back to `false` on `pointerleave` so the automatic sweep resumes when the cursor leaves.
4. **Pause when offscreen:** use an `IntersectionObserver` that sets `running = false` and calls `gate()` when the hero is out of view.
5. **WebGL cleanup:** in the effect cleanup, delete the texture, buffer, and program, and call `gl.getExtension('WEBGL_lose_context')?.loseContext()`. Handle `webglcontextlost` / `webglcontextrestored`.
6. **Fallback:** if WebGL is unavailable **or** `prefers-reduced-motion: reduce` is set, render a static styled `<span>` "NISHOK" with the same font and gradient (`background-clip: text`), and no animation loop.
7. **Accessibility:** the canvas is `aria-hidden="true"`. Render a visually hidden `<h1>Nishok — AI & Software Engineer</h1>` next to it. Coordinate labels are `aria-hidden`.
8. **Mobile:** cap DPR at 1.5 when `width < 768`, and lower `speed` a little.
9. Expose an `intro` prop, or use a `ref` with an imperative `reveal()`, so GSAP can drive a reveal uniform (`uReveal` 0→1). In the shader, multiply the final alpha by a left-to-right wipe: `smoothstep(uReveal - 0.1, uReveal, vUv.x)`, inverted appropriately.

### 3.4 Hero layout
```
┌──────────────────────────────────────────────────────────────┐
│ NISHOK.            WORK  ABOUT  STACK  CONTACT     [● AVAILABLE] │  ← nav (mono, 12px)
│                                                              │
│  [00] — INDEX                              x: 42  y: 67      │
│                                                              │
│           ███╗   ██╗██╗███████╗██╗  ██╗ ██████╗ ██╗  ██╗       │
│           ██╔██╗ ██║██║███████╗███████║██║   ██║█████╔╝       │  ← VectorWordmark (full-bleed)
│           ██║ ╚████║██║╚════██║██╔══██║╚██████╔╝██║  ██╗       │
│                                                              │
│  I build intelligent systems          AI/ML • Full-Stack     │
│  that feel simple.                    Systems • Interactive  │
│                                                              │
│  CSE — AIML  /  BASED IN [CITY]              ↓ SCROLL        │
└──────────────────────────────────────────────────────────────┘
```

### 3.5 Hero content
- **Headline:** "I build intelligent systems that feel simple."
- **Sub:** "I'm a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning, interested in the intersection of **AI, software engineering, data, and interactive product design**. I like taking complicated problems, breaking them down into systems, and turning them into products people can actually use."
- **Tags:** `AI/ML • Full-Stack Development • Systems • Interactive UI`

### 3.6 Hero intro sequence (one master GSAP timeline, ~3.2s total, skippable on click)
1. **Preloader (0 → 1.2s):** black screen. A mono counter scrambles `000 → 100` in the bottom-left (ScrambleText on each tick). A 1px accent line draws across the width with `scaleX`.
2. **Wipe (1.2 → 1.8s):** the preloader panel exits with `clipPath: inset(0 0 100% 0)` and `power3.inOut`.
3. **Wordmark (1.6 → 2.6s):** tween `uReveal 0 → 1`. Coordinate labels fade in (`opacity 0 → 0.6`), staggered.
4. **Copy (2.2 → 3.2s):** the headline is split with SplitText into lines and words, and reveals with a line mask. Nav items drop in from `y: -20` with a stagger. Tags type out with ScrambleText.
5. **Scroll cue:** an infinite `yoyo` bob on the arrow.

Show the preloader only on the first visit per session (`sessionStorage`, wrapped in try/catch). Skip everything for reduced motion.

### 3.7 Hero scroll-out
Pin the hero for `+=60%`. On scroll, the wordmark scales to `0.85` and fades to `opacity 0.15`, and the headline lines move up at different speeds (parallax `y`). The next section slides up over it like a sheet (`z-index`, rounded top corners `24px` that animate to `0`).

---

## 4. GLOBAL INTERACTIONS

1. **Custom cursor** (desktop and fine pointers only):
   - An 8px dot plus a 36px ring that follows with lag (`gsap.quickTo`, duration 0.15 / 0.5).
   - States: over a link, the ring scales to 1.8 and the dot hides. Over a project card, the ring becomes a pill labeled `VIEW →`. Over text, it becomes a thin I-beam.
   - `mix-blend-mode: difference`.
   - Hidden on touch devices and when the cursor leaves the window.
2. **Magnetic buttons:** CTAs and nav links pull toward the cursor within 80px (`quickTo` x/y, strength 0.35) and snap back with `elastic.out(1, 0.4)`.
3. **Smooth scroll:** Lenis with `lerp: 0.1`. Anchor links scroll through Lenis with an offset for the nav.
4. **Nav:** fixed, `mix-blend-mode: difference`. Hides on scroll down and shows on scroll up (Observer or ScrollTrigger `onUpdate` direction). The active section indicator is an accent dot that moves between links with **Flip**.
5. **Scroll progress:** a 1px accent bar at the top, `scaleX` tied to page progress. Plus a mono readout on the right edge: `SCROLL 042%`.
6. **Section coordinates:** the `x: 00 y: 00` readouts in every section header update with the pointer, throttled with `gsap.ticker`.
7. **Text hover scramble:** nav links and mono labels scramble their characters on hover (ScrambleText, 0.4s, chars `"01"` or uppercase).
8. **Keyboard:** everything is reachable, focus rings are visible (2px accent outline, 3px offset), a skip link is included, and pressing `Esc` closes the mobile menu.

---

## 5. SECTIONS — CONTENT, LAYOUT, MOTION

Number every section `[01]`–`[12]` in the mono header. Use all copy **exactly** as written.

---

### [01] INTRO — "More than code."
**Content:**
- Title: **More than code.**
- Lead: "I'm interested in what happens **after the model works**."
- Four statements:
  1. The interface has to make sense.
  2. The system has to be reliable.
  3. The data has to be traceable.
  4. The product has to solve a real problem.
- Close: "That's how I approach projects — not as isolated coding exercises, but as complete systems."

**Layout:** the title is huge and left-aligned. The four statements stack as full-width rows separated by hairlines. Each row has a mono index (`01`–`04`) on the left and a keyword on the right (`INTERFACE`, `SYSTEM`, `DATA`, `PRODUCT`).

**Motion:** **scroll-scrubbed word highlight.** Split the lead and statements into words, starting at `opacity: 0.15`. As you scroll (`scrub: true`), each word brightens to `opacity: 1` in reading order. Each row's hairline draws with `scaleX 0→1` (origin left) as it enters.

---

### [02] ABOUT — "Who is Nishok?"
**Content:**
- Title: **Who is Nishok?**
- P1: "I'm a CSE-AIML student who enjoys building at the intersection of **artificial intelligence and software engineering**."
- P2: "My work spans machine learning, RAG systems, multimodal AI, backend architecture, databases, data analysis, and modern web applications."
- P3: "I'm especially drawn to problems where there isn't an obvious solution — the kind where you have to think about **data, models, architecture, UX, performance, and real-world constraints at the same time.**"
- P4: "I also care about how technology is presented. A technically strong system should not feel complicated to use."

**Layout:** two columns. Left: a portrait placeholder (4:5) inside a "CAD frame" with corner brackets, dimension lines (`W: 480 H: 600`), and a crosshair. Right: the copy.

**Motion:**
- The portrait reveals with `clipPath: inset(100% 0 0 0) → inset(0)`. The image inside counter-scales from `1.3 → 1`.
- Corner brackets animate in from outside.
- On hover, the portrait gets an RGB-split / pixel-sort displacement. Use CSS filter or canvas; keep it subtle.
- The bold phrase in P3 gets an **accent underline that draws** (`scaleX`) when it enters view.

---

### [03] WHAT I BUILD — 4 capability cards
**Content:**
| Card | Title | Body |
|---|---|---|
| 01 | **AI SYSTEMS** | RAG pipelines, multimodal AI applications, intelligent assistants, semantic search, anomaly detection, and AI-powered workflows. |
| 02 | **FULL-STACK PRODUCTS** | Modern web applications using React, TypeScript, Python, FastAPI, Node.js, databases, APIs, and cloud infrastructure. |
| 03 | **DATA & ML** | Data preprocessing, EDA, feature engineering, classical machine learning, deep learning experiments, embeddings, retrieval, and model evaluation. |
| 04 | **INTERACTIVE EXPERIENCES** | Interfaces where animation and interaction are part of the product experience — not decoration added afterwards. |

**Layout:** a 2×2 grid on desktop and a stack on mobile. Each card holds a mono index, the title, the body, and a **small unique animated glyph** built from SVG/CSS:
- AI Systems: nodes connecting in a small graph.
- Full-Stack: stacked layers that separate on hover.
- Data & ML: a scatter plot whose points converge into a regression line on hover.
- Interactive: a cursor icon that clicks and ripples.

**Motion:**
- Cards enter with `y: 60, opacity: 0` and `stagger: 0.1` (`ScrollTrigger.batch`).
- On hover, a spotlight radial gradient follows the cursor inside the card (CSS variables `--mx`/`--my` set with `quickSetter`), the border brightens, and the glyph plays its animation.
- 3D tilt of at most 6° on `rotateX`/`rotateY` with `transformPerspective: 800`.

---

### [04] MY APPROACH — Understand → Design → Build → Test → Refine
**Content:**
- Intro: "I usually start with the problem rather than the technology."
- Steps:
  1. **Understand** — What is actually being solved?
  2. **Design** — What should the system look like from the user's perspective?
  3. **Build** — How do the AI, backend, data, and frontend fit together?
  4. **Test** — What breaks? What is inaccurate? What is slow?
  5. **Refine** — Remove unnecessary complexity and keep improving the experience.

**Layout and motion (the signature scroll moment):**
- **Pinned horizontal pipeline.** Pin the section and translate a horizontal track of 5 panels (`x: -(trackWidth - viewport)`) with `scrub: 1`.
- A **dashed SVG path** connects the 5 nodes, matching the wordmark's dashed-line aesthetic. It draws via `strokeDashoffset` in sync with the scroll.
- The active step's node fills with accent color, and its big number (`01`–`05`) scrambles into place.
- A mono readout at the top shows `STAGE 3/5 — BUILD`.
- **Refine** loops the path back to **Understand** with a curved arrow, which shows the process is iterative.
- **Mobile:** no pin. Use a vertical timeline where each step reveals as it enters.

---

### [05] SELECTED WORK — 4 projects (the main content)
**Projects:**

**① THINKSYNC / AETHERIS OS** — *A multimodal AI research environment.*
A research platform combining **multi-agent orchestration, RAG, multimodal understanding, code intelligence, and memory** into one workspace. Built around the idea of making AI research more structured, contextual, and inspectable.
`React • TypeScript • FastAPI • Gemini • AWS Bedrock • Groq • Supabase • pgvector`

**② URBANTWIN / HEATLENS** — *Turning extreme heat into actionable decisions.*
An AI-driven urban heat and human thermal-stress platform designed to translate weather and urban data into **localized risk, worker guidance, and infrastructure decisions**. The system combines biometeorological models, spatial data, satellite inputs, demographics, and persona-based recommendations.
`Python • AI/ML • Geospatial Data • OpenStreetMap • Weather APIs • H3 • Interactive Maps`

**③ ROADSOS** — *From crash detection to emergency response.*
A smart emergency-response system designed to detect serious road crashes and accelerate the response process using connected hardware, machine learning, location intelligence, and communication systems.
`ESP32 • IMU • GPS • LTE • LoRa • TFLite • FastAPI • PostgreSQL • PostGIS • React Native`

**④ DATAWHISPERER** — *Making raw data easier to understand.*
A data analysis and expense-management system combining structured data processing with AI-assisted categorization and visualization.
`React • Python • FastAPI • PostgreSQL • Supabase • Streamlit`

**Layout:** **stacked sticky cards.**
- Each project is a full-viewport card (rounded 24px, `--bg-elev`, hairline border).
- Cards pin and stack on top of each other as you scroll. As the next card slides over, the previous one scales to `0.92` and dims to `brightness(0.5)`.
- Card layout: the left 40% holds the index `01/04`, title, tagline, description, stack chips, and links (`Case study →`, `GitHub ↗`, `Live ↗`). The right 60% holds a visual.

**Per-project visual.** Each one is an animated, code-drawn motif. These are **not** stock screenshots; use real screenshots later when available.
- ThinkSync: agent nodes orbiting a central "memory" core, with pulsing edges that show message passing.
- UrbanTwin: an **H3 hexagon grid** heatmap whose cells shift from cool to hot colors, with a hover tooltip showing a fake "risk index".
- RoadSOS: a map route line. An impact pulse sends a ripple, then a dashed signal line travels to an "ambulance" marker with ETA text.
- DataWhisperer: messy scattered rows that sort themselves into a clean chart. Use Flip.

**Motion:**
- Title chars reveal (SplitText) when a card becomes active.
- Stack chips stagger in.
- The visual starts its loop only while the card is active (ScrollTrigger `onToggle`) and pauses otherwise.
- Cursor over a card turns into `VIEW →`.
- A **project counter** in the section header (`01 → 04`) rolls like an odometer.

**Mobile:** no stacking. Use simple vertical cards with reveal-on-enter.

---

### [06] TECH STACK
**Content (5 groups):**
- **LANGUAGES:** Python, Java, C, JavaScript, TypeScript, SQL
- **AI / ML:** Machine Learning, Deep Learning, Embeddings, RAG, Semantic Search, Computer Vision, Anomaly Detection, NLP
- **DEVELOPMENT:** React, Next.js, Node.js, Express, FastAPI, Flask, Tailwind CSS
- **DATA:** NumPy, Pandas, Matplotlib, scikit-learn, PostgreSQL, Supabase, pgvector, Qdrant
- **INFRASTRUCTURE:** Vercel, Render, Firebase, AWS, Google Cloud

**Layout:** two parts.
1. **Infinite marquees:** 2–3 rows of large outlined text (`-webkit-text-stroke`) scrolling in alternating directions. Scroll velocity speeds them up and flips their direction (Observer, or ScrollTrigger `getVelocity()`) with `skewX` proportional to velocity. Hovering a word fills it solid.
2. **Filterable grid:** tabs for `ALL / LANGUAGES / AI-ML / DEV / DATA / INFRA`. Switching tabs animates the tech chips with **GSAP Flip**: filtered-out chips fade and scale down, and the rest reflow smoothly. Each chip shows a mono category tag.

---

### [07] HOW I THINK — "it works" vs "it actually works well"
**Content:**
- "I'm obsessed with the gap between"
- **"it works"**
- "and"
- **"it actually works well."**
- "A prototype can call an API. A product needs to handle bad input, latency, failure cases, scale, usability, and trust. That gap is where I like working."

**Layout:** full-screen, centered, dramatic typography.

**Motion (pinned, scrubbed):**
1. **"it works"** appears in a rough, glitchy state: monospace font, slight jitter, and a broken/misaligned baseline.
2. As you scroll, the words **physically separate** to open a visible gap, marked by a dimension line and label (`← GAP →`) in the CAD style.
3. **"it actually works well."** enters in clean, perfectly set display type.
4. Then the six failure modes (`bad input`, `latency`, `failure cases`, `scale`, `usability`, `trust`) appear as small mono tags inside the gap. Each gets a `✓` stamped on it with a scramble as you keep scrolling.

---

### [08] CURRENTLY — "Building. Learning. Experimenting."
**Content:**
- Title: **Building. Learning. Experimenting.**
- "Right now I'm exploring deeper into:"
- Items: **AI agents • Multimodal systems • Advanced RAG • AI product engineering • System architecture • Interactive web experiences**
- "I'm particularly interested in combining powerful AI systems with interfaces that make them feel intuitive."

**Layout:** a **terminal / status-panel** aesthetic. A card styled like a system monitor:
```
> status --current
[■■■■■■■■□□] AI agents                 ACTIVE
[■■■■■■□□□□] Multimodal systems        ACTIVE
[■■■■■■■□□□] Advanced RAG              ACTIVE
...
last_updated: 2026-09
```

**Motion:** lines type in (ScrambleText or a character stagger) when the panel enters. Progress bars fill with a stagger, and a blinking cursor sits at the end. The three title words cycle on a loop with a vertical text slot-machine roll.

---

### [09] BEYOND THE STACK
**Content:**
"I enjoy experimenting with ideas that sit somewhere between engineering and design. Sometimes that means building an AI system. Sometimes it means redesigning an interface. Sometimes it means figuring out why something technically works but still feels wrong. I like all three."

**Layout:** three "Sometimes…" lines as large rows. Each row has a tiny illustrative icon (neural net / wireframe / warning triangle).

**Motion:** hovering a row expands it (height tween) to show a one-line example, and the other rows dim. Scroll reveal uses the standard line mask. "I like all three." lands last with a small accent flourish.

---

### [10] PERSONAL LINE — the manifesto
**Content:**
- **Build things that are technically interesting.**
- **Make them useful.**
- **Make them feel good to use.**

**Layout:** three enormous lines filling the viewport width.

**Motion (pinned, scrubbed):** each line starts as a dashed **outline** (`-webkit-text-stroke`) and **fills solid** left to right as you scroll, using a `background-clip: text` gradient position or clip-path. One line fills at a time. When line 3 fills, the accent color flashes once through the three key words: *interesting*, *useful*, *feel good*.

---

### [11] CONTACT — "Have an idea worth building?"
**Content:**
- Title: **Have an idea worth building?**
- Body: "I'm always interested in interesting problems, ambitious projects, collaborations, and opportunities to build."
- Giant CTA: **Let's make something.**
- Links: Email · GitHub · LinkedIn · Resume (PDF) · X/Twitter. All are placeholders; see §8.

**Layout and motion:**
- "Let's make something." is a huge **magnetic** text link. Each letter responds to cursor proximity individually (per-char `quickTo` offset by distance). Clicking copies the email, and a `COPIED ✓` toast confirms it.
- Reprise the hero: a **small `VectorWordmark` instance** as the footer signature, reading "NISHOK" at ~40% height. Only mount it when it's in view.
- A live local clock in mono (`LOCAL TIME 14:32:07 IST`).
- Back-to-top button that scrolls through Lenis with a scramble label.

### [12] FOOTER
`© 2026 NISHOK — DESIGNED & BUILT BY HAND` · `@nishhz` · a "Built with Next.js, GSAP, WebGL" mono line · social icons.

---

## 6. RESPONSIVE RULES

| Breakpoint | Behavior |
|---|---|
| ≥1280 | Full experience: all pins, horizontal scroll, stacked cards, custom cursor |
| 768–1279 | Keep pins and the approach track. Reduce tilt and remove the cursor on touch |
| <768 | **No horizontal pin, no card stacking, no custom cursor, no magnetic effects.** Simple reveal-on-enter only. Hero wordmark at 70svh with reduced DPR. Hamburger menu as a full-screen overlay with staggered links |

Use `gsap.matchMedia()` with conditions `{ isDesktop, isMobile, reduceMotion }` and build each timeline once per condition.

---

## 7. PERFORMANCE & ACCESSIBILITY (hard requirements)

**Performance**
- Lighthouse on desktop: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- Hold 60fps on a mid-range laptop. No layout thrash; batch reads and writes.
- Only one WebGL context active at a time. The footer wordmark mounts lazily, and the hero pauses offscreen.
- Lazy-load project visuals with `next/dynamic` and `ssr: false`. Mount heavy canvases only when they're near the viewport.
- Fonts: `display: swap`, preload the display weight, and subset if possible.
- Use `will-change` only while an animation is running.
- Call `ScrollTrigger.refresh()` after fonts load and after images load.

**Accessibility**
- Semantic landmarks, one `<h1>`, and a logical heading order.
- `prefers-reduced-motion`: remove pins, scrubs, parallax, scramble, and WebGL. Content stays fully visible with simple fades (≤ 0.3s) or none at all.
- All text meets **WCAG AA** contrast (`--fg-muted` on `--bg` must be ≥ 4.5:1; adjust it if it isn't).
- Split text keeps an `aria-label` with the original string on its parent (SplitText's `aria: "auto"`).
- The site is fully usable by keyboard and screen reader, with no content locked behind hover.

**SEO**
- Metadata, an Open Graph image showing the NISHOK wordmark on black (use `next/og`), `sitemap.ts`, `robots.ts`, and JSON-LD `Person` schema.

---

## 8. CONTENT PLACEHOLDERS (put all of these in `content/site.ts`, a single source of truth)
```ts
export const site = {
  name: "Nishok",
  handle: "nishhz",
  role: "AI & Software Engineer — CSE (AIML) Student",
  location: "[CITY, COUNTRY]",
  timezone: "Asia/Kolkata",
  email: "[EMAIL]",
  links: { github: "[URL]", linkedin: "[URL]", x: "[URL]", resume: "/resume.pdf" },
  available: true,
  projects: [ /* 4 projects from §5[05], with fields: slug, index, title, tagline, description, stack[], links{caseStudy, github, live}, visual */ ],
  stack: { /* 5 groups from §5[06] */ },
}
```
**All copy comes from this file. Nothing is hardcoded in components.**

---

## 9. FILE STRUCTURE
```
app/
  layout.tsx            # fonts, Lenis provider, cursor, noise, nav
  page.tsx              # section composition
  opengraph-image.tsx
  sitemap.ts, robots.ts
components/
  hero/VectorWordmark.tsx  Hero.tsx  Preloader.tsx
  sections/Intro.tsx About.tsx Capabilities.tsx Approach.tsx Work.tsx
           Stack.tsx HowIThink.tsx Currently.tsx Beyond.tsx Manifesto.tsx Contact.tsx Footer.tsx
  work/visuals/ThinkSyncVisual.tsx UrbanTwinVisual.tsx RoadSOSVisual.tsx DataWhispererVisual.tsx
  ui/Cursor.tsx MagneticButton.tsx SectionHeader.tsx ScrambleLink.tsx Marquee.tsx SplitReveal.tsx NoiseOverlay.tsx ScrollProgress.tsx Nav.tsx
lib/
  gsap.ts               # plugin registration, exports
  motion.ts             # eases, durations, staggers
  lenis.tsx             # Lenis provider + ScrollTrigger sync
  useMediaQueries.ts
content/site.ts
styles/globals.css      # tokens, grid, base typography
```

---

## 10. BUILD ORDER (do it in this sequence and verify each step before moving on)
1. Scaffold Next.js, Tailwind, fonts, tokens, and `content/site.ts`, with every section as **static, unanimated, semantic HTML**. The site must read well with zero JS.
2. Set up the Lenis and ScrollTrigger sync, `lib/gsap.ts`, and `lib/motion.ts`.
3. Hero: integrate `VectorWordmark` with every modification from §3.3, then add the preloader and the intro timeline.
4. Global systems: cursor, magnetic buttons, nav, progress bar, section headers.
5. Section animations in page order. After each one, test the reduced-motion and mobile branches.
6. Project visuals.
7. Performance pass (Lighthouse, Performance panel), accessibility pass (axe, keyboard-only run), SEO.
8. Deploy to Vercel.

---

## 11. DEFINITION OF DONE
- [ ] "NISHOK" renders in the WebGL VectorWordmark with vector handles, coordinate labels, and the dashed triangle, and it follows the cursor and auto-sweeps when idle.
- [ ] The wordmark is responsive down to 360px wide and has no min-width overflow.
- [ ] There is no horizontal scrollbar at any breakpoint.
- [ ] The intro timeline plays once per session and can be skipped.
- [ ] The Approach section's horizontal pin and the Work section's stacked cards both work on desktop and degrade gracefully on mobile.
- [ ] The Flip-based stack filter works.
- [ ] Reduced motion gives a complete, static, readable site.
- [ ] No console errors. No ScrollTrigger leaks when resizing across breakpoints, which you verify by resizing repeatedly.
- [ ] Lighthouse targets from §7 are met.
- [ ] All copy lives in `content/site.ts`.

**Don't:** use generic purple gradients, glassmorphism everywhere, emoji, stock 3D blobs, or a different animation style per section. **Do:** keep it restrained, precise, and blueprint-like, with every motion serving the "system being inspected" idea.
