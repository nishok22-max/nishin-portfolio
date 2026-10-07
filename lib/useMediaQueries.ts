"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CONDITIONS } from "./motion";

/** Subscribe to a CSS media query. Returns `fallback` during SSR. */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useReducedMotion = () => useMediaQuery(CONDITIONS.reduceMotion);

/** True when rich pointer effects (cursor, magnetic, tilt) should run. */
export const useRichPointer = () =>
  useMediaQuery(`${CONDITIONS.finePointer} and (min-width: 768px) and (prefers-reduced-motion: no-preference)`);
