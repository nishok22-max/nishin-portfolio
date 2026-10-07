"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_INOUT, EASE_OUT } from "@/lib/motion";
import type { VisualProps } from "@/components/sections/Work";
import { useLoop } from "./useLoop";

const BAR_X = 60;
const BAR_W = 480;
const HF_MIN = 0.8;
const HF_MAX = 2.0;
const hfToX = (hf: number) => BAR_X + ((hf - HF_MIN) / (HF_MAX - HF_MIN)) * BAR_W;

/** Health factor falls toward 1.00; the vault flash-repays it back to safety. */
export default function FinaxVisual({ active }: VisualProps) {
  const root = useRef<SVGSVGElement>(null);
  const loop = useRef<gsap.core.Timeline>(undefined);

  useGSAP(
    () => {
      const svg = root.current!;
      const state = { hf: 1.85 };
      const marker = svg.querySelector<SVGGElement>("[data-marker]")!;
      const hfText = svg.querySelector<SVGTextElement>("[data-hf]")!;
      const status = svg.querySelector<SVGTextElement>("[data-status]")!;
      const fill = svg.querySelector<SVGRectElement>("[data-fill]")!;

      const paint = () => {
        const x = hfToX(state.hf);
        marker.setAttribute("transform", `translate(${x} 0)`);
        fill.setAttribute("width", String(Math.max(0, x - BAR_X)));
        hfText.textContent = state.hf.toFixed(2);
        const danger = state.hf < 1.15;
        fill.setAttribute("fill", danger ? "#ff5d5d" : "var(--accent)");
        hfText.setAttribute("fill", danger ? "#ff5d5d" : "var(--fg)");
      };
      paint();

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
      tl.set(state, { hf: 1.85 })
        .set("[data-flow], [data-alert], [data-vault-glow]", { opacity: 0 })
        .call(() => (status.textContent = "MONITORING · ARBITRUM ONE"))
        // Collateral price falls.
        .to(state, { hf: 1.04, duration: 2.6, ease: "power1.in", onUpdate: paint })
        .call(() => (status.textContent = "HF < 1.05 · SIMULATING REPAY"))
        .to("[data-alert]", { opacity: 1, duration: 0.2 })
        // Keeper simulates, then the atomic flash-repay fires.
        .to("[data-flow]", { opacity: 1, strokeDashoffset: -60, duration: 1, ease: "none" }, "+=0.4")
        .to("[data-vault-glow]", { opacity: 1, duration: 0.3 }, "<0.4")
        .call(() => (status.textContent = "FLASH-REPAY · 1 TX · ATOMIC"))
        .to(state, { hf: 1.62, duration: 1.1, ease: EASE_OUT, onUpdate: paint })
        .to("[data-alert]", { opacity: 0, duration: 0.3 }, "<")
        .call(() => (status.textContent = "POSITION SAFE"))
        .to({}, { duration: 1.6 })
        .to("[data-flow], [data-vault-glow]", { opacity: 0, duration: 0.5, ease: EASE_INOUT });
      loop.current = tl;
    },
    { scope: root },
  );

  useLoop(active, () => [loop.current]);

  const ticks = [1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <svg ref={root} viewBox="0 0 600 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1" fill="var(--fg-dim)">
        <text x="60" y="52">AAVE V3 · WETH / USDC POSITION</text>
        <text x="540" y="52" textAnchor="end">KEEPER · FASTAPI</text>
      </g>

      {/* Health factor readout */}
      <text data-hf x="60" y="140" fontFamily="var(--font-mono)" fontSize="64" fontWeight="500" fill="var(--fg)">
        1.85
      </text>
      <text x="60" y="164" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5" fill="var(--fg-dim)">
        HEALTH FACTOR
      </text>

      {/* Bar */}
      <rect x={BAR_X} y="220" width={BAR_W} height="6" fill="var(--line-strong)" />
      <rect data-fill x={BAR_X} y="220" width="0" height="6" fill="var(--accent)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={hfToX(t)} y1="216" x2={hfToX(t)} y2="232" stroke="var(--fg-dim)" />
          <text x={hfToX(t)} y="248" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-dim)">
            {t.toFixed(2)}
          </text>
        </g>
      ))}
      {/* Liquidation threshold */}
      <line x1={hfToX(1)} y1="200" x2={hfToX(1)} y2="236" stroke="#ff5d5d" strokeDasharray="3 3" />
      <text x={hfToX(1)} y="192" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#ff5d5d">
        LIQUIDATION
      </text>

      <g data-marker>
        <path d="M0 208 L-6 198 L6 198 Z" fill="var(--fg)" />
      </g>

      <text data-alert x="300" y="286" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5" fill="#ff5d5d" opacity="0">
        ⚠ LIQUIDATION RISK
      </text>

      {/* Keeper → vault flow */}
      <rect x="60" y="316" width="130" height="44" rx="6" fill="var(--bg)" stroke="var(--line-strong)" />
      <text x="125" y="342" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1" fill="var(--fg)">
        KEEPER
      </text>
      <rect data-vault-glow x="408" y="312" width="140" height="52" rx="8" fill="none" stroke="var(--accent)" opacity="0" />
      <rect x="412" y="316" width="132" height="44" rx="6" fill="var(--bg)" stroke="var(--accent)" />
      <text x="478" y="342" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1" fill="var(--accent)">
        SHIELD VAULT
      </text>
      <line x1="190" y1="338" x2="412" y2="338" stroke="var(--line-strong)" strokeDasharray="2 6" />
      <line data-flow x1="190" y1="338" x2="412" y2="338" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="10 50" opacity="0" />

      <text data-status x="60" y="398" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5" fill="var(--fg-muted)">
        MONITORING · ARBITRUM ONE
      </text>
    </svg>
  );
}
