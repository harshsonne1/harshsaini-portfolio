// Central content for the portfolio. Edit these values to personalize the site.

export const site = {
  name: "Harsh Saini",
  role: "Product Designer",
  tagline:
    "I build fast, accessible web experiences, from pixel-perfect interfaces to the systems behind them.",
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

/* ---- case study long-form ----
   A section is a heading plus an ordered list of blocks, so a beat can run
   copy → pull quote → numbers → image in whatever order the story needs. */

export type CaseStudyMedia = {
  /* what sits in the slot: a product screen, a diagram or sketch, an
     architecture view, or a generated result */
  kind: "ui" | "visual" | "system" | "output";
  title: string;
  /* art direction while the slot is empty; becomes the caption once src is set */
  note: string;
  /* drop the asset in /public and set this to replace the empty frame */
  src?: string;
  /* Light-theme counterpart of `src`, for figures that are themselves a
     screenshot of a themed UI. When set, `src` is the dark-theme one and the
     page shows whichever matches the theme the reader is in. */
  srcLight?: string;
  /* the file's own pixel size. The figure is drawn at this ratio, so a
     portrait diagram stays portrait and nothing is cropped to a 16:9 box. */
  width?: number;
  height?: number;
};

/* One label/value row. The label is normally set as small caps, but a row
   about a brand shows that brand's mark instead, and links out to it. */
export type PairItem = {
  label: string;
  text?: string;
  items?: string[];
  /* shown in place of the label */
  icon?: string;
  /* adds a corner arrow linking out */
  href?: string;
};

export type CaseStudyBlock =
  | { type: "p"; text: string }
  /* the line that carries the beat — set larger than body copy */
  | { type: "pull"; text: string }
  | {
      type: "stats";
      /* heading above the row; defaults to "Key metrics" */
      label?: string;
      items: { value: string; label: string }[];
    }
  | {
      type: "pairs";
      items: PairItem[];
    }
  /* A tight run of headed groups. Weight separates a heading from its copy,
     not colour or rules, so the whole column reads as one voice. */
  | {
      type: "notes";
      groups: {
        /* omit for a group that is just copy, with no marker above it */
        heading?: string;
        text?: string;
        /* sets the copy at font-body-xl, for the line that carries the section */
        lead?: boolean;
        items?: { title: string; text: string }[];
      }[];
    }
  /* a before / after table: one row per thing that changed */
  | {
      type: "comparison";
      label?: string;
      headings: [string, string];
      rows: { before: string; after: string }[];
    }
  /* the literal inputs a step takes, shown as small thumbnails */
  | {
      type: "inputs";
      label?: string;
      items: { src: string; alt: string; fit?: "cover" | "contain" }[];
    }
  | {
      type: "points";
      /* optional heading above the set, set as a ruled label */
      label?: string;
      /* numbered runs the set as 01/02/03 columns under a rule, full width */
      numbered?: boolean;
      items: { title: string; text: string }[];
    }
  | { type: "media"; items: CaseStudyMedia[] };

export type CaseStudySection = {
  /* act header, printed once above the first section that carries it */
  act?: string;
  heading: string;
  /* "stacked" overrides a split story for this section: copy at the top,
     figures full width beneath it, results last. For a section whose figure
     is the proof of its claim, and needs the room to make it. */
  layout?: "stacked";
  /* Supporting beat: still a full section on the page, but it gets no tick on
     the right-edge rail. The rail is a map of the story, not a table of
     contents — it holds at 10–12 stops so the marks stay countable at a
     glance. Never set this on a section that opens an act. */
  railSkip?: boolean;
  blocks: CaseStudyBlock[];
};

export type CaseStudy = {
  /* the line under the title, beneath the opening statement */
  subhead: string;
  /* Replaces the summary-driven Overview with a composed section in the same
     slot — first after the hero — built from blocks instead of label/value
     rows. Set with a big heading on the left and the run of copy on the right. */
  overview?: { heading: string; blocks: CaseStudyBlock[] };
  /* "split" pins each section's heading and copy in a left column while its
     figures scroll past on the right. Without it, copy sits beside the heading
     and figures break out to the full viewport width. */
  layout?: "split";
  /* challenge / approach / solution / impact. A row is either a sentence or,
     where the point is a set of results, a short list. */
  summary?: PairItem[];
  /* figures that close the Overview, before My role */
  summaryMedia?: CaseStudyMedia[];
  /* owned / built / guided */
  role: PairItem[];
  /* figures that close the My role section, before the story opens */
  roleMedia?: CaseStudyMedia[];
  sections: CaseStudySection[];
};

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
  /* looping cover, on the work card and at the top of the case study. Set
     `image` alongside it to give it a poster; on its own, the video's first
     frame is what the tile rests on. */
  video?: string;
  /* ---- case study page ---- */
  /* the opening statement, set large beside the wordmark */
  statement?: string;
  industry?: string;
  scope?: string;
  /* long-form story; takes over from `body` when present */
  story?: CaseStudy;
  /* short body sections under the cover — the fallback layout */
  body?: { heading: string; text: string }[];
};

