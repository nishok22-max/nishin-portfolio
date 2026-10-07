import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

async function loadInter(text: string) {
  // Fetch only the glyphs we need from Google Fonts (Inter 800).
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@800&text=${encodeURIComponent(text)}`,
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) return null;
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const word = site.hero.wordmark;
  const font = await loadInter(word).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          backgroundImage: "radial-gradient(circle, #2E2E2E 1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          padding: 56,
          color: "#8A8A8A",
          fontSize: 20,
          letterSpacing: 2,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>[00] — INDEX</span>
          <span>x: 42 y: 67</span>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: font ? "Inter" : undefined,
            fontWeight: 800,
            fontSize: 250,
            letterSpacing: -10,
            lineHeight: 1,
            color: "#F2F2F2",
            justifyContent: "center",
          }}
        >
          {word}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>AI & SOFTWARE ENGINEER — CSE (AIML)</span>
          <span style={{ display: "flex", alignItems: "center", color: "#bde85a" }}>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: "#bde85a", marginRight: 12 }} />
            {site.available ? "AVAILABLE" : "PORTFOLIO"}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Inter", data: font, weight: 800, style: "normal" }] : undefined,
    },
  );
}
