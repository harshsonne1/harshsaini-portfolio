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
};

export type CaseStudyBlock =
  | { type: "p"; text: string }
  /* the line that carries the beat — set larger than body copy */
  | { type: "pull"; text: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "pairs"; items: { label: string; text: string }[] }
  | { type: "points"; items: { title: string; text: string }[] }
  | { type: "media"; items: CaseStudyMedia[] };

export type CaseStudySection = {
  /* act header, printed once above the first section that carries it */
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
};

export type CaseStudy = {
  /* the line under the title, beneath the opening statement */
  subhead: string;
  /* challenge / approach / solution / outcome */
  summary: { label: string; text: string }[];
  /* owned / built / guided */
  role: { label: string; text: string }[];
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
    slug: "brand-memory",
    title: "Brand Memory",
    year: "2026",
    description:
      "The shared memory layer behind ShopOS's AI agents — from a brand's website to structured context.",
    tags: ["Product Design", "AI Systems"],
    link: "https://shopos.ai",
    image: "/cover-ShopOS.webp",
    statement: "Teaching AI what makes a brand, a brand.",
    industry: "AI, Commerce",
    scope: "Product Design, AI Systems, Experimentation",
    story: {
      subhead:
        "From a simple brand-context feature to the shared memory layer behind AI agents — and the experiment that changed when users should encounter it.",
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
          act: "Act One — The Memory",
          heading: "AI could generate. It couldn't remember.",
          blocks: [
            {
              type: "p",
              text: "The product could produce a striking image. It could not reliably produce a branded one. Every new generation carried the cost of re-explaining the brand.",
            },
          ],
        },
        {
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
                  note: "A generic generation beside a brand-consistent one — the proof of the problem, before the product enters.",
                },
              ],
            },
          ],
        },
        {
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
                  note: "Sketches, early IA, whiteboard or flow diagram — visibly rougher than the finished UI.",
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
                  note: "Brand DNA, editable brand attributes or Mood Boards — the place for an early → final evolution.",
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
                  note: "An agent or workflow consuming Brand Memory — proof that memory powers the rest of the product.",
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
          act: "Act Two — The Test",
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
                  note: "A clean table or analytics view — the +12pp highlighted, the contradictory metrics around it.",
                },
              ],
            },
          ],
        },
        {
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
                  note: "A redacted replay frame or a simplified interaction trace — where the human enters the story.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Three — The Decision",
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
          act: "Act Four — What It Became",
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
                { label: "Decision", text: "+12pp apparent lift → do not ship." },
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
  {
    slug: "generative-video",
    title: "Generative Video Systems",
    year: "2026",
    description:
      "Four generative video pipelines from one architecture — and the moment reusing it became the mistake.",
    tags: ["AI Systems", "Prompt Architecture"],
    image: "/cover-SKM.webp",
    statement: "One system. Four worlds. Two architectures.",
    industry: "AI, Fashion, Commerce",
    scope: "Product Design, AI Systems, Prompt Architecture",
    story: {
      subhead:
        "Four generative video pipelines built from one starting point — and the moment when reusing the same system became the mistake.",
      summary: [
        {
          label: "Challenge",
          text: "A node-based AI video pipeline built for one Western fashion brand had to serve Indian ethnicwear, a Gulf marketplace, merchandise, and luxury product reveals. Rebuilding it each time was not viable. Reusing it blindly produced output that was fluent and wrong.",
        },
        {
          label: "Approach",
          text: "Hold the architecture fixed and treat domain knowledge as a swappable payload. For each vertical, find the one moment the output cannot omit. Then identify where that logic stops applying.",
        },
        {
          label: "Solution",
          text: "Two pipeline families: a narrative family for garments, built around a single source of truth for consistency; and a reveal family for objects, built around constrained scene selection and reasoning.",
        },
        {
          label: "Outcome",
          text: "All four pipelines shipped. The luxury reveal workflow replaced a half-day to full-day manual step per product and became a live sales instrument, contributing to one closed enterprise deal and two SLG clients.",
        },
      ],
      role: [
        {
          label: "Owned",
          text: "Pipeline architecture, genre and category taxonomies, domain judgment calls, error detection and QA across every node.",
        },
        {
          label: "Co-created",
          text: "System prompts with AI assistance under my direction and specification.",
        },
        {
          label: "Guided",
          text: "Implementation and wiring in the Vibe workflow canvas.",
        },
      ],
      sections: [
        {
          act: "Act One — The Port",
          heading: "A pipeline that only knew one kind of clothes.",
          blocks: [
            { type: "pull", text: "The pipeline worked. That was the problem." },
            {
              type: "p",
              text: "It had been built for a Western fashion brand. Its analyst understood garments through silhouette, construction, hardware, labels and branding.",
            },
            {
              type: "p",
              text: "Point it at Indian ethnicwear and it still produced a complete, confident analysis. It just had no vocabulary for a dupatta, no concept of chikankari, and no way to distinguish a sangeet from a mehendi.",
            },
            {
              type: "pull",
              text: "Nothing failed. The output was fluent and wrong.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The original Western fashion pipeline",
                  note: "The original node graph and one representative output — the system as it stood before adaptation.",
                },
              ],
            },
          ],
        },
        {
          heading: "This wasn't a translation problem. It was a beat problem.",
          blocks: [
            {
              type: "p",
              text: "Adding garment terms and rewriting genre tables helped, but did not solve what made the output feel authentic.",
            },
            {
              type: "pull",
              text: "Every vertical had one moment the output could not skip. Finding that moment became the localisation work.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "Ishin Fashions",
                  text: "The dupatta — its drape, fall and embellishment.",
                },
                {
                  label: "6th Street",
                  text: "Footwear cohesion — the outfit must read as one purchase.",
                },
                {
                  label: "Bento House",
                  text: "Logo fidelity — the brand mark is the product.",
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
                },
              ],
            },
          ],
        },
        {
          heading: "What stays fixed: eight nodes, two branches, one video.",
          blocks: [
            {
              type: "p",
              text: "Underneath the swapped payloads, the graph did not move. Inputs were packaged, garments analysed, storyboards created, story and camera direction separated, then prompts assembled for video.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The reusable pipeline",
                  note: "The eight-node, two-branch architecture — the fixed structure separated visually from the domain payload.",
                },
              ],
            },
          ],
        },
        {
          heading: "Genre was not a parameter. It became the system.",
          blocks: [
            {
              type: "p",
              text: "Genre entered as an ordinary variable and simultaneously overrode the analyst's system prompt through a direct edge. Selecting a genre swapped in specialist knowledge at runtime.",
            },
            {
              type: "pull",
              text: "The architecture stayed still while the system became a different system.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The runtime genre switch",
                  note: "Genre selector → specialist prompt → analyst. The key design-engineering moment.",
                },
              ],
            },
          ],
        },
        {
          heading: "One analyst owns every fact, or the video drifts.",
          blocks: [
            {
              type: "p",
              text: "A nine-panel storyboard and a fifteen-second video have to describe the same person wearing the same thing. The forensic analyst became the single source of truth; downstream nodes were not allowed to re-derive those facts.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "output",
                  title: "Consistency across frames",
                  note: "Storyboard grid beside a final video frame, with the consistent wearer and garment called out.",
                },
              ],
            },
          ],
        },
        {
          heading: "Sport does not walk.",
          blocks: [
            {
              type: "p",
              text: "The format system assumed every genre resolved into a walk or showcase. That worked for dresses. It failed for running shoes.",
            },
            {
              type: "pull",
              text: "Athletic products needed movement with intent, not a runway.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "Lifestyle · Street · Resort",
                  text: "Walk / Showcase",
                },
                { label: "Sport", text: "Drill / Athlete" },
                { label: "Formal", text: "Arrive / Showcase" },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "The format system",
                  note: "The genre → format mapping, with one Sport example beside a fashion one.",
                },
              ],
            },
          ],
        },
        {
          heading:
            "The beat isn't always there, so the beat became conditional.",
          blocks: [
            {
              type: "p",
              text: "Fusion garments broke the assumption that every ethnic product has a dupatta. Hardcoding either answer would break part of the catalogue.",
            },
            {
              type: "p",
              text: "The fix: document the dupatta if it appears. Otherwise substitute a fabric-motion beat so the reveal still has something to resolve.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Conditional logic",
                  note: "Dupatta present → document it. Absent → substitute the fabric-motion beat.",
                },
              ],
            },
            {
              type: "pull",
              text: "This is where the system became more interesting than the prompt.",
            },
          ],
        },
        {
          act: "Act Two — The Fork",
          heading: "A watch does not walk anywhere.",
          blocks: [
            {
              type: "p",
              text: "Luxury product reveal arrived. The obvious move was to port the fashion architecture again. It was the wrong move.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Fashion vs luxury",
                  note: "A garment pipeline beside a luxury object, annotated: consistency problem vs world-building problem.",
                },
              ],
            },
            { type: "pull", text: "The fashion pipeline solved consistency." },
            {
              type: "p",
              text: "One person. One garment. Identical across frames and into motion.",
            },
            {
              type: "p",
              text: "A luxury object has no wearer, gait or narrative arc. The hard problem was deciding what world the object belonged in.",
            },
            {
              type: "pull",
              text: "If the hard problem is keeping something the same, use a source-of-truth architecture. If the hard problem is deciding what should exist, use a reasoning architecture.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "Two architectures",
                  note: "Narrative architecture → garments and consistency. Reasoning architecture → objects and world selection.",
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
              text: "The original reveal chain required three images: product, logo and scene reference. The scene reference was the bottleneck because someone had to find or create it.",
            },
            {
              type: "p",
              text: "In practice, that took half a day to a full day for one product. Most pitches therefore relied on pre-made work.",
            },
            {
              type: "pull",
              text: "The system went from three inputs to two: product + logo. The world was derived from the object.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "ui",
                  title: "Before / after input flow",
                  note: "Product + logo + scene reference → product + logo → the derived world and hero image.",
                },
              ],
            },
          ],
        },
        {
          heading: "Creativity happens once, at authoring time.",
          blocks: [
            {
              type: "p",
              text: "A reasoning model could freely pick a scene, but that creates variety at the expense of repeatability. Instead, the model received a decision procedure that selected from authored scene libraries.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "Scene selection logic",
                  note: "Identify category → visual analysis → scene selection → setting selection → prompt package, with a sample of the scene library.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Three — What It Did",
          heading: "The output format became the interface.",
          blocks: [
            {
              type: "p",
              text: "The reasoning node did not produce prose for a human. Its output went directly into image and video generation. The format itself became the contract.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "system",
                  title: "The output contract",
                  note: "IDENTIFICATION → IMAGE PROMPT → VIDEO PROMPT → END. The structure only, not the full prompt.",
                },
              ],
            },
          ],
        },
        {
          heading: "What it was actually for.",
          blocks: [
            {
              type: "p",
              text: "The luxury reveal pipeline was not ultimately a production tool. It was a sales instrument.",
            },
            {
              type: "p",
              text: "Before it existed, preparing bespoke pitch material took half a day to a day. Prospects were shown somebody else's product.",
            },
            {
              type: "pull",
              text: "The demo stopped being a portfolio and became a mirror.",
            },
            {
              type: "media",
              items: [
                {
                  kind: "output",
                  title: "A live client pitch",
                  note: "Prospect product + logo → the generated luxury reveal. A real pitch output if one can be shown.",
                },
              ],
            },
          ],
        },
        {
          heading: "All four pipelines shipped.",
          blocks: [
            {
              type: "pairs",
              items: [
                {
                  label: "Ishin Fashions",
                  text: "Six system prompts across eight nodes; twelve genre values across six genres, with walk and showcase variants.",
                },
                {
                  label: "6th Street",
                  text: "Ported architecture with a four-tier brand system, Gulf casting standards and ten genre-format combinations.",
                },
                {
                  label: "Bento House",
                  text: "Forked to static output with a print/substrate analyst and compositor; no video branch.",
                },
                {
                  label: "Luxury Reveal",
                  text: "Seven nodes, nine edges; reasoning, hero image and a ten-second video with audio.",
                },
              ],
            },
          ],
        },
        {
          act: "Act Four — Residue",
          heading: "The outcome was a change in the sales conversation.",
          blocks: [
            {
              type: "p",
              text: "Product Managers and Sales could run the luxury reveal live: upload the prospect's product and logo, then generate premium brand-specific output while they watched.",
            },
            {
              type: "pairs",
              items: [
                {
                  label: "Manual step",
                  text: "Half a day to a full day of bespoke material per product → replaced by live generation for the reveal workflow.",
                },
                {
                  label: "Commercial",
                  text: "Used in the pitch for one closed enterprise deal and two SLG clients.",
                },
                {
                  label: "Operations",
                  text: "Output volume rose for the teams operating the workflow.",
                },
                {
                  label: "Next metric",
                  text: "Share of pitches using prospect-specific output, from a baseline near zero.",
                },
              ],
            },
            {
              type: "media",
              items: [
                {
                  kind: "visual",
                  title: "Outcome / live demo",
                  note: "The strongest final output or a pitch moment. This should feel like the payoff.",
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
                  title: "Turn the quality gate on for production.",
                  text: "The evaluator existed but was deliberately disabled because the workflow needed to run live in pitches. That trade-off makes sense for demos, not automatically for production.",
                },
                {
                  title: "Keep system truth synchronized.",
                  text: "The prompt declared twelve categories while the library had fourteen. The system worked, but the contradiction survived because it did not visibly fail.",
                },
                {
                  title: "Name the system for its operators.",
                  text: "Product Managers and Sales used the workflow, but several node names described the author's mental model rather than the operator's task.",
                },
                {
                  title: "Test what is merely working.",
                  text: "Questions remained around storyboard reference selection and whether a very long system prompt was actually necessary.",
                },
              ],
            },
            { type: "p", text: "The rule that survived every pipeline:" },
            {
              type: "pull",
              text: "Reuse until the shape of the problem changes. Then stop.",
            },
            {
              type: "p",
              text: "Four pipelines. Two architectures. One principle: the job is not to make one system handle everything. It is to know where the system should bend — and where it should break.",
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
