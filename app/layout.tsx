import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { sans, mono } from "@/lib/fonts";
import { site } from "@/content/site";
import { LenisProvider } from "@/lib/lenis";
import Nav from "@/components/ui/Nav";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import DotGrid from "@/components/ui/DotGrid";
import ScrollProgress from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.meta.title,
  description: site.meta.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: ["Nishok", "AI engineer", "machine learning", "RAG", "full-stack", "portfolio", "CSE AIML"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: site.meta.title,
    description: site.meta.description,
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
    creator: `@${site.handle}`,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* Runs before paint: flags JS, motion preference, and whether the
   once-per-session intro should play. */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r){d.classList.add('motion');var s=null;try{s=sessionStorage.getItem('nishok:intro')}catch(e){}if(!s){d.classList.add('intro')}}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      style={{ backgroundColor: "#0a0a0a", color: "#f2f2f2" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body style={{ backgroundColor: "#0a0a0a", color: "#f2f2f2" }} suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <LenisProvider>
          <DotGrid />
          <Nav />
          <ScrollProgress />
          {children}
          <NoiseOverlay />
        </LenisProvider>
      </body>
    </html>
  );
}
