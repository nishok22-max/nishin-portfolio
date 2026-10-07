"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/motion";
import type { VisualProps } from "@/components/sections/Work";
import { useLoop } from "./useLoop";

const CLAUSES = [
  { label: "GOVERNING LAW", risk: "LOW", w: 300 },
  { label: "LIMITATION OF LIABILITY", risk: "HIGH", w: 340 },
  { label: "TERMINATION", risk: "MED", w: 280 },
  { label: "INDEMNIFICATION", risk: "HIGH", w: 320 },
  { label: "CONFIDENTIALITY", risk: "LOW", w: 260 },
];
const RISK_COLOR: Record<string, string> = { LOW: "var(--fg-muted)", MED: "#f0b429", HIGH: "#ff5d5d" };
const TOP = 86;
const ROW = 50;

/** An agent scans a contract, tags each clause with a risk level, then drafts a brief. */
export default function LexiqVisual({ active }: VisualProps) {
  const root = useRef<SVGSVGElement>(null);
  const loop = useRef<gsap.core.Timeline>(undefined);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
      const bottom = TOP + CLAUSES.length * ROW;
      tl.set("[data-tag], [data-brief], [data-check]", { opacity: 0 })
        .set("[data-line]", { opacity: 0.35 })
        .set("[data-scan]", { attr: { y1: TOP - 10, y2: TOP - 10 }, opacity: 1 });
      CLAUSES.forEach((_, i) => {
        const y = TOP + i * ROW;
        tl.to("[data-scan]", { attr: { y1: y + 30, y2: y + 30 }, duration: 0.7, ease: "power1.inOut" })
          .to(`[data-row="${i}"] [data-line]`, { opacity: 1, duration: 0.2 }, "<0.4")
          .fromTo(`[data-row="${i}"] [data-tag]`, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, ease: EASE_OUT }, "<0.15");
      });
      tl.to("[data-scan]", { attr: { y1: bottom + 6, y2: bottom + 6 }, opacity: 0, duration: 0.5 })
        .to("[data-brief]", { opacity: 1, y: 0, duration: 0.6, ease: EASE_OUT }, "-=0.1")
        .to("[data-check]", { opacity: 1, duration: 0.2 }, "+=1.2")
        .to({}, { duration: 1.6 });
      loop.current = tl;
    },
    { scope: root },
  );

  useLoop(active, () => [loop.current]);

  const briefY = TOP + CLAUSES.length * ROW + 14;

  return (
    <svg ref={root} viewBox="0 0 600 480" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1" fill="var(--fg-dim)">
        <text x="48" y="44">CONTRACT.PDF · 41 CUAD CLAUSE TYPES</text>
        <text x="552" y="44" textAnchor="end">RISK SCORING</text>
      </g>
      <line x1="48" y1="58" x2="552" y2="58" stroke="var(--line-strong)" />

      {CLAUSES.map((c, i) => {
        const y = TOP + i * ROW;
        return (
          <g key={c.label} data-row={i}>
            <text x="48" y={y + 6} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1" fill="var(--fg-dim)">
              {String(i + 1).padStart(2, "0")} · {c.label}
            </text>
            <g data-line>
              <rect x="48" y={y + 14} width={c.w} height="4" rx="2" fill="var(--line-strong)" />
              <rect x="48" y={y + 24} width={c.w * 0.72} height="4" rx="2" fill="var(--line-strong)" />
            </g>
            <g data-tag>
              <rect x="452" y={y + 8} width="100" height="22" rx="11" fill="none" stroke={RISK_COLOR[c.risk]} />
              <text x="502" y={y + 23} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1" fill={RISK_COLOR[c.risk]}>
                {c.risk} RISK
              </text>
            </g>
          </g>
        );
      })}

      <line data-scan x1="40" x2="560" y1={TOP - 10} y2={TOP - 10} stroke="var(--accent)" strokeWidth="1.5" />

      <g data-brief transform="translate(0 0)">
        <rect x="48" y={briefY} width="504" height="44" rx="8" fill="var(--bg)" stroke="var(--accent)" />
        <text x="66" y={briefY + 27} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.2" fill="var(--accent)">
          NEGOTIATION BRIEF · AWAITING HUMAN APPROVAL
        </text>
        <g data-check>
          <rect x="522" y={briefY + 14} width="16" height="16" rx="3" fill="var(--accent)" />
          <path d={`M526 ${briefY + 22} l4 4 l7 -8`} fill="none" stroke="var(--bg)" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}
