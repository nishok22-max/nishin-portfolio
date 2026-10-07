import { Geist, Geist_Mono } from "next/font/google";

export const sans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
  variable: "--font-geist",
  preload: true,
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-geist-mono",
  preload: false,
});

/** The resolved family name next/font generated (used by the WebGL wordmark). */
export const displayFamily = sans.style.fontFamily;
