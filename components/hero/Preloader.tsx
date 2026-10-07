import type { Ref } from "react";
import { site } from "@/content/site";

type Props = {
  ref?: Ref<HTMLDivElement>;
};

/** First-visit preloader. Shown only when <html> has the `intro` class. */
export default function Preloader({ ref }: Props) {
  return (
    <div
      ref={ref}
      data-preloader
      aria-hidden="true"
      className="preloader fixed inset-0 z-[120] flex-col justify-end bg-bg"
      style={{ clipPath: "inset(0 0 0% 0)", backgroundColor: "#0a0a0a" }}
    >
      <div className="shell relative pb-[clamp(20px,4vw,40px)]">
        <div data-preloader-line className="hairline mb-5 origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
        <div className="flex items-end justify-between">
          <span
            data-preloader-count
            className="font-mono text-[clamp(2.5rem,7vw,5.5rem)] leading-none tracking-[-0.02em] text-fg tabular-nums"
          >
            000
          </span>
          <span className="mono">{site.hero.skip}</span>
        </div>
      </div>
    </div>
  );
}
