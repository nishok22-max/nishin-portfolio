/**
 * Single source of truth for all copy on the site.
 * Inline emphasis uses **double asterisks** and is rendered by <Rich />.
 * Anything in [BRACKETS] is a placeholder to replace before launch.
 */

export type ProjectVisual = "thinksync" | "finax" | "lexiq";

export type Project = {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  links: { caseStudy?: string; github?: string; live?: string };
  visual: ProjectVisual;
};

export type StackGroupKey = "languages" | "aiml" | "dev" | "data";

export const site = {
  name: "Nishok",
  handle: "nishhz",
  role: "AI & Software Engineer — CSE (AIML) Student",
  location: "India",
  city: "India",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  email: "rknishok@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nishok.vercel.app",
  links: {
    github: "https://github.com/nishok22-max",
    resume: "/resume.pdf",
  },
  available: true,
  year: 2026,

  meta: {
    title: "Nishok — AI & Software Engineer",
    description:
      "Nishok is a CSE-AIML student building AI systems, full-stack products, and interactive interfaces — focused on the gap between “it works” and “it actually works well.”",
  },

  nav: [
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
    { id: "stack", label: "Stack" },
    { id: "contact", label: "Contact" },
  ],

  hero: {
    index: "00",
    label: "Index",
    srTitle: "Nishok — AI & Software Engineer",
    wordmark: "NISHOK",
    headline: "I build intelligent systems that feel simple.",
    sub: "I'm a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning, interested in the intersection of **AI, software engineering, data, and interactive product design**. I like taking complicated problems, breaking them down into systems, and turning them into products people can actually use.",
    tags: ["AI/ML", "Full-Stack Development", "Systems", "Interactive UI"],
    meta: "CSE — AIML",
    scrollCue: "Scroll",
    skip: "Click to skip",
  },

  intro: {
    index: "01",
    label: "Intro",
    title: "More than code.",
    lead: "I'm interested in what happens **after the model works**.",
    statements: [
      { text: "The interface has to make sense.", keyword: "Interface" },
      { text: "The system has to be reliable.", keyword: "System" },
      { text: "The data has to be traceable.", keyword: "Data" },
      { text: "The product has to solve a real problem.", keyword: "Product" },
    ],
    close:
      "That's how I approach projects — not as isolated coding exercises, but as complete systems.",
  },

  about: {
    index: "02",
    label: "About",
    title: "Who is Nishok?",
    paragraphs: [
      "I'm a CSE-AIML student who enjoys building at the intersection of **artificial intelligence and software engineering**.",
      "My work spans machine learning, RAG systems, multimodal AI, backend architecture, databases, data analysis, and modern web applications.",
      "I'm especially drawn to problems where there isn't an obvious solution — the kind where you have to think about **data, models, architecture, UX, performance, and real-world constraints at the same time.**",
      "I also care about how technology is presented. A technically strong system should not feel complicated to use.",
    ],
    /** Set to an image path in /public (e.g. "/portrait.jpg") once available. */
    portrait: "/portrait.jpg" as string | null,
    portraitAlt: "Portrait of Nishok",
  },

  capabilities: {
    index: "03",
    label: "What I Build",
    title: "What I build",
    items: [
      {
        index: "01",
        title: "AI Systems",
        body: "RAG pipelines, multimodal AI applications, intelligent assistants, semantic search, anomaly detection, and AI-powered workflows.",
        glyph: "graph",
      },
      {
        index: "02",
        title: "Full-Stack Products",
        body: "Modern web applications using React, TypeScript, Python, FastAPI, Node.js, databases, APIs, and cloud infrastructure.",
        glyph: "layers",
      },
      {
        index: "03",
        title: "Data & ML",
        body: "Data preprocessing, EDA, feature engineering, classical machine learning, deep learning experiments, embeddings, retrieval, and model evaluation.",
        glyph: "scatter",
      },
      {
        index: "04",
        title: "Interactive Experiences",
        body: "Interfaces where animation and interaction are part of the product experience — not decoration added afterwards.",
        glyph: "cursor",
      },
    ] as const,
  },

  approach: {
    index: "04",
    label: "My Approach",
    title: "My approach",
    intro: "I usually start with the problem rather than the technology.",
    steps: [
      { title: "Understand", body: "What is actually being solved?" },
      { title: "Design", body: "What should the system look like from the user's perspective?" },
      { title: "Build", body: "How do the AI, backend, data, and frontend fit together?" },
      { title: "Test", body: "What breaks? What is inaccurate? What is slow?" },
      { title: "Refine", body: "Remove unnecessary complexity and keep improving the experience." },
    ],
    loopLabel: "Iterate",
  },

  work: {
    index: "05",
    label: "Selected Work",
    title: "Selected work",
  },

  projects: [
    {
      slug: "thinksync",
      index: "01",
      title: "ThinkSync / Aetheris OS",
      tagline: "A multimodal AI research environment.",
      description:
        "A research platform combining **multi-agent orchestration, RAG, multimodal understanding, code intelligence, and memory** into one workspace. Built around the idea of making AI research more structured, contextual, and inspectable.",
      stack: ["React", "TypeScript", "FastAPI", "Gemini", "AWS Bedrock", "Groq", "Supabase", "pgvector"],
      links: {},
      visual: "thinksync",
    },
    {
      slug: "finax",
      index: "02",
      title: "FinaX / Liquidation Shield",
      tagline: "Autonomous protection for DeFi positions on the edge.",
      description:
        "An **atomic liquidation-protection vault for Aave V3 on Arbitrum One**. A Solidity vault and a Python/FastAPI keeper watch a position's health, simulate the fix, and flash-repay it in a single transaction — with an in-flight lock and a circuit breaker so the autonomous worker can't run away.",
      stack: ["Solidity", "Foundry", "Python", "FastAPI", "Aave V3", "Uniswap V3", "Chainlink", "Arbitrum"],
      links: { github: "https://github.com/nishok22-max/FinaX" },
      visual: "finax",
    },
    {
      slug: "lexiq",
      index: "03",
      title: "LexIQ",
      tagline: "Legal contracts, reviewed and negotiated by AI.",
      description:
        "An end-to-end, CPU-friendly system that **classifies clauses, scores risk, answers questions grounded in the contract, and drafts alternative wording** — culminating in an autonomous agent that produces a Negotiation Brief behind a human-approval gate. RAG answers cite their sources or refuse.",
      stack: ["Python", "FastAPI", "Streamlit", "scikit-learn", "DistilBERT", "spaCy", "FAISS", "Ollama", "MCP"],
      links: { github: "https://github.com/nishok22-max/lexiq" },
      visual: "lexiq",
    },
  ] as Project[],

  stackSection: {
    index: "06",
    label: "Tech Stack",
    title: "Tech stack",
    filters: [
      { key: "all", label: "All" },
      { key: "languages", label: "Languages" },
      { key: "aiml", label: "AI-ML" },
      { key: "dev", label: "Dev" },
      { key: "data", label: "Data" },
    ] as const,
  },

  stack: {
    languages: { label: "Languages", items: ["Python", "Java", "C", "SQL"] },
    aiml: {
      label: "AI / ML",
      items: ["Machine Learning", "Deep Learning", "Embeddings", "RAG", "Semantic Search", "Computer Vision", "NLP"],
    },
    dev: { label: "Development", items: ["FastAPI", "Flask"] },
    data: {
      label: "Data",
      items: ["NumPy", "Pandas", "Matplotlib", "scikit-learn", "PostgreSQL", "pgvector", "Qdrant"],
    },
  } satisfies Record<StackGroupKey, { label: string; items: string[] }>,

  thinking: {
    index: "07",
    label: "How I Think",
    before: "I'm obsessed with the gap between",
    rough: "it works",
    and: "and",
    clean: "it actually works well.",
    gapLabel: "Gap",
    failures: ["bad input", "latency", "failure cases", "scale", "usability", "trust"],
    body: "A prototype can call an API. A product needs to handle bad input, latency, failure cases, scale, usability, and trust. That gap is where I like working.",
  },

  currently: {
    index: "08",
    label: "Currently",
    titleWords: ["Building.", "Learning.", "Experimenting."],
    intro: "Right now I'm exploring deeper into:",
    items: [
      { label: "AI agents", level: 8 },
      { label: "Multimodal systems", level: 6 },
      { label: "Advanced RAG", level: 7 },
      { label: "AI product engineering", level: 7 },
      { label: "System architecture", level: 6 },
      { label: "Interactive web experiences", level: 8 },
    ],
    outro:
      "I'm particularly interested in combining powerful AI systems with interfaces that make them feel intuitive.",
    command: "status --current",
    status: "Active",
    lastUpdated: "2026-09",
  },

  beyond: {
    index: "09",
    label: "Beyond the Stack",
    title: "Beyond the stack",
    lead: "I enjoy experimenting with ideas that sit somewhere between engineering and design.",
    rows: [
      {
        text: "Sometimes that means building an AI system.",
        icon: "network",
        example: "e.g. a retrieval assistant that cites its sources instead of guessing.",
      },
      {
        text: "Sometimes it means redesigning an interface.",
        icon: "wireframe",
        example: "e.g. turning a twelve-field form into three clear steps.",
      },
      {
        text: "Sometimes it means figuring out why something technically works but still feels wrong.",
        icon: "warning",
        example: "e.g. a response that's correct in 900ms — and still feels broken.",
      },
    ] as const,
    close: "I like all three.",
  },

  manifesto: {
    index: "10",
    label: "Personal Line",
    lines: [
      { text: "Build things that are technically interesting.", key: "interesting" },
      { text: "Make them useful.", key: "useful" },
      { text: "Make them feel good to use.", key: "feel good" },
    ],
  },

  contact: {
    index: "11",
    label: "Contact",
    title: "Have an idea worth building?",
    body: "I'm always interested in interesting problems, ambitious projects, collaborations, and opportunities to build.",
    cta: "Let's make something.",
    copied: "Copied ✓",
    copyHint: "Click to copy email",
    timeLabel: "Local time",
    backToTop: "Back to top",
  },

};

export type Site = typeof site;

/** Flattened stack for the filterable grid. */
export const stackChips = (Object.keys(site.stack) as StackGroupKey[]).flatMap((group) =>
  site.stack[group].items.map((name) => ({ name, group, groupLabel: site.stack[group].label })),
);
