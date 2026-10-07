import { site } from "@/content/site";
import { displayFamily } from "@/lib/fonts";
import Hero from "@/components/hero/Hero";
import Intro from "@/components/sections/Intro";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Approach from "@/components/sections/Approach";
import Work from "@/components/sections/Work";
import Stack from "@/components/sections/Stack";
import HowIThink from "@/components/sections/HowIThink";
import Currently from "@/components/sections/Currently";
import Beyond from "@/components/sections/Beyond";
import Manifesto from "@/components/sections/Manifesto";
import Contact from "@/components/sections/Contact";
import Marquee from "@/components/ui/Marquee";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: `@${site.handle}`,
  jobTitle: site.role,
  url: site.url,
  description: site.meta.description,
  knowsAbout: ["Artificial Intelligence", "Machine Learning", "Retrieval-Augmented Generation", "Full-Stack Development", "Interactive UI"],
  sameAs: [site.links.github],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\u003c") }}
      />
      <main id="main" tabIndex={-1}>
        <Hero fontFamily={displayFamily} />
        <div data-sheet className="sheet">
          <Marquee
            rows={[["AI Systems", "RAG Pipelines", "Full-Stack Products", "Multimodal AI", "Interactive UI", "Data & ML"]]}
            className="border-b border-line py-6"
          />
          <Intro />
          <About />
          <Capabilities />
          <Approach />
          <Work />
          <Stack />
          <HowIThink />
          <Currently />
          <Beyond />
          <Manifesto />
          <Contact fontFamily={displayFamily} />
        </div>
      </main>
    </>
  );
}
