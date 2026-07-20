// Central content for the portfolio. Edit these values to personalize the site.

export const site = {
  name: "Harsh Saini",
  role: "Product Designer",
  tagline:
    "I build fast, accessible web experiences — from pixel-perfect interfaces to the systems behind them.",
  location: "India",
  email: "hello@harshsaini.dev",
  resumeUrl: "#",
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

// Stats shown in the Work section header (edit to your real numbers).
export const stats = [
  { label: "PROJECTS", value: "> 100 DEPLOYED" },
  { label: "USERS_SERVED", value: "1.2M+" },
  { label: "A/B TESTS", value: "450+" },
] as const;

export type Project = {
  title: string;
  description: string;
  tags: string[];
  year?: string;
  link?: string;
  repo?: string;
  /* optional media; falls back to a generated gradient tile */
  image?: string;
};

export const projects: Project[] = [
  {
    title: "ShopOS.ai",
    year: "2024 — Present",
    description:
      "Designing an AI-native commerce platform — from zero-to-one product flows to a design system that scales.",
    tags: ["Product Design", "Design Systems"],
    link: "https://shopos.ai",
  },
  {
    title: "Digimonk Design Studio",
    year: "2022 — 2024",
    description:
      "Multidisciplinary studio work across brand, web, and product for a range of clients.",
    tags: ["Brand", "Web", "Product"],
    link: "#",
  },
];
