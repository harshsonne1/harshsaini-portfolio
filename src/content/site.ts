// Central content for the portfolio. Edit these values to personalize the site.

export const site = {
  name: "Harsh Saini",
  role: "Product Designer",
  tagline:
    "I build fast, accessible web experiences — from pixel-perfect interfaces to the systems behind them.",
  location: "India",
  email: "harshsonne1@gmail.com",
  resumeUrl: "/resume.pdf",
  socials: {
    github: "https://github.com/harshsonne1",
    instagram: "https://www.instagram.com/harsh.saini/",
    linkedin: "https://www.linkedin.com/in/harsh-saini-49212818b/",
    dribbble: "", // blank for now
  },
  // birth details (right column of the about section)
  birth: {
    date: "29th October, 1994",
    city: "Bangalore",
    country: "India",
  },
  // current location — Bangalore, India
  coordinates: {
    lat: "12.9715987° N",
    lng: "77.5945627° E",
  },
  // stylised code shown above the barcode
  barcode: "%HS@BLR29OCT1994",
} as const;

// Social links for the about section, in display order.
export const socialLinks = [
  { label: "GitHub", href: site.socials.github },
  { label: "Instagram", href: site.socials.instagram },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "Dribbble", href: site.socials.dribbble },
] as const;

export type Skill = { category: string; items: string[] };

export const skills: Skill[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "REST", "GraphQL"],
  },
  {
    category: "Tooling",
    items: ["Git", "Vite", "Docker", "Vercel", "Figma"],
  },
];

export type Project = {
  /* url segment — the case study lives at /work/<slug> */
  slug: string;
  title: string;
  description: string;
  tags: string[];
  year?: string;
  /* the live site, linked from the case study's Website field */
  link?: string;
  repo?: string;
  /* optional media; falls back to a generated gradient tile */
  image?: string;
  /* ---- case study page ---- placeholder copy for now */
  /* the opening statement, set large beside the wordmark */
  statement?: string;
  industry?: string;
  scope?: string;
  /* short body sections under the cover */
  body?: { heading: string; text: string }[];
};

export const projects: Project[] = [
  {
    slug: "shopos",
    title: "ShopOS.ai",
    year: "2024 — Present",
    description:
      "Designing an AI-native commerce platform — from zero-to-one product flows to a design system that scales.",
    tags: ["Product Design", "Design Systems"],
    link: "https://shopos.ai",
    image: "/cover-ShopOS.webp",
    statement:
      "Commerce tooling had grown dense and hard to move through. I wanted an AI-native surface that did the heavy lifting quietly, and still left the merchant in control.",
    industry: "AI, Commerce",
    scope: "Product Design, Design Systems",
    body: [
      {
        heading: "Context",
        text: "Placeholder copy. The team needed a product surface that could absorb agentic workflows without the interface turning into a control panel.",
      },
      {
        heading: "Approach",
        text: "Placeholder copy. Zero-to-one flows first, then the primitives underneath them — tokens, layout rules, and a component set the team could extend on its own.",
      },
      {
        heading: "Outcome",
        text: "Placeholder copy. A system that scales across new surfaces, and a shared language between design and engineering.",
      },
    ],
  },
  {
    slug: "sketchmonk",
    title: "SketchMonk Design Studio",
    year: "2022 — 2024",
    description:
      "Multidisciplinary studio work across brand, web, and product for a range of clients.",
    tags: ["Brand", "Web", "Product"],
    image: "/cover-SKM.webp",
    statement:
      "Studio work moves fast and rarely twice the same way. The craft was in finding the through-line — one voice across brand, web, and product for very different clients.",
    industry: "Studio, Brand",
    scope: "Brand, Web, Product",
    body: [
      {
        heading: "Context",
        text: "Placeholder copy. A range of clients, each arriving with a different problem and a different appetite for design.",
      },
      {
        heading: "Approach",
        text: "Placeholder copy. Set the brand foundations early, then let the web and product work inherit them rather than reinvent per project.",
      },
      {
        heading: "Outcome",
        text: "Placeholder copy. Faster starts on new engagements, and work that reads as one studio rather than a portfolio of one-offs.",
      },
    ],
  },
];

export type Experience = {
  period: string;
  role: string;
  company: string;
  description: string;
};

// derived from the LinkedIn experience section
export const experience: Experience[] = [
  {
    period: "Oct 2025 - Present",
    role: "Product Designer",
    company: "ShopOS",
    description:
      "Product designer at ShopOS — a full-time, on-site role in Bangalore, working across Vibe Design, agentic workflows, and the systems that support them.",
  },
  {
    period: "Nov 2024 - Oct 2025",
    role: "UI/UX Designer",
    company: "SketchMonk",
    description:
      "Remote UI/UX designer at SketchMonk, focused on user experience design (UED) and UI design across product work.",
  },
  {
    period: "Oct 2024 - Jan 2025",
    role: "Freelance Designer",
    company: "Digitow Design Studio",
    description:
      "Part-time freelance designer with Digitow Design Studio (remote), working across user interface design and Lean UX.",
  },
  {
    period: "Apr 2024 - Oct 2024",
    role: "Product Design Fellow",
    company: "ownpath",
    description:
      "Product design fellowship at ownpath — a remote internship building foundations in Figma, UX research, and design craft.",
  },
];