export const projects: Project[] = [
  {
    slug: "adaptive-intelligence",
    title: "Adaptive Intelligence",
    year: "2026",
    description:
      "One AI video pipeline adapted across four domains, and the moment reuse became the wrong abstraction.",
    tags: ["AI Systems", "Prompt Architecture"],
    link: "https://shopos.ai/agents/monica",
    /* no still cover — the video is the cover, on the card and on the page */
    video: "/adaptive-intelligence.webm",
    statement: "When reuse becomes the wrong abstraction.",
    industry: "AI, Fashion, Commerce",
    scope: "Product Design, AI Systems, Prompt Architecture",
    story: {
      subhead:
        "One system. Four worlds. Two architectures. I adapted one AI video pipeline across four domains, and discovered that the hardest part was knowing when the original architecture no longer fit.",
      layout: "split",
      overview: {
        heading: "Challenge",
        blocks: [
          {
            type: "notes",
            groups: [
              {
                text: "The AI video pipeline worked for Western fashion. Expanding into **four new domains** made blind reuse unreliable and rebuilding impractical.",
              },
              {
                heading: "Project Goal",
                lead: true,
                text: "Make one AI system adaptable across domains without losing accuracy or consistency.",
              },
              {
                heading: "Key Decisions",
                items: [
                  {
                    title: "Swappable knowledge",
                    text: "Keep the workflow fixed. Change the domain knowledge.",
                  },
                  {
                    title: "Single source of truth",
                    text: "Keep product and garment details consistent downstream.",
                  },
                  {
                    title: "Two architectures",
                    text: "Source of truth for fashion. Reasoning for luxury.",
                  },
                  {
                    title: "Remove the bottleneck",
                    text: "Replace scene references with **product + logo**.",
                  },
                ],
              },
            ],
          },
          {
            type: "media",
            items: [
              {
                kind: "output",
                title: "Ethnicwear",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-1.webm",
                width: 720,
                height: 1280,
              },
              {
                kind: "output",
                title: "Apparel",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-2.webm",
                width: 720,
                height: 1280,
              },
              {
                kind: "output",
                title: "Luxury reveal",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-3.webm",
                width: 720,
                height: 1280,
              },
              {
                kind: "output",
                title: "Footwear",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-4.webm",
                width: 720,
                height: 1280,
              },
            ],
          },
        ],
      },
      role: [
        {
          label: "Owned",
          text: "Pipeline architecture, genre and category taxonomies, domain judgment calls, error detection and QA across the workflows.",
        },
        {
          label: "Co-created",
          text: "System prompts, with AI assistance under my direction and specification.",
        },
        {
          label: "Guided",
          text: "Implementation and wiring in the workflow canvas.",
        },
      ],
      roleMedia: [
        {
          kind: "ui",
          title: "Spaces: the workflows, as an operator sees them",
          note: "The library of pipelines each vertical runs from.",
          src: "/case-studies/adaptive-intelligence/my-role-1-dark.webp",
          srcLight: "/case-studies/adaptive-intelligence/my-role-1-light.webp",
          width: 1440,
          height: 786,
        },
        {
          kind: "ui",
          title: "Inside a workflow",
          note: "The node graph an operator is handed, rather than the one it was authored in.",
          src: "/case-studies/adaptive-intelligence/my-role-2-dark.webp",
          srcLight: "/case-studies/adaptive-intelligence/my-role-2-light.webp",
          width: 1440,
          height: 787,
        },
        {
          kind: "ui",
          title: "A run, end to end",
          note: "Inputs in, generated output back.",
          src: "/case-studies/adaptive-intelligence/my-role-3-dark.webp",
          srcLight: "/case-studies/adaptive-intelligence/my-role-3-light.webp",
          width: 1440,
          height: 757,
        },
      ],
      sections: [
        {
          act: "I. THE PORT",
          heading: "A pipeline that only knew one kind of clothes.",
          blocks: [
            {
              type: "p",
              text: "The original system understood Western garments well. But when applied to Indian ethnicwear, it missed details like dupattas, chikankari, and cultural contexts such as sangeet and mehendi.",
            },
            {
              type: "pull",
              text: "Nothing failed. The output was fluent and wrong.",
            },
            {
              type: "p",
              text: "That led to the first design principle: localisation wasn't a translation problem. It was a beat problem.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The original Western fashion pipeline",
                  note: "The original node graph and one representative output: the system as it stood before adaptation.",
                  src: "/case-studies/adaptive-intelligence/01-original-pipeline.webp",
                  width: 1440,
                  height: 742,
                },
              ],
            },
          ],
        },
        {
          heading: "Every vertical had one moment the output could not miss.",
          blocks: [
            {
              type: "pairs",
              items: [
                {
                  label: "Ishin Fashions",
                  text: "The dupatta: Its drape, fall and embellishment.",
                  icon: "/case-studies/adaptive-intelligence/brand-ishin.svg",
                  href: "https://ishinfashions.com/pages/about-ishin",
                },
                {
                  label: "6th Street",
                  text: "Footwear cohesion: The outfit must read as one purchase.",
                  icon: "/case-studies/adaptive-intelligence/brand-6th-street.svg",
                  href: "https://en-bh.aivi.com/about",
                },
                {
                  label: "Bento House",
                  text: "Logo fidelity: The brand mark is the product.",
                  icon: "/case-studies/adaptive-intelligence/brand-bento-house.svg",
                  href: "https://bento.house/",
                },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "The mandatory beats",
                  note: "One product or output per vertical, annotated with its single mandatory beat.",
                  src: "/case-studies/adaptive-intelligence/02-mandatory-beats.webp",
                  width: 1440,
                  height: 742,
                },
              ],
            },
          ],
        },
        {
          heading: "Eight nodes, two branches, one video.",
          blocks: [
            {
              type: "p",
              text: "The underlying graph stayed fixed, while domain knowledge became swappable. Genre worked as a runtime switch, injecting specialist knowledge without changing the workflow.",
            },
            {
              type: "pull",
              text: "The architecture stayed the same. The system became different for each domain.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The reusable architecture and the genre switch",
                  note: "The eight-node, two-branch graph with the fixed structure separated from the domain payload, and the genre selector feeding the analyst.",
                  src: "/case-studies/adaptive-intelligence/03-reusable-architecture.webp",
                  width: 1440,
                  height: 1440,
                },
              ],
            },
          ],
        },
        {
          heading: "Consistency needs a source of truth.",
          blocks: [
            {
              type: "p",
              text: "A storyboard and video needed to stay consistent, so the forensic analyst became the **single source of truth**.",
            },
            {
              type: "p",
              text: "Domain logic adapted too: sport used purposeful movement, while conditional rules handled details like dupattas without inventing them.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "output",
                  title: "Consistency across frames",
                  note: "Storyboard grid beside a final video frame, with the consistent wearer and garment called out.",
                  src: "/case-studies/adaptive-intelligence/04-consistency-across-frames.webp",
                  width: 1440,
                  height: 1440,
                },
              ],
            },
          ],
        },
        {
          act: "II. THE FORK",
          heading: "A watch does not walk anywhere.",
          blocks: [
            {
              type: "p",
              text: "The fashion pipeline solved for consistency: keeping one person and garment identical across frames.",
            },
            {
              type: "p",
              text: "Luxury products had a different problem: deciding what world the object belongs in.",
            },
            {
              type: "p",
              text: "That led to two architectures:",
            },
            {
              type: "pairs",
              items: [
                { label: "Consistency", text: "Source of truth" },
                { label: "World selection", text: "Reasoning" },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "Two architectures",
                  note: "Narrative architecture → garments and consistency. Reasoning architecture → objects and world selection.",
                  src: "/case-studies/adaptive-intelligence/05-two-architectures.webp",
                  width: 1453,
                  height: 2113,
                },
              ],
            },
          ],
        },
        {
          heading: "Delete the input that required taste.",
          blocks: [
            {
              type: "p",
              text: "The original workflow needed **product + logo + scene reference**. The scene reference was the bottleneck, taking **half a day to a full day** to prepare.",
            },
            {
              type: "p",
              text: "I reduced it to **product + logo** and let the system derive the world.",
            },
            {
              type: "p",
              text: "A decision layer selected from authored scene libraries, balancing creative range with repeatability. Its output then guided image and video generation.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before / after input flow",
                  note: "Product + logo + scene reference → product + logo → the derived world and hero image.",
                  src: "/case-studies/adaptive-intelligence/06-input-flow.webp",
                  width: 1440,
                  height: 1440,
                },
              ],
            },
          ],
        },
        {
          act: "III. 4 WORLDS. 2 ARCHITECTURES",
          heading: "Four pipelines, and where each one bent.",
          blocks: [
            {
              type: "p",
              text: "Four pipelines. Four different adaptations.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "I.",
                  text: "Indian Ethnicwear: Reusable narrative + Specialist Genre Knowledge.",
                },
                {
                  label: "II.",
                  text: "Gulf Footwear: Brand, casting and genre systems.",
                },
                {
                  label: "III.",
                  text: "Merchandise: Static output with print and Substrate logic.",
                },
                {
                  label: "IV.",
                  text: "Luxury Objects: Reasoning led world selection and reveals.",
                },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "Four worlds, two architectures",
                  note: "The four pipelines side by side, grouped by the architecture each one runs on.",
                  src: "/case-studies/adaptive-intelligence/07-four-worlds.webp",
                  width: 1440,
                  height: 952,
                },
              ],
            },
          ],
        },
        {
          act: "IV. WHAT IT CHANGED",
          heading: "The output became the interface.",
          layout: "stacked",
          blocks: [
            {
              type: "p",
              text: "The luxury reveal turned a production workflow into a **live sales tool**.\nProduct + logo → brand-specific reveal.",
            },
            {
              type: "inputs",
              items: [
                {
                  src: "/case-studies/adaptive-intelligence/input-tshirt-front.jpg",
                  alt: "Product photograph, front",
                },
                {
                  src: "/case-studies/adaptive-intelligence/input-tshirt-back.jpg",
                  alt: "Product photograph, back",
                },
                {
                  src: "/case-studies/adaptive-intelligence/input-brand-logo.webp",
                  alt: "Brand logo",
                  fit: "contain",
                },
              ],
            },
            {
              type: "comparison",
              label: "The impact",
              headings: ["Before", "With the workflow"],
              rows: [
                {
                  before: "12–24 hrs of manual production per product",
                  after: "~10 min to a pitch-ready reveal",
                },
                {
                  before: "Product + logo + a sourced scene reference",
                  after: "Product + logo",
                },
                {
                  before: "A generic demo, built once and reused",
                  after: "The prospect's own brand, generated in the pitch",
                },
              ],
            },
            {
              type: "stats",
              items: [
                { value: "2 inputs", label: "Product + logo" },
                { value: "4 pipelines", label: "Shipped" },
                { value: "1 + 2", label: "Enterprise + SLG deals pitched" },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "output",
                  title:
                    "A personalised reveal generated live during a client pitch",
                  note: "Prospect product + logo → the generated luxury reveal.",
                  src: "/case-studies/adaptive-intelligence/live-client-pitch.webm",
                  width: 1440,
                  height: 810,
                },
              ],
            },
          ],
        },
        {
          act: "V. WHAT I LEARNED",
          heading: "AI systems can be wrong without looking broken.",
          layout: "stacked",
          blocks: [
            {
              type: "p",
              text: "One prompt declared 12 categories while the library contained 14. Nothing failed, but the contradiction survived.",
            },
            {
              type: "pull",
              text: "QA needs to test system agreement, not just whether the workflow runs.",
            },
            {
              type: "points",
              numbered: true,
              items: [
                {
                  title: "Production needs quality gates.",
                  text: "The evaluator was disabled for live pitches. Production needs stronger checks.",
                },
                {
                  title: "Design for the operator.",
                  text: "Node names reflected the builder's mental model, not the operator's.",
                },
                {
                  title: "Test what is merely working.",
                  text: "Test storyboard references and long prompts.",
                },
              ],
            },
          ],
        },
        {
          heading: "Reuse until the shape of the problem changes. Then stop.",
          blocks: [
            {
              type: "p",
              text: "Four pipelines. Two architectures. One principle.",
            },
            {
              type: "pull",
              text: "The job is not to make one system handle everything. It is to know where the system should bend, and where it should break.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "brand-memory",
    title: "Brand Memory",
    year: "2026",
    description:
      "The shared memory layer behind ShopOS's AI agents, from a brand's website to structured context.",
    tags: ["Product Design", "AI Systems"],
    link: "https://shopos.ai/feature/brand-memory",
    image: "/cover-ShopOS.webp",
    statement: "Teaching AI what makes a brand, a brand.",
    industry: "AI, Commerce",
    scope: "Product Design, AI Systems, Experimentation",
    story: {
      subhead:
        "From a simple brand-context feature to the shared memory layer behind AI agents, and the experiment that changed when users should encounter it.",
      summary: [
        {
          label: "Challenge",
          text: "Generative AI could create polished outputs, but it could not reliably retain a brand's visual language, voice, product relationships, and rules across generations.",
        },
        {
          label: "Approach",
          text: "Start with the brand's existing source of truth, turn it into structured memory, then evolve that memory as agents and workflows demand more context.",
        },
        {
          label: "Solution",
          text: "Brand DNA → contextual memory → structured context → AI agents, with memory introduced when it becomes useful rather than forced during onboarding.",
        },
        {
          label: "Outcome",
          text: "Brand Memory evolved from a generation feature into shared product infrastructure. An onboarding experiment also showed that forcing setup was not the right answer.",
        },
      ],
      role: [
        {
          label: "Owned",
          text: "Product definition, UX, information architecture, memory model and experimentation framing.",
        },
        {
          label: "Built",
          text: "Production frontend, interactions and API-connected experiences.",
        },
        {
          label: "Guided",
          text: "Engineering implementation and the ship / no-ship decision.",
        },
      ],
      sections: [
        {
          act: "Act One: The Memory",
          heading: "AI could generate. It couldn't remember.",
          blocks: [
            {
              type: "p",
              text: "The product could produce a striking image. It could not reliably produce a branded one. Every new generation carried the cost of re-explaining the brand.",
            },
          ],
        },
        {
          railSkip: true,
          heading: "The problem was not generation. It was context.",
          blocks: [
            {
              type: "p",
              text: "Without persistent context, users had to keep supplying the same information: what the brand sounds like, what it looks like, which products belong together, and what rules must never be broken.",
            },
            {
              type: "pull",
              text: "The opportunity was simple: make the brand context reusable.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Before / after generation",
                  note: "A generic generation beside a brand-consistent one: the proof of the problem, before the product enters.",
                },
              ],
            },
          ],
        },
        {
          railSkip: true,
          heading: "Before Brand Memory was a system, it was a whiteboard.",
          blocks: [
            {
              type: "p",
              text: "I mapped the signals that could influence generation and asked what a brand already had that could become a source of truth.",
            },
            {
              type: "pull",
              text: "A brand already has a source of truth. Start there.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Early exploration",
                  note: "Sketches, early IA, whiteboard or flow diagram, visibly rougher than the finished UI.",
                },
              ],
            },
          ],
        },
        {
          heading: "One URL. The whole brand.",
          blocks: [
            {
              type: "p",
              text: "Instead of asking users to complete a long brand brief, the first version started with the asset they already owned: their website.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Website → Brand DNA",
                  note: "The key states: URL input → scan → extracted Brand DNA. Two or three screens, not the whole flow.",
                },
              ],
            },
          ],
        },
        {
          railSkip: true,
          heading: "A brand has a memory. A campaign has a mood.",
          blocks: [
            {
              type: "p",
              text: "Brand DNA captures what should stay true. Mood Boards capture the direction for right now. The distinction mattered because campaigns change while brands persist.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Brand DNA + Mood Boards",
                  note: "Brand DNA, editable brand attributes or Mood Boards: the place for an early → final evolution.",
                },
              ],
            },
          ],
        },
        {
          heading: "Then the agents arrived.",
          blocks: [
            {
              type: "p",
              text: "ShopOS expanded from generation into AI agents across commerce workflows. Now every agent needed the same brand context.",
            },
            {
              type: "pull",
              text: "Brand Memory could no longer just be a feature. It had to become infrastructure.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "An agent using Brand Memory",
                  note: "An agent or workflow consuming Brand Memory: proof that memory powers the rest of the product.",
                },
              ],
            },
          ],
        },
        {
          heading: "From memory to structured context.",
          blocks: [
            {
              type: "p",
              text: "A flat history contains everything but gives an agent little structure. Interactions became units, related units became clusters, and clusters connected into a retrievable context model.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Context graph",
                  note: "The context graph or a simplified architecture visual, annotated with what the agent retrieves and why.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Two: The Test",
          heading: "The product worked. The onboarding question didn't.",
          blocks: [
            {
              type: "p",
              text: "By this point, Brand Memory worked as a product. But onboarding raised a different question: should setup be optional or mandatory?",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Optional vs mandatory",
                  note: "The two onboarding variants side by side, readable enough that the comparison carries the story.",
                },
              ],
            },
            { type: "pull", text: "The number said ship it." },
            {
              type: "stats",
              items: [
                {
                  value: "+12pp",
                  label: "completed generation, mandatory variant",
                },
              ],
            },
            { type: "p", text: "It looked like a clean win. It wasn't." },
            {
              type: "p",
              text: "The sample was small. One cohort had missing Brand Memory telemetry. And the headline metric sat beside weaker signals: lower chat creation and a much higher generation failure rate.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Experiment metrics",
                  note: "A clean table or analytics view with the +12pp highlighted and the contradictory metrics around it.",
                },
              ],
            },
          ],
        },
        {
          railSkip: true,
          heading:
            "A variant that wins on one metric is not necessarily a winner.",
          blocks: [
            {
              type: "p",
              text: "The question was no longer which variant converted better. It was whether the experiment was measuring the outcome we actually cared about.",
            },
          ],
        },
        {
          heading: "One user in thirty-seven finished the scan.",
          blocks: [
            {
              type: "p",
              text: "The control cohort had usable telemetry. Twenty people clicked Scan. Seventeen skipped. One entered a URL. One completed the scan. Nobody failed the scan.",
            },
            {
              type: "stats",
              items: [
                { value: "20", label: "clicked Scan" },
                { value: "17", label: "skipped" },
                { value: "1", label: "entered a URL" },
                { value: "1", label: "completed" },
                { value: "0", label: "failed" },
              ],
            },
            {
              type: "pull",
              text: "The scanner wasn't simply broken. People were starting the task and walking away.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Brand Memory funnel",
                  note: "The drop-off drawn out: 20 clicked Scan → 17 skipped → 1 entered a URL → 1 completed → 0 failed.",
                },
              ],
            },
          ],
        },
        {
          railSkip: true,
          heading: "The funnel was measuring passage, not accomplishment.",
          blocks: [
            {
              type: "p",
              text: "A click on Scan is easy to instrument. A brand actually having usable memory is a state that lives somewhere else. The dashboard could show users passing through a step without proving that the step succeeded.",
            },
            {
              type: "pull",
              text: "Both variants delivered users who got past the Brand Memory screen. Neither delivered users with Brand Memory.",
            },
            {
              type: "p",
              text: "That made the original A/B question secondary. The real problem was when and why users should care about memory.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Session replay / behaviour",
                  note: "A redacted replay frame or a simplified interaction trace, where the human enters the story.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Three: The Decision",
          heading: "Move the ask to where the need appears.",
          blocks: [
            {
              type: "p",
              text: "The recommendation was not to ship either variant and not to rerun the same test. Both variants accepted the premise that Brand Memory belonged in onboarding.",
            },
            {
              type: "pull",
              text: "Instead, introduce it when the user has a concrete reason to want the system to know their brand.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before → after experience",
                  note: "Before: sign up → Brand Memory → generate. After: generate → disappointing result → Brand Memory → generate again.",
                },
              ],
            },
            { type: "pull", text: "The ask is identical. The moment is not." },
            {
              type: "p",
              text: "The experiment changed the product decision from how do we force setup? to when does the user actually need memory?",
            },
          ],
        },
        {
          heading: "What changed because of the decision.",
          blocks: [
            {
              type: "pairs",
              items: [
                {
                  label: "UX",
                  text: "Forced onboarding → contextual memory.",
                },
                {
                  label: "Telemetry",
                  text: "Instrument missing upstream events before asking the experiment question again.",
                },
                {
                  label: "Product",
                  text: "Fix the scan experience itself rather than optimising around it.",
                },
                {
                  label: "Experiment",
                  text: "Run again only with sufficient sample size and complete instrumentation.",
                },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Final onboarding / contextual memory",
                  note: "The redesigned interaction if it exists, otherwise a clean flow diagram.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Four: What It Became",
          heading: "Brand Memory became more than a feature.",
          blocks: [
            {
              type: "p",
              text: "It evolved from a way to improve one generation into shared context that could support AI agents across the product.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "Product",
                  text: "Brand DNA → contextual memory → structured context → AI agents.",
                },
                {
                  label: "UX",
                  text: "Forced setup → memory introduced when it becomes useful.",
                },
                {
                  label: "Decision",
                  text: "+12pp apparent lift → do not ship.",
                },
                {
                  label: "System",
                  text: "Internal benchmarks: ≈3× fewer tokens, 3.4× retrieval accuracy, and 10+ brand attributes per query.",
                },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Final product hero",
                  note: "The most polished production Brand Memory screen, as the visual bookend.",
                },
              ],
            },
          ],
        },
        {
          heading: "What I would do differently.",
          blocks: [
            {
              type: "points",
              items: [
                {
                  title: "Validate the experiment before running it.",
                  text: "Sample size and instrumentation should be conditions of entry, not discoveries after the test.",
                },
                {
                  title: "Measure accomplishment, not just passage.",
                  text: "A click tells you a user touched a step. It does not tell you the step worked.",
                },
                {
                  title: "Use sessions earlier.",
                  text: "Aggregate data can locate a problem. Watching behaviour can explain it.",
                },
              ],
            },
            {
              type: "pull",
              text: "The biggest outcome wasn't that we built an AI that could remember. It was learning when it should remember.",
            },
            {
              type: "p",
              text: "Brand Memory started as a feature for better generations. It became a system for giving AI the context to make better decisions.",
            },
          ],
        },
      ],
    },
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
      "Product designer at ShopOS: a full-time, on-site role in Bangalore, working across Vibe Design, agentic workflows, and the systems that support them.",
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
      "Product design fellowship at ownpath: a remote internship building foundations in Figma, UX research, and design craft.",
  },
];
