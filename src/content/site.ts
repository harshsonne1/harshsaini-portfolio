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
  /* a drawn figure rather than a file — rendered by its own component, and
     takes the slot `src` would have */
  figure?: "pipeline" | "context" | "input-flow" | "workflow";
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
  /* Show those inputs as the bare thumbnails in the bottom-left corner —
     no panel behind them and no group label. For frames whose single input
     needs no caption to be understood. */
  inputsBare?: boolean;
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
      /* sets the lines at 14px — for a run of results being scanned, rather
         than a statement carrying a section */
      compact?: boolean;
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
  /* A compact two-column table, set in the copy column. For a split of
     responsibility — what the user hands over, and what the system takes on. */
  | {
      type: "table";
      headings: [string, string];
      rows: [string, string][];
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
  /* Prints a barcode mark in the empty half of a stacked section, with this
     string set above the bars as its serial. A stacked section's copy is capped
     well short of the column, so on a closing beat that space carries a mark
     instead of nothing. Ignored by every other layout. */
  barcode?: string;
  blocks: CaseStudyBlock[];
};

export type CaseStudy = {
  /* the copy under the title, beneath the opening statement. A newline opens a
     new paragraph, so a lead line can stand apart from the copy under it. */
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
  role?: PairItem[];
  /* prose in place of the owned / built / guided rows. A newline opens a new
     paragraph, as it does in the header's subhead. */
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
  /* Key metrics for the header, in place of the industry / scope / website
     cells. Same frame the story uses for an `impact` block, so a case study
     whose numbers are the headline can lead with them instead of burying them
     in a second section. One line each; `**bold**` works. */
  heroMetrics?: string[];
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
    /* The video's own first frame. Both the work tile and the case study cover
       paint this immediately and play the video over it — without it there was
       nothing to show until a 1.1MB webm had loaded a frame, so the tile sat
       empty while the other one was already there. Taken at t=0, so playback
       starts on the same frame and there is no jump into it. */
    image: "/adaptive-intelligence-cover.webp",
    video: "/adaptive-intelligence.webm",
    statement: "Humans set the direction. AI does the heavy lifting.",
    industry: "AI, Fashion, Commerce",
    scope: "Product Design, AI Systems, Creative Automation",
    story: {
      /* a newline opens a new paragraph in the header's subhead */
      subhead:
        "I designed AI workflows that turned simple product inputs into images and videos in minutes. The challenge was making them reliable enough to run at scale, without constant prompting, wasted credits, or products getting lost along the way.\nBy giving the system the right context at the right time, we could generate across different product types with far less manual work.",
      layout: "split",
      overview: {
        heading: "The Challenge",
        blocks: [
          {
            type: "notes",
            groups: [
              {
                lead: true,
                text: "The workflow worked. Until we asked it to scale.",
              },
              {
                items: [
                  {
                    text: "The workflow could turn a product into a video. But as we expanded across products, brands, and use cases, the same workflow started to break down. A sneaker, a luxury bag, and a graphic tee needed very different creative direction. The challenge wasn't generating more videos. It was making the system adapt.",
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
                /* each clip carries the product it was generated from, so the
                   four frames read as four different briefs rather than four
                   variations of one */
                inputsBare: true,
                inputs: [
                  {
                    label: "Input image",
                    items: [
                      {
                        src: "/case-studies/adaptive-intelligence/input-ethnicwear.webp",
                        alt: "Ethnicwear set product photograph",
                      },
                    ],
                  },
                ],
              },
              {
                kind: "output",
                title: "Apparel",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-2.webm",
                width: 720,
                height: 1280,
                inputsBare: true,
                inputs: [
                  {
                    label: "Input image",
                    items: [
                      {
                        src: "/case-studies/adaptive-intelligence/input-apparel.webp",
                        alt: "Black dress product photograph",
                      },
                    ],
                  },
                ],
              },
              {
                kind: "output",
                title: "Luxury reveal",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-3.webm",
                width: 720,
                height: 1280,
                inputsBare: true,
                inputs: [
                  {
                    label: "Input image",
                    items: [
                      {
                        src: "/case-studies/adaptive-intelligence/input-watch.webp",
                        alt: "Chronograph watch product photograph",
                      },
                    ],
                  },
                ],
              },
              {
                kind: "output",
                title: "Footwear",
                note: "Generated video output.",
                src: "/case-studies/adaptive-intelligence/overview-4.webm",
                width: 720,
                height: 1280,
                inputsBare: true,
                inputs: [
                  {
                    label: "Input image",
                    items: [
                      {
                        src: "/case-studies/adaptive-intelligence/input-sneaker.webp",
                        alt: "Running shoe product photograph",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      roleText:
        "I owned the workflow end to end from deciding **what the user should provide** to defining **what the AI should figure out** on its own.\n" +
        "I designed the prompts, context, decision logic, and key interactions, then worked closely with the team to test outputs, fix failures, and iterate on the workflow.\n" +
        "My focus was **finding the right balance between human direction and AI automation** so the system could generate **reliable creative at scale.**",
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
        {
          kind: "ui",
          title: "A luxury reveal, set up and generated",
          note: "The inputs an operator gives it, and the output it returns.",
          src: "/case-studies/adaptive-intelligence/my-role-reveal.webp",
          width: 1440,
          height: 807,
        },
        {
          kind: "ui",
          title: "The same reveal, as a workflow",
          note: "The steps behind the form, open beside the inputs that drive them.",
          src: "/case-studies/adaptive-intelligence/my-role-workflow.webp",
          width: 1440,
          height: 807,
        },
        {
          kind: "system",
          title: "The workflow in full",
          note: "Product and logo in, through positioning and prompt, to the generated reveal. Drag any card.",
          figure: "workflow",
          width: 1534,
          height: 721,
        },
      ],
      sections: [
        {
          act: "I. THE PROBLEM",
          heading: "One workflow was making too many decisions at once.",
          blocks: [
            {
              type: "p",
              text: "The first workflow worked. Upload a product. Give it a prompt. Get a video.",
            },
            {
              type: "p",
              text: "Then we started trying it across more products. Some worked beautifully. Others didn't. Products changed. Scenes drifted. Sometimes the output looked great, but was simply wrong. And **every bad generation cost credits.**",
            },
            {
              type: "impact",
              items: [
                "At scale, we couldn't keep retrying until something worked. We needed a way to make the system more reliable before it generated.",
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The original pipeline",
                  note: "The inputs it took and the six steps it ran, as the system stood before adaptation.",
                  figure: "pipeline",
                  width: 1200,
                  height: 800,
                },
              ],
            },
          ],
        },
        {
          act: "II. THE FIRST ATTEMPT",
          heading: "We started by giving people a few simple choices.",
          blocks: [
            {
              type: "p",
              text: "The user could upload a product, choose a story style, choose a genre, and add a short description. That was enough. They could still decide what they wanted the ad to feel like, **without having to write a complicated prompt**. The system handled everything underneath. And it worked.",
            },
            {
              type: "p",
              text: "That gave us an important starting point: **maybe the user doesn't need to tell the AI how to create. They just need to tell it what they want.**",
            },
            {
              type: "table",
              headings: ["User gives", "System handles"],
              rows: [
                ["Product image", "Product understanding"],
                ["Story style", "Creative direction"],
                ["Genre", "Scene and composition"],
                ["Short product brief", "Detailed prompts + generation"],
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "The first attempt, as an operator saw it",
                  note: "Upload the product, pick the few choices that shape it, generate.",
                  src: "/case-studies/adaptive-intelligence/first-attempt.webp",
                  width: 1124,
                  height: 942,
                },
              ],
            },
          ],
        },
        {
          act: "III. THE ITERATIONS",
          heading: "Our first instinct was to give it more context.",
          blocks: [
            {
              type: "p",
              text: "More product details. More references. More instructions. It worked sometimes. It also made things worse sometimes.",
            },
            {
              type: "p",
              text: "So we stopped adding more for the sake of adding more, and started figuring out **what the model actually needed to know**.",
            },
          ],
        },
        {
          heading: "One prompt was trying to do too much.",
          blocks: [
            {
              type: "p",
              text: "It was understanding the product, figuring out the story, deciding the scene, and generating the asset all at once. When something went wrong, **we couldn't tell where**.",
            },
            {
              type: "p",
              text: "So we started separating the work, **one decision at a time**.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Breaking a brief into storyboards and keyframes",
                  note: "The brief becoming concept ideas, storyboards and keyframes — one decision per step.",
                  src: "/case-studies/adaptive-intelligence/iter-storyboards.webp",
                  width: 1124,
                  height: 942,
                },
              ],
            },
          ],
        },
        {
          heading: "Retrying was getting expensive.",
          blocks: [
            {
              type: "p",
              text: "A bad output meant another generation. Another generation meant more credits, more time, and another chance to get it wrong. We realised we couldn't keep fixing the system by simply generating again.",
            },
            {
              type: "impact",
              items: [
                "The first useful output had to happen more often.",
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Refining an output instead of regenerating it",
                  note: "The generated shot, its earlier attempts alongside, and the edits that avoid another full run.",
                  src: "/case-studies/adaptive-intelligence/retries.webp",
                  width: 1124,
                  height: 942,
                },
              ],
            },
          ],
        },
        {
          heading: "We gave the user more control.",
          blocks: [
            {
              type: "p",
              text: "A scene reference helped the system stay on track. But it also meant the user had to decide what the world should look like. That made us stop and ask:",
            },
            {
              type: "impact",
              items: [
                "Shouldn't the system be able to figure that out itself?",
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Working out the creative templates",
                  note: "Planning the templates and per-industry cases, so a run starts from a known shape rather than a blank prompt.",
                  src: "/case-studies/adaptive-intelligence/iter-templates.webp",
                  width: 1124,
                  height: 942,
                },
              ],
            },
          ],
        },
        {
          heading: "So we took that input away.",
          blocks: [
            {
              type: "p",
              text: "We let the system use the product and its context to work out the visual world. The user could simply give us the product and logo. And for workflows where creative direction mattered more, we kept a few simple choices.",
            },
            {
              type: "impact",
              items: [
                "We weren't looking for one way to use AI. We were looking for the right balance between human input and AI.",
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Deriving the world from the product",
                  note: "Input image and brand context through the reasoning steps, out to the set of generated worlds.",
                  src: "/case-studies/adaptive-intelligence/iter-reasoning.webp",
                  width: 1124,
                  height: 942,
                },
              ],
            },
          ],
        },
        {
          act: "IV. THE BIGGEST SIMPLIFICATION",
          heading: "We removed the scene reference.",
          blocks: [
            {
              type: "p",
              text: "We realised the user was doing work the system could do. The scene reference helped keep things on track, but it also meant the user had to decide what the world should look like. So we took it away. They gave us the product and logo, and the system figured out the rest. We weren't removing control. We were removing unnecessary work.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before / after input flow",
                  note: "Product + logo + scene reference → product + logo → the derived visual direction and hero image.",
                  figure: "input-flow",
                  width: 1200,
                  height: 800,
                },
              ],
            },
          ],
        },
        {
          act: "V. WHAT THIS CHANGED",
          heading:
            "We stopped optimising for one good output. We started designing for the next hundred.",
          layout: "stacked",
          blocks: [
            {
              type: "p",
              text: "Fewer retries meant fewer wasted credits. Better context meant fewer hallucinations. And simpler inputs meant people could create more without constantly guiding the system. The workflow became faster, more reliable, and easier to scale.",
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
          act: "VI. THE TAKEAWAY",
          heading:
            "The more we worked on it, the more I realised AI didn't need to do everything.",
          layout: "stacked",
          barcode: "640509-040147",
          blocks: [
            {
              type: "p",
              text: "People are still better at knowing what they want.\nAI is better at figuring out how to get there.\nSo we kept moving the right work to the right side.",
            },
            {
              type: "pull",
              text: "Humans set the direction. AI does the heavy lifting.",
            },
            {
              type: "p",
              text: "And finding that balance is what made the system useful at scale.",
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
    statement:
      "Teaching AI to remember a brand, so no one explains it twice.",
    /* Carried in the header rather than as a section of its own, which is all
       that section had in it. Unlabelled: the numbers stand on their own here,
       and the story still marks them as internal benchmarks where it discusses
       them. */
    heroMetrics: [
      "≈3× fewer tokens per generation",
      "3.4× more accurate retrieval",
      "10+ brand attributes held per query",
    ],
    industry: "AI, Commerce",
    scope: "Product Design, AI Systems, Experimentation",
    story: {
      /* a newline opens a new paragraph in the header's subhead */
      subhead:
        "AI could already make good work. The problem was that it kept forgetting who it was making it for. Every new request meant explaining the brand again: how it looks, how it sounds, which products belong together, and what it should never do. So I worked on a way to capture that context once, carry it across workflows, and make it available when AI actually needed it.\nThe interesting part wasn't building memory. It was figuring out what was worth remembering, and when the user should have to think about it.",
      /* heading and copy pin on the left while the beat's figures scroll past on
         the right, the way the other story reads */
      layout: "split",
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
          act: "I. THE PROBLEM",
          heading: "AI could generate. It couldn't remember.",
          blocks: [
            {
              type: "p",
              text: "We could make a great image. Then we made another one. And somehow the brand looked different. The colours changed. The tone drifted. Products stopped feeling related. So we'd explain the brand again. And then again.",
            },
            {
              type: "p",
              text: "The problem wasn't generation anymore.",
            },
            { type: "pull", text: "It was context." },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Before / after",
                  note: "One generic generation beside one brand-consistent generation. The point should be obvious without reading the caption: the same kind of task, a very different brand understanding.",
                },
              ],
            },
          ],
        },
        {
          act: "II. THE FIRST IDEA",
          heading: "What if the brand only had to explain itself once?",
          blocks: [
            {
              type: "notes",
              groups: [
                { text: "We started with what the brand already had." },
                {
                  bullets: [
                    "Its website.",
                    "Its products.",
                    "Its language.",
                    "Its visual rules.",
                    "Its references.",
                  ],
                },
              ],
            },
            {
              type: "p",
              text: "We didn't want another giant brand questionnaire. The brand had already done most of the explaining. So we started with the website.",
            },
            { type: "pull", text: "One URL. The whole brand." },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "The first exploration",
                  note: "Rough exploration rather than polished UI: whiteboard, IA, sketches, early thinking. The point is that this was still a problem being figured out.",
                },
              ],
            },
          ],
        },
        {
          act: "III. WHAT WAS WORTH REMEMBERING?",
          heading: "A brand has a memory. A campaign has a mood.",
          blocks: [
            {
              type: "p",
              text: "This was one of the first distinctions that helped. Some things shouldn't change: the brand's visual language, its voice, its product relationships, its rules. Other things should. A campaign can be playful today and serious tomorrow.",
            },
            { type: "p", text: "So we separated the two." },
            {
              type: "pairs",
              items: [
                { label: "Brand DNA", text: "What needed to stay true." },
                { label: "Mood", text: "What could change." },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Website → Brand DNA",
                  note: "URL → scan → extracted Brand DNA. Two or three screens: this is where the reader sees the actual product taking shape.",
                },
                {
                  kind: "ui",
                  title: "Brand DNA + Mood",
                  note: "The distinction drawn out — Brand DNA, what stays true, beside Mood, what changes. An important concept, so it should not be buried in copy.",
                },
              ],
            },
          ],
        },
        {
          act: "IV. THEN THE AGENTS ARRIVED",
          heading: "Suddenly, everyone needed the same memory.",
          blocks: [
            {
              type: "p",
              text: "At first, Brand Memory helped one generation workflow. Then more workflows started using it. Then the agents arrived. Search needed the brand. Creative needed the brand. Product workflows needed the brand.",
            },
            {
              type: "p",
              text: "We could keep copying the same context into every workflow. Or we could give them all the same memory.",
            },
            {
              type: "pull",
              text: "So Brand Memory stopped being just a feature. It became part of the system underneath everything.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "An agent using Brand Memory",
                  note: "One agent or workflow consuming the same Brand Memory. The visual should answer: this isn't just a settings page anymore.",
                },
              ],
            },
          ],
        },
        {
          act: "V. FROM MEMORY TO STRUCTURED CONTEXT",
          heading: "We still had to teach the AI how to remember.",
          blocks: [
            {
              type: "p",
              text: "A giant history had everything in it. But that didn't mean the AI knew what mattered. So we started breaking the memory into smaller pieces. Related things stayed together. Useful things became easier to find.",
            },
            {
              type: "pull",
              text: "When an agent needed context, it should find the right part of the brand and not the entire history.",
            },
            {
              type: "stats",
              label: "Internal benchmarks",
              items: [
                { value: "≈3×", label: "fewer tokens" },
                { value: "3.4×", label: "retrieval accuracy" },
                { value: "10+", label: "brand attributes per query" },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Structured memory",
                  note: "Not a complicated technical graph: brand information → structured memory → agent retrieves what it needs, with the benchmark numbers beside it.",
                },
              ],
            },
          ],
        },
        {
          act: "VI. THE PRODUCT WORKED",
          heading: "The onboarding question didn't.",
          blocks: [
            {
              type: "p",
              text: "By this point, Brand Memory worked. Now we had a different question. Should setup be optional? Or should we make it mandatory?",
            },
            {
              type: "p",
              text: "We made a pretty reasonable assumption: if memory is important, make people set it up. So we tested it.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Optional vs mandatory",
                  note: "A — optional, where Brand Memory can be skipped. B — mandatory, where it is required. Keep the comparison extremely easy to scan.",
                },
              ],
            },
          ],
        },
        {
          act: "VII. THE NUMBER WASN'T THE STORY",
          heading: "It looked like a clean win. It wasn't.",
          blocks: [
            {
              type: "p",
              text: "The mandatory variant gave us a +12pp lift in completed generation. For a moment, it looked obvious.",
            },
            {
              type: "stats",
              items: [
                { value: "+12pp", label: "completed generation" },
              ],
            },
            {
              type: "p",
              text: "Then we looked closer. The sample was small. One cohort had missing Brand Memory telemetry. And the headline metric sat beside weaker signals, including lower chat creation and a much higher generation failure rate.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Experiment results",
                  note: "An evidence card rather than a dashboard screenshot: +12pp completed generation, and underneath it the small sample, the missing telemetry, the higher generation failure and the lower chat creation. The contradiction should be obvious.",
                },
              ],
            },
          ],
        },
        {
          act: "VIII. ONE USER IN THIRTY-SEVEN FINISHED THE SCAN",
          heading: "That was the part we couldn't ignore.",
          blocks: [
            {
              type: "p",
              text: "The control cohort gave us the clearest signal. Twenty clicked Scan. Seventeen skipped. One entered a URL. One completed.",
            },
            {
              type: "stats",
              items: [
                { value: "20", label: "clicked" },
                { value: "17", label: "skipped" },
                { value: "1", label: "entered a URL" },
                { value: "1", label: "completed" },
                { value: "0", label: "failed" },
              ],
            },
            {
              type: "pull",
              text: "Nobody failed. People were just walking away.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "The funnel",
                  note: "Almost embarrassingly simple: 20 clicked → 17 skipped → 1 entered a URL → 1 completed → 0 failed. One of the strongest pieces of evidence here, so let the numbers breathe.",
                },
              ],
            },
          ],
        },
        {
          act: "IX. THE QUESTION CHANGED",
          heading: "The funnel was measuring passage, not accomplishment.",
          blocks: [
            {
              type: "p",
              text: "A click was easy to count. It didn't tell us whether the user ended up with useful brand memory. We had been asking which onboarding version wins. That wasn't the real question anymore.",
            },
            {
              type: "pull",
              text: "Why are we asking users to care about memory here at all?",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Session behaviour",
                  note: "A session replay, interaction trace or simplified behavioural visual. The point isn't the analytics: it is where I stopped trusting the aggregate number and looked at what people were actually doing.",
                },
              ],
            },
          ],
        },
        {
          act: "X. THE BIGGEST CHANGE",
          heading: "We moved the ask to where the need appears.",
          blocks: [
            {
              type: "p",
              text: "We could have made Brand Memory mandatory. We could have run the same test again. But both options accepted the same premise: that Brand Memory belonged in onboarding. We weren't convinced anymore.",
            },
            {
              type: "p",
              text: "So we changed the order. Generate first. Let the user see the work. Let them notice when something feels off. Then introduce memory when it can actually help.",
            },
            {
              type: "comparison",
              headings: ["Before", "After"],
              rows: [
                { before: "Sign up", after: "Generate" },
                {
                  before: "Brand Memory",
                  after: "'This doesn't feel like my brand.'",
                },
                { before: "Generate", after: "Brand Memory" },
                { before: "—", after: "Generate again" },
              ],
            },
            {
              type: "pull",
              text: "The request didn't change. The moment changed.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before → after",
                  note: "The hero visual of the second half: sign up → Brand Memory → generate, against generate → this doesn't feel like my brand → Brand Memory → generate again.",
                },
              ],
            },
          ],
        },
        {
          act: "XI. WHAT IT BECAME",
          heading: "Brand Memory became more than a feature.",
          blocks: [
            {
              type: "p",
              text: "It started as a way to make one generation workflow better. Then it became reusable context. Then other workflows needed it. Then agents needed it.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "System",
                  text: "Brand DNA → contextual memory → structured context → AI agents.",
                },
                {
                  label: "Product",
                  text: "Forced setup → memory introduced when it becomes useful.",
                },
              ],
            },
            {
              type: "pull",
              text: "+12pp wasn't enough reason to ship. The rest of the evidence told us why.",
            },
          ],
        },
        {
          act: "XII. WHAT I WOULD DO DIFFERENTLY",
          heading:
            "We should have checked the experiment before trusting the experiment.",
          blocks: [
            {
              type: "p",
              text: "The biggest miss wasn't the product decision. It was the experiment setup. We were missing important telemetry. The sample wasn't strong enough. And we were measuring whether someone passed through a step, rather than whether the step actually worked. Next time, I'd make those conditions of entry.",
            },
            {
              type: "pull",
              text: "Good instrumentation first. Then the experiment.",
            },
            {
              type: "p",
              text: "And I'd use session behaviour earlier. Aggregate data tells you where people leave. Watching them tells you why.",
            },
          ],
        },
        {
          act: "XIII. THE TAKEAWAY",
          heading:
            "The hard part wasn't teaching AI to remember. It was knowing when memory mattered.",
          layout: "stacked",
          /* Deliberately the same serial Adaptive Intelligence closes on — the
             mark reads as the same printed artefact across both stories. Keep
             the two in step if either changes. All digits either way: the code
             glitches through a hex charset before it settles, so a serial
             carrying % @ or a non-hex letter would snap to characters that
             never appeared in the churn, and change width doing it. */
          barcode: "640509-040147",
          blocks: [
            {
              type: "p",
              text: "We started by thinking the answer was simple: remember more. It wasn't.\nThe better question was what AI should remember, and when it should use it.\nThat changed how I think about AI products.",
            },
            {
              type: "pull",
              text: "Don't make the user manage the system. Let the system earn the next step.",
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
