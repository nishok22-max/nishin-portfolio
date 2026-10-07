"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONDITIONS, SCRAMBLE_CHARS } from "@/lib/motion";

type Props<T extends ElementType> = {
  as?: T;
  text: string;
  chars?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Any element whose label scrambles on hover / focus.
 * The visible label is aria-hidden; assistive tech reads a stable aria-label.
 */
export default function ScrambleLink<T extends ElementType = "a">({
  as,
  text,
  chars = SCRAMBLE_CHARS,
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "a") as ElementType;
  const root = useRef<HTMLElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP({ scope: root });

  const scramble = contextSafe(() => {
    if (!label.current || window.matchMedia(CONDITIONS.reduceMotion).matches) return;
    gsap.to(label.current, {
      duration: 0.4,
      scrambleText: { text, chars, speed: 0.6, revealDelay: 0.1 },
      overwrite: true,
    });
  });

  return (
    <Tag
      ref={root}
      aria-label={(rest as { "aria-label"?: string })["aria-label"] ?? text}
      onPointerEnter={scramble}
      onFocus={scramble}
      {...rest}
    >
      <span ref={label} aria-hidden="true">
        {text}
      </span>
      {children}
    </Tag>
  );
}
