"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { VisualProps } from "@/components/sections/Work";
import { useLoop } from "./useLoop";

const CX = 300;
const CY = 240;
const CORE = 44;
const AGENTS = [
  { name: "Planner", orbit: 0, angle: 20 },
  { name: "Retriever", orbit: 0, angle: 140 },
  { name: "Coder", orbit: 0, angle: 260 },
  { name: "Vision", orbit: 1, angle: 80 },
  { name: "Critic", orbit: 1, angle: 230 },
];
const ORBITS = [120, 190];

/** Agent nodes orbiting a shared memory core; packets show message passing. */
export default function ThinkSyncVisual({ active }: VisualProps) {
  const root = useRef<SVGSVGElement>(null);
  const loops = useRef<gsap.core.Animation[]>([]);

  useGSAP(
    () => {
      const anims: gsap.core.Animation[] = [];
      ORBITS.forEach((_, o) => {
        anims.push(
          gsap.to(`[data-orbit="${o}"]`, {
            rotation: o ? -360 : 360,
            svgOrigin: `${CX} ${CY}`,
            duration: o ? 70 : 48,
            ease: "none",
            repeat: -1,
            paused: true,
          }),
        );
      });
      gsap.utils.toArray<SVGCircleElement>("[data-packet]").forEach((p, i) => {
        const r = ORBITS[AGENTS[i].orbit];
        anims.push(
          gsap.fromTo(
            p,
            { attr: { cx: CORE + 4 }, opacity: 0 },
            {
              attr: { cx: r - 12 },
              opacity: 1,
              duration: 1.1,
              ease: "power1.inOut",
              repeat: -1,
              yoyo: true,
              repeatDelay: 0.4 + i * 0.23,
              delay: i * 0.37,
              paused: true,
            },
          ),
        );
      });
      anims.push(
        gsap.fromTo(
          "[data-pulse]",
          { attr: { r: CORE }, opacity: 0.6 },
          { attr: { r: CORE + 40 }, opacity: 0, duration: 2, ease: "expo.out", repeat: -1, stagger: 1, paused: true },
        ),
      );
      anims.push(
        gsap.to("[data-edge]", {
          strokeDashoffset: -20,
          duration: 1.2,
          ease: "none",
          repeat: -1,
          paused: true,
        }),
      );
      loops.current = anims;
    },
    { scope: root },
  );

  useLoop(active, () => loops.current);

  return (
    <svg ref={root} viewBox="0 0 600 480" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {ORBITS.map((r) => (
        <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="var(--line-strong)" strokeDasharray="2 6" />
      ))}
      {ORBITS.map((_, o) => (
        <g key={o} data-orbit={o}>
          {AGENTS.map((a, i) =>
            a.orbit !== o ? null : (
              <g key={a.name} transform={`rotate(${a.angle} ${CX} ${CY})`}>
                <g transform={`translate(${CX} ${CY})`}>
                  <line data-edge x1={CORE} y1={0} x2={ORBITS[o] - 12} y2={0} stroke="var(--fg-dim)" strokeDasharray="3 7" />
                  <circle data-packet cx={CORE + 4} cy={0} r={3} fill="var(--accent)" />
                  <circle cx={ORBITS[o]} cy={0} r={11} fill="var(--bg-elev)" stroke="var(--fg)" />
                  <text
                    x={ORBITS[o]}
                    y={3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fill="var(--fg)"
                    transform={`rotate(${-a.angle} ${ORBITS[o]} 0)`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </text>
                </g>
              </g>
            ),
          )}
        </g>
      ))}
      <circle data-pulse cx={CX} cy={CY} r={CORE} fill="none" stroke="var(--accent)" />
      <circle data-pulse cx={CX} cy={CY} r={CORE} fill="none" stroke="var(--accent)" />
      <circle cx={CX} cy={CY} r={CORE} fill="var(--bg)" stroke="var(--accent)" />
      <text x={CX} y={CY + 4} textAnchor="middle" fontSize="10" letterSpacing="1" fontFamily="var(--font-mono)" fill="var(--accent)">
        MEMORY
      </text>
      <g fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.8" fill="var(--fg-dim)">
        {AGENTS.map((a, i) => (
          <text key={a.name} x={24} y={36 + i * 16}>
            {String(i + 1).padStart(2, "0")} {a.name.toUpperCase()}
          </text>
        ))}
        <text x={576} y={456} textAnchor="end">
          AGENTS 05 · CTX SHARED
        </text>
      </g>
    </svg>
  );
}
