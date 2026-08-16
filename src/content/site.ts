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
  /* What this output was generated from, shown as a small panel in the
     figure's top-left corner. One entry per named group, joined by a "+", so
     the inputs are read against the result rather than above it. */
  inputs?: {
    label: string;
    items: { src: string; alt: string; fit?: "cover" | "contain" }[];
  }[];
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
  /* Results as statements rather than a row of figures: one line each, ruled
     down the left in --color-stat. For an outcome that reads better as a
     sentence than as a number over a caption. */
  | {
      type: "impact";
      label?: string;
      items: string[];
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
        /* `title` is the small marker above a line — omit it for a run of
           plain statements that need no naming */
        items?: { title?: string; text: string }[];
        /* a bulleted run, for the cases a paragraph is listing rather than
           arguing. `**bold**` works here as it does anywhere else. */
        bullets?: string[];
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
  /* the copy under the title, beneath the opening statement. A newline opens a
     new paragraph, so a lead line can stand apart from the copy under it. */
  subhead: string;
  /* Replaces the summary-driven Overview with a composed section in the same
     slot — first after the hero — built from blocks instead of label/value
     rows. Set with a big heading on the left and the run of copy on the right. */
  overview?: {
    heading: string;
    /* what the right-edge rail calls this stop. The heading is a full sentence
       when it needs to be; the rail needs a word. */
    railLabel?: string;
    blocks: CaseStudyBlock[];
  };
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
  role?: PairItem[];
  /* one paragraph in place of the owned / built / guided rows */
  roleText?: string;
  /* the outcome under that paragraph — the at-a-glance read for someone
     scanning the page rather than reading it */
  roleImpact?: string[];
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
      "Making AI video generation easier to control, by breaking generation into simple steps.",
    tags: ["AI Systems", "Prompt Architecture"],
    link: "https://shopos.ai/agents/monica",
    /* no still cover — the video is the cover, on the card and on the page */
    video: "/adaptive-intelligence.webm",
    statement: "Making one video was easy. Making the next hundred wasn't.",
    industry: "AI, Fashion, Commerce",
    scope: "Product Design, AI Systems, Prompt Architecture",
    story: {
      /* a newline opens a new paragraph in the header's subhead */
      subhead:
        "We already had a tool that could turn a product image into a video. But as we worked across different products, markets, and creative needs, creating and adapting each video still took time and effort.\nI worked on making the process more flexible, so teams could create, iterate, and generate more product content with less manual work.",
      layout: "split",
      overview: {
        heading: "The first version worked. Then we needed it to do more.",
        railLabel: "Challenge",
        blocks: [
          {
            type: "notes",
            groups: [
              {
                items: [
                  { text: "The original tool was built around a simple idea:" },
                  { text: "**Upload a product → generate a video.**" },
                  {
                    text: "That worked well for Western fashion but real client work quickly became more complicated. Different products and markets needed different ways of understanding the product, telling the story, and presenting it.",
                  },
                ],
              },
              {
                bullets: [
                  "Indian fashion needed a better understanding of **fabric, embroidery, construction, detailing, styling, and movement**.",
                  "Merchandise needed to understand **prints, materials, and surfaces**.",
                  "Luxury products needed a completely different approach to creating their visual world.",
                ],
              },
              {
                items: [
                  {
                    text: "We could rebuild the workflow for every new requirement. But that would mean more manual work every time.",
                  },
                  {
                    text: "**The challenge was making one workflow flexible enough to handle very different products without starting from scratch.**",
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
      roleText:
        "I owned the workflow end to end, shaping how the experience worked, what the AI needed to understand, and how the final output could be improved. I defined the prompts and logic, made key product decisions, and worked with the team to build it. The result was a more flexible way to create and iterate on product videos, with the luxury workflow generating pitch-ready reveals in around 10 minutes and supporting pitches for one enterprise and two SLG clients.",
      roleImpact: [
        "~10 min from product upload to a pitch-ready reveal",
        "4 workflows shipped across different product types",
        "2 inputs to generate — a product image and a brand logo",
      ],
      roleMedia: [
        {
          kind: "ui",
          title: "Spaces: the workflows, as an operator sees them",
          note: "The library of workflows each vertical runs from.",
          src: "/case-studies/adaptive-intelligence/my-role-spaces.webp",
          width: 1440,
          height: 807,
        },
      ],
      sections: [
        {
          act: "I. THE PROBLEM",
          heading: "Making one prompt do everything wasn't enough.",
          blocks: [
            {
              type: "p",
              text: "Brands needed more product videos, but generating a good 15–30 second video took time and effort. The original tool could turn a product image into a video, but gave us little control over the result.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The original pipeline",
                  note: "The inputs it took and the six steps it ran, as the system stood before adaptation.",
                  src: "/case-studies/adaptive-intelligence/01-original-pipeline.webp",
                  width: 690,
                  height: 386,
                },
              ],
            },
          ],
        },
        {
          act: "II. WHAT I CHANGED",
          heading: "I broke generation into simple steps.",
          blocks: [
            {
              type: "p",
              text: "The workflow first understood the product, then built the story, created the visual direction, and generated the video. This gave us more control and made it easier to adapt the process for different products.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The workflow, broken into steps",
                  note: "The graph with the fixed structure separated from the domain payload.",
                  src: "/case-studies/adaptive-intelligence/03-reusable-architecture.webp",
                  width: 1440,
                  height: 1440,
                },
              ],
            },
          ],
        },
        {
          act: "III. MAKING IT WORK",
          heading: "Different products needed different knowledge.",
          blocks: [
            {
              type: "p",
              text: "Fashion needed details like **fabric, embroidery, construction and movement**. Merchandise needed **print and material** understanding. Luxury products needed the system to decide the right visual setting.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "What each product type could not miss",
                  note: "One product or output per vertical, annotated with the detail its knowledge had to carry.",
                  src: "/case-studies/adaptive-intelligence/02-mandatory-beats.webp",
                  width: 1440,
                  height: 742,
                },
                {
                  kind: "system",
                  title: "The workflows side by side",
                  note: "Each pipeline and the knowledge it runs on.",
                  src: "/case-studies/adaptive-intelligence/07-four-worlds.webp",
                  width: 1440,
                  height: 952,
                },
              ],
            },
          ],
        },
        {
          act: "IV. THE BIGGEST SIMPLIFICATION",
          heading: "Logo was enough.",
          blocks: [
            {
              type: "p",
              text: "We removed the need for a manually selected scene reference. The system could now create the visual direction itself.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before / after input flow",
                  note: "Product + logo + scene reference → product + logo → the derived visual direction and hero image.",
                  src: "/case-studies/adaptive-intelligence/06-input-flow.webp",
                  width: 1440,
                  height: 1440,
                },
              ],
            },
          ],
        },
        {
          act: "V. THE OUTCOME",
          heading: "It became useful beyond production.",
          layout: "stacked",
          blocks: [
            {
              type: "p",
              text: "Teams could create more assets, iterate faster, and prepare brand-specific reveals during sales pitches.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "output",
                  title:
                    "A brand-specific reveal, prepared during a client pitch",
                  note: "Prospect product + logo → the generated reveal.",
                  src: "/case-studies/adaptive-intelligence/live-client-pitch.webm",
                  width: 1440,
                  height: 810,
                  inputs: [
                    {
                      label: "Input images",
                      items: [
                        {
                          src: "/case-studies/adaptive-intelligence/input-tshirt-front.jpg",
                          alt: "Product photograph, front",
                        },
                        {
                          src: "/case-studies/adaptive-intelligence/input-tshirt-back.jpg",
                          alt: "Product photograph, back",
                        },
                      ],
                    },
                    {
                      label: "Logo",
                      items: [
                        {
                          src: "/case-studies/adaptive-intelligence/input-brand-logo.webp",
                          alt: "Brand logo",
                          fit: "contain",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          act: "VI. WHAT I LEARNED",
          heading: "AI works better when you give it the right structure.",
          layout: "stacked",
          blocks: [
            {
              type: "p",
              text: "Breaking generation into smaller steps made the system easier to control, improve, and adapt.",
            },
            {
              type: "pull",
              text: "The goal isn't to make AI do everything. It's to know where AI should decide and where the product should guide it.",
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
