<div align="center">

# ⚡ NISHOK // PORTFOLIO

<p align="center">
  <strong>AI & Software Engineer — CSE (AIML) Student</strong>
</p>

<p align="center">
  <em>"I build intelligent systems that feel simple — obsessed with the gap between <b>it works</b> and <b>it actually works well</b>."</em>
</p>

<br />

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP%203.13-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)
[![WebGL](https://img.shields.io/badge/Raw_WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live_Demo-22c55e?style=for-the-badge&logo=githubpages&logoColor=white)](https://nishok22-max.github.io/nishin-portfolio/)

<br />

[🌐 **Live Demo (GitHub Pages)**](https://nishok22-max.github.io/nishin-portfolio/) • [Explore Selected Work](#-featured-projects) • [Tech Stack](#-technology-matrix) • [Architecture](#-project-architecture) • [Quick Start](#-quick-start) • [Connect](#-connect)

</div>

---

## 📐 Overview

An award-grade, blueprint-inspired engineering portfolio built with **Next.js 15 App Router**, **GSAP 3**, and **Raw WebGL**. Designed around the aesthetic language of technical CAD tools, telemetry readouts, coordinate grids, and precision motion design.

The portfolio is not just a showcase of projects—it is itself an embodiment of core engineering principles:

- **Systemic Design**: Engineering blueprint aesthetic with monochromatic tones (`#0A0A0A`) punctuated by an acid lime signal accent (`#C6FF3D`).
- **GPU-Accelerated Visuals**: Interactive raw WebGL vector wordmark with dynamic mouse tracking and vector handle rendering.
- **Precision Motion**: 60fps smooth scrolling powered by **Lenis** synchronized with **GSAP ScrollTrigger**, **SplitText**, and **ScrambleText** plugins.
- **Interactive Project Teardowns**: Live interactive visualizers for flagship AI, Web3, and Systems engineering projects.

---

## 🛠️ Technology Matrix

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technologies</th>
      <th>Key Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Core Framework</b></td>
      <td><code>Next.js 15</code> (App Router) • <code>React 19</code> • <code>TypeScript</code></td>
      <td>Server & Client Components, strict type safety, zero layout shifts</td>
    </tr>
    <tr>
      <td><b>Styling & Design System</b></td>
      <td><code>Tailwind CSS v4</code> • CSS Custom Properties</td>
      <td>Blueprint CAD aesthetic, custom dot grids, noise texture, hairline borders</td>
    </tr>
    <tr>
      <td><b>Motion & Animation</b></td>
      <td><code>GSAP 3.13+</code> • <code>@gsap/react</code> (<code>useGSAP</code>)</td>
      <td>ScrollTrigger, SplitText reveals, ScrambleText links, Magnetic buttons</td>
    </tr>
    <tr>
      <td><b>Smooth Scroll</b></td>
      <td><code>Lenis 1.3+</code></td>
      <td>Synchronized with GSAP ticker loop for stutter-free scroll physics</td>
    </tr>
    <tr>
      <td><b>Graphics & WebGL</b></td>
      <td><code>Raw WebGL</code> (Custom Shaders & Canvas)</td>
      <td>Vector glyph rendering, coordinate HUD, real-time mouse repulsion</td>
    </tr>
    <tr>
      <td><b>Typography & Icons</b></td>
      <td><code>Inter</code> • <code>JetBrains Mono</code> • <code>Lucide React</code></td>
      <td>Engineering monospace metadata and tight display typography</td>
    </tr>
  </tbody>
</table>

---

## 🚀 Featured Projects

### `01` ThinkSync / Aetheris OS
> **A multimodal AI research environment and workspace.**

- **Focus**: Multi-agent orchestration, contextual memory, and code intelligence.
- **Tech Stack**: `React` • `TypeScript` • `FastAPI` • `Gemini` • `AWS Bedrock` • `Groq` • `Supabase` • `pgvector`
- **Features**: Structured AI research, RAG pipeline with vector embeddings, real-time agent observability.

---

### `02` FinaX / Liquidation Shield
> **Autonomous protection for DeFi positions on the edge.**

- **Focus**: Atomic liquidation-protection vault for Aave V3 on Arbitrum One.
- **Tech Stack**: `Solidity` • `Foundry` • `Python` • `FastAPI` • `Aave V3` • `Uniswap V3` • `Chainlink` • `Arbitrum`
- **Features**: In-flight locks, flash-repay in a single atomic transaction, automated keeper circuit breakers.
- **Code**: [GitHub Repository](https://github.com/nishok22-max/FinaX)

---

### `03` LexIQ
> **Legal contracts, reviewed and negotiated by AI.**

- **Focus**: End-to-end, CPU-friendly legal contract intelligence and negotiation agent.
- **Tech Stack**: `Python` • `FastAPI` • `Streamlit` • `scikit-learn` • `DistilBERT` • `spaCy` • `FAISS` • `Ollama` • `MCP`
- **Features**: Clause classification, risk scoring, source-grounded RAG citations, autonomous human-in-the-loop negotiation brief.
- **Code**: [GitHub Repository](https://github.com/nishok22-max/lexiq)

---

## 🎨 Design System & Visual Tokens

The aesthetic draws inspiration from aerospace telemetry, CAD schematics, and precision laboratory instruments:

```css
/* Color Palette */
--bg:          #0A0A0A;   /* Primary dark canvas */
--bg-elev:     #111111;   /* Elevated cards and modules */
--line:        #1F1F1F;   /* Hairline borders & coordinate grid */
--line-strong: #2E2E2E;   /* Emphasized divider lines */
--fg:          #F2F2F2;   /* Primary high-contrast text */
--fg-muted:    #8A8A8A;   /* Secondary descriptive text */
--fg-dim:      #4A4A4A;   /* Monospace annotations & indices */
--accent:      #C6FF3D;   /* Signal Acid Lime — used with strict restraint */
```

### Motion Design Guidelines
- 🎯 **Strict Scope**: Every GSAP instance runs scoped via `useGSAP()` to prevent memory leaks.
- 💨 **Hardware Acceleration**: Only `transform` and `opacity` are animated to guarantee 60+ FPS on any display.
- 📐 **Responsive Branching**: All animations adapt to screen sizes and respect `prefers-reduced-motion` via `gsap.matchMedia()`.

---

## 📁 Project Architecture

```plaintext
portfolio/
├── app/
│   ├── layout.tsx             # Root layout, Lenis setup, fonts & metadata
│   ├── page.tsx               # Primary portfolio single-page application
│   ├── opengraph-image.tsx    # Dynamic OpenGraph social card generator
│   └── globals.css            # Base stylesheet & Tailwind CSS v4 tokens
├── components/
│   ├── hero/
│   │   ├── Hero.tsx           # Hero section orchestrator & HUD
│   │   ├── VectorWordmark.tsx # GPU-driven Raw WebGL interactive typography
│   │   └── Preloader.tsx      # Precision boot sequence & asset preloader
│   ├── sections/
│   │   ├── About.tsx          # Background, biography & portrait display
│   │   ├── Approach.tsx       # 5-step engineering problem-solving loop
│   │   ├── Beyond.tsx         # Engineering vs Design philosophical crossover
│   │   ├── Capabilities.tsx   # Core competencies matrix
│   │   ├── Contact.tsx        # Direct contact terminal & channels
│   │   ├── Currently.tsx      # Active radar & tech exploration status
│   │   ├── HowIThink.tsx      # "Works" vs "Works Well" dynamic comparison
│   │   ├── Intro.tsx          # Engineering manifesto
│   │   ├── Manifesto.tsx      # Core tenets
│   │   ├── Stack.tsx          # Filterable tech stack matrix
│   │   └── Work.tsx           # Selected projects showcase
│   ├── ui/
│   │   ├── DotGrid.tsx        # Subtle CAD grid background
│   │   ├── MagneticButton.tsx # Interactive cursor-attracting button
│   │   ├── Marquee.tsx        # Infinite smooth horizontal ticker
│   │   ├── Nav.tsx            # Floating coordinate-tracked navigation bar
│   │   ├── ScrambleLink.tsx   # Matrix-style text scrambling link
│   │   ├── ScrollProgress.tsx # Scroll position telemetry bar
│   │   └── SplitReveal.tsx    # Split-line typographic entrance animation
│   └── work/
│       └── visuals/           # Bespoke interactive project visualizers
│           ├── FinaxVisual.tsx
│           ├── LexiqVisual.tsx
│           └── ThinkSyncVisual.tsx
├── content/
│   └── site.ts                # Single source of truth for site copy & data
├── lib/
│   └── gsap.ts                # GSAP singleton configuration & plugin registration
└── public/                    # Static assets, icons, and textures
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** `>= 18.17.0` (Recommended: Node 20+)
- **npm** or **pnpm** or **yarn**

### 2. Clone the Repository
```bash
git clone https://github.com/nishok22-max/nishin-portfolio.git
cd nishin-portfolio
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to experience the site.

### 5. Production Build & Verification
```bash
# Typecheck TypeScript definitions
npm run typecheck

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🌐 Connect

<div align="center">

**Nishok** — AI & Software Engineer

[![GitHub](https://img.shields.io/badge/GitHub-nishok22--max-181717?style=flat-square&logo=github)](https://github.com/nishok22-max)
[![Email](https://img.shields.io/badge/Email-rknishok%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:rknishok@gmail.com)
[![GitHub Pages](https://img.shields.io/badge/Live_Site-GitHub_Pages-22c55e?style=flat-square&logo=githubpages&logoColor=white)](https://nishok22-max.github.io/nishin-portfolio/)

</div>

---

<div align="center">
  <sub>Crafted with precision • Engineered for performance • 2026</sub>
</div>
