// Long-form case study body: acts, beats, pull quotes, stat rows and image
// slots. Content lives in site.ts (`project.story`); this file only decides how
// each block type is set.
//
// Section frame follows the reference grid: a drawn hairline at the top, a
// 1400px container, and a 12-column grid where the heading takes columns 1–6
// and the copy runs in 7–12. Metrics and figures break out to the full width.
// Blocks are placed in source order — each one claims its own grid row, so a
// beat can run copy → figure → pull quote → numbers without extra wrappers.
//
// Reveals ride the shared ScrollReveal observer — see ScrollReveal.tsx.

import { Fragment } from "react";
import Image from "next/image";
import type {
  CaseStudy,
  CaseStudyBlock,
  CaseStudyMedia,
  CaseStudySection,
  PairItem,
} from "@/content/site";
import { BarcodeMark } from "@/components/Barcode";
import { CoverVideo } from "@/components/CoverVideo";
import { PipelineDiagram } from "@/components/PipelineDiagram";
import { ContextDiagram } from "@/components/ContextDiagram";
import { InputFlowDiagram } from "@/components/InputFlowDiagram";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { MemoryCompare } from "@/components/MemoryCompare";
import { IterationsReel } from "@/components/IterationsReel";
import { ScreenGallery } from "@/components/ScreenGallery";
import { ContextGraph } from "@/components/ContextGraph";
import { ScanFunnel } from "@/components/ScanFunnel";
import { FlowReorder } from "@/components/FlowReorder";
import StoryMotion from "@/components/StoryMotion";
import { StickyActRun, type ActRunSection } from "@/components/StickyActRun";
import type { RailItem } from "@/components/SectionRail";

// Empty image slots still render as labelled frames so the art direction is
// visible while assets are being cut. Flip to false to hide every slot that
// has no `src` yet.
const SHOW_EMPTY_MEDIA = true;

// vertical rhythm: the same fluid value top and bottom — 86px at a 1440 design
// width — so the rule that opens a section sits an equal distance from the
// content either side of it.
const SECTION_PAD = "py-[clamp(3rem,6vw,6rem)]";

// the reading column — capped and centred. Figures deliberately skip this and
// run the full viewport in the footer's 16px gutters instead.
const COLUMN = "mx-auto w-full section-gutter";

// The rule that opens a section. It sits on the section's top edge so the
// section's top padding falls below it: the line reads as the break between two
// sections rather than as an underline on the heading. Indented to the reading
// column's gutters, and drawn left to right by the shared reveal observer.
function SectionRule() {
  return (
    <div
      aria-hidden
      className={`${COLUMN} pointer-events-none absolute inset-x-0 top-0`}
    >
      <span data-reveal="line" className="hairline block h-px w-full" />
    </div>
  );
}

// one 12-col grid per run; 24px stack on mobile, 32px between grid rows
const SECTION_GRID =
  "flex flex-col gap-y-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8";

// the two column bands blocks can occupy
const NARROW = "lg:col-span-6 lg:col-start-7";
const WIDE = "lg:col-span-12 lg:col-start-1";

// ---- section ids, shared with the right-edge rail ----
// `storySectionIds` stamps an id on every section here; `storyRailItems` hands
// the page the subset that earns a tick. Both walk the same list in the same
// order, so ids can't drift between the anchor and the thing pointing at it.

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/, "") || "section"
  );
}

// [overview, my role, ...sections] — one id per rendered section
function storySectionIds(story: CaseStudy): string[] {
  // two headings can slugify to the same string — number the repeats
  const counts = new Map<string, number>();
  const unique = (base: string) => {
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  return [
    unique("overview"),
    unique("my-role"),
    ...story.sections.map((section) => unique(slugify(section.heading))),
  ];
}

// The rail's stops: everything except the supporting beats marked `railSkip`.
// Those sections still render and still hold their anchor — they just don't
// get a mark, which keeps the rail at a countable 10–12.
export function storyRailItems(story: CaseStudy): RailItem[] {
  const ids = storySectionIds(story);

  const opening =
    story.overview || story.summary?.length || story.summaryMedia?.length;

  return [
    // no stop for an opening section that is not rendered
    ...(opening
      ? [{ id: ids[0], label: story.overview?.heading ?? "Overview" }]
      : []),
    { id: ids[1], label: "My role" },
    ...story.sections.flatMap((section, i) =>
      section.railSkip
        ? []
        : [{ id: ids[i + 2], label: section.heading, act: section.act }],
    ),
  ];
}

/* Figures that hold their own contents in place as the reader scrolls, and so
   must not be put inside a pinned column. */
const SELF_PINNING = new Set(["iterations-reel", "mood-reel", "flow-reorder"]);

const isVideo = (src: string) => /\.(webm|mp4|mov)$/i.test(src);

// Results (numbers, comparisons) break out of the copy column and run the full
// width, under the figures, in every layout.
const isResult = (b: CaseStudyBlock) =>
  b.type === "stats" ||
  b.type === "comparison" ||
  (b.type === "points" && Boolean(b.numbered));

// Copy is plain strings, but a sentence occasionally needs one phrase carried
// harder than the rest. `**like this**` is the only markup allowed in it.
function withEmphasis(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).flatMap((part, i) => {
    const strong = i % 2 === 1;
    // a newline in copy is a line break, not a new paragraph
    return part.split("\n").flatMap((line, j) => {
      const node = strong ? (
        <strong key={`${i}-${j}`} className="font-medium text-fg">
          {line}
        </strong>
      ) : (
        <Fragment key={`${i}-${j}`}>{line}</Fragment>
      );
      return j === 0 ? [node] : [<br key={`br-${i}-${j}`} />, node];
    });
  });
}

/* Results as statements rather than a row of figures. Exported because the case
   study header shows the same frame in place of its meta cells — one component
   rather than two that have to be kept looking alike. */
export function ImpactList({
  label,
  items,
  compact = false,
  className,
}: {
  label?: string;
  items: string[];
  /* sets the lines at 14px — for a run being scanned rather than a statement
     carrying a section */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div data-reveal-group className={className}>
      {label && <BlockLabel>{label}</BlockLabel>}
      {/* One rule down the whole set — the lines are read together, so they
          share a single mark rather than each carrying its own. It takes the act
          marker's accent, so the two pieces of furniture that run the length of
          a case study agree with each other in both themes. */}
      <ul
        className={`flex flex-col gap-6 border-l-2 border-[var(--color-act)] pl-6 ${
          label ? "mt-8" : ""
        }`}
      >
        {items.map((item, i) => (
          <li
            key={i}
            data-reveal-item="up"
            style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            className={
              compact
                ? "text-sm font-medium leading-snug text-fg"
                : "text-xl font-medium leading-snug text-fg"
            }
          >
            {withEmphasis(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// What a generated figure was made from, sat in its top-left corner. Groups
// are joined by a "+", each captioned, so the inputs are read against the
// result rather than as a separate step above it.
function MediaInputs({
  groups,
  bare = false,
}: {
  groups: NonNullable<CaseStudyMedia["inputs"]>;
  bare?: boolean;
}) {
  return (
    // Sized down hard on phones: at full size the panel covered half the frame
    // and sat on the subject. It is a caption on the output, not a second
    // figure, so it gives way to the video at small widths.
    <div
      className={`absolute flex gap-x-2 sm:gap-x-4 ${
        bare
          ? // Bare: the thumbnail alone, in the bottom corner. Where a frame has
            // one input and no caption to carry, the panel and its label were
            // chrome around a picture that already reads as the product. It
            // takes the pointer — in bare mode the box is the thumbnail's own
            // size, so hovering it is hovering the image.
            "pointer-events-auto bottom-2 left-2 items-end sm:bottom-4 sm:left-4"
          : "pointer-events-none left-2 top-2 items-start rounded-xl border border-white/10 bg-black/55 p-2 backdrop-blur-md sm:left-4 sm:top-4 sm:rounded-2xl sm:p-4"
      }`}
    >
      {groups.map((group, g) => (
        <Fragment key={group.label}>
          {g > 0 && !bare && (
            // matched to the thumbnail row's height, so the "+" sits level
            // with the images rather than with the group's full height
            <span
              aria-hidden="true"
              className="flex h-7 items-center text-sm leading-none text-white/50 sm:h-12 sm:text-lg"
            >
              +
            </span>
          )}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {group.items.map((input) => (
                <span
                  key={input.src}
                  className={`block h-7 w-7 overflow-hidden rounded-md sm:h-12 sm:w-12 sm:rounded-lg ${
                    // held back to 60% so the thumbnail sits under the footage
                    // it annotates rather than competing with it, and comes up
                    // to full strength when a reader goes to look at it
                    bare
                      ? "opacity-60 transition-opacity duration-300 hover:opacity-100"
                      : "bg-white/10"
                  }`}
                >
                  <Image
                    src={input.src}
                    alt={input.alt}
                    width={48}
                    height={48}
                    unoptimized
                    className={`h-full w-full ${
                      input.fit === "contain" ? "object-contain" : "object-cover"
                    }`}
                  />
                </span>
              ))}
            </div>
            {/* the panel sits over video, so its type is fixed light rather
                than themed — it reads against the footage, not the page */}
            {!bare && (
              <span className="whitespace-nowrap text-center text-[0.5rem] uppercase leading-none tracking-[0.06em] text-white/70 sm:text-[0.625rem] sm:tracking-[0.12em]">
                {group.label}
              </span>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function Media({ item }: { item: CaseStudyMedia }) {
  // The workflow canvas reflows between a wide arrangement and a tall one, so
  // its shape is not fixed and it sets its own. Handed the slot directly rather
  // than through the ratio box below, which would crop one of the two.
  // Sizes itself too: a composer is the height a composer is, and the pair
  // under it keeps the ratio the shots were cut at.
  if (item.figure === "memory-compare") {
    return (
      <figure data-reveal="up">
        <MemoryCompare />
      </figure>
    );
  }

  // Sets its own height: the run has to be several screens long for the stack
  // to build, and each card takes the shape of the photo in it.
  // Brings its own <figure> and caption, and sets its own height from the grid.
  if (item.figure === "onboarding-gallery" || item.figure === "memory-gallery") {
    return (
      <ScreenGallery
        set={item.figure === "memory-gallery" ? "memory" : "onboarding"}
      />
    );
  }

  // Owns its own frame — 16:9, clipped corners, and the caption inside the art
  // — so it is handed the slot rather than the ratio box.
  if (item.figure === "structured-memory") {
    return <ContextGraph />;
  }

  // Sets its own height: the stage has to have several screens of run to hold
  // itself against while the sequence rearranges.
  if (item.figure === "flow-reorder") {
    return (
      <figure>
        <FlowReorder />
      </figure>
    );
  }

  if (item.figure === "iterations-reel" || item.figure === "mood-reel") {
    return (
      <figure>
        <IterationsReel
          set={item.figure === "mood-reel" ? "mood" : "exploration"}
        />
      </figure>
    );
  }

  if (item.figure === "workflow") {
    // No data-reveal on this one. The shared reveal fades a figure up over 0.8s
    // after a 140ms hold, and the canvas's own build-in runs off its own
    // observer — so the cards were assembling behind a panel that was still
    // fading, and the whole thing read as most of a second late. The canvas
    // brings itself in.
    return (
      <figure>
        <WorkflowCanvas />
      </figure>
    );
  }

  if (item.src || item.figure) {
    // The figure takes the file's own ratio, so a portrait diagram stays
    // portrait and a square one stays square. Forcing 16:9 here cropped the
    // ends off every diagram that wasn't already that shape.
    const ratio = item.width && item.height ? item.width / item.height : 16 / 9;

    return (
      <figure data-reveal="up">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: ratio }}
        >
          {item.figure === "pipeline" ? (
            <PipelineDiagram />
          ) : item.figure === "context" ? (
            <ContextDiagram />
          ) : item.figure === "input-flow" ? (
            <InputFlowDiagram />
          ) : item.figure === "scan-funnel" ? (
            <ScanFunnel />

          ) : !item.src ? null : isVideo(item.src) ? (
            // plays while it is on screen and stops when it isn't, so a wall
            // of clips never runs four decoders at once off-screen
            <CoverVideo src={item.src} />
          ) : (
            <>
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="100vw"
                // already sized and encoded for the page; the optimizer would
                // only re-encode a 1440px webp into another one
                unoptimized
                className={`object-cover ${item.srcLight ? "cs-media-dark" : ""}`}
              />
              {/* the same screen in the other theme, swapped in CSS so there
                  is no flash of the wrong one before hydration */}
              {item.srcLight && (
                <Image
                  src={item.srcLight}
                  alt={item.title}
                  fill
                  sizes="100vw"
                  unoptimized
                  className="cs-media-light object-cover"
                />
              )}
            </>
          )}

          {item.inputs && item.inputs.length > 0 && (
            <MediaInputs groups={item.inputs} bare={item.inputsBare} />
          )}
        </div>
        {/* no visible caption: the figures sit under copy that already names
            them. The title still travels as the image's alt text. */}
      </figure>
    );
  }

  return (
    <figure
      data-reveal="up"
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-border px-6 text-center"
    >
      <span className="text-[0.625rem] uppercase tracking-[0.25em] text-muted">
        {item.kind === "ui" ? "UI" : item.kind}
      </span>
      <span className="text-lg text-fg">{item.title}</span>
      {/* set with the story's body copy rather than a size below it — in a
          figure that has no asset yet, this note is the copy */}
      <span className="max-w-3xl text-base leading-relaxed text-muted">
        {item.note}
      </span>
    </figure>
  );
}

// label + underline, the reference's "Achievement" / "Key metrics" marker
function BlockLabel({
  children,
  rule = true,
}: {
  children: React.ReactNode;
  rule?: boolean;
}) {
  return (
    <div className={`relative ${rule ? "pb-3" : ""}`}>
      <h4 className="font-label text-contrast">{children}</h4>
      {rule && (
        <span
          data-reveal="line"
          className="hairline absolute inset-x-0 bottom-0 h-px"
        />
      )}
    </div>
  );
}

// label / text rows, used by `pairs` and by the front-matter lists
function PairRows({
  items,
  dropFirstRule = false,
}: {
  items: PairItem[];
  /** The section's own hairline sits directly above when a pairs block opens
      a section, so the first row's rule reads as a second line 24px under the
      first. Deeper in a section there is nothing above it and it stays. */
  dropFirstRule?: boolean;
}) {
  return (
    <>
      {items.map((pair, i) => (
        <div
          key={pair.label}
          data-reveal-item="up"
          style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          className={`grid grid-cols-1 gap-1 border-t border-border py-5 last:border-b sm:grid-cols-4 sm:gap-8 ${dropFirstRule ? "first:border-t-0 first:pt-0" : ""}`}
        >
          {/* the label rides the same 26px line box as the value beside it, so
              the two first lines share a baseline instead of sitting 7px apart */}
          <dt className="font-label text-contrast">
            {pair.icon ? (
              // the brand's own mark stands in for its name; each ships as a
              // self-contained badge, so it reads on either theme
              <Image
                src={pair.icon}
                alt={pair.label}
                width={44}
                height={44}
                unoptimized
                className="block h-11 w-11"
              />
            ) : (
              pair.label
            )}
          </dt>
          <dd className="font-body-sm flex items-start gap-4 text-fg sm:col-span-3">
            <span className="flex-1">
              {pair.items ? (
                // a set of results reads as a list, not as one run-on sentence
                <ul className="flex flex-col gap-1">
                  {pair.items.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                pair.text
              )}
            </span>
            {pair.href && (
              <a
                href={pair.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${pair.label}`}
                className="mt-1 shrink-0 text-muted transition-colors hover:text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-current"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d="M17 7l-10 10" />
                  <path d="M8 7l9 0l0 9" />
                </svg>
              </a>
            )}
          </dd>
        </div>
      ))}
    </>
  );
}

function Block({
  block,
  opensSection = false,
  split = false,
  place,
}: {
  block: CaseStudyBlock;
  /** first block of the section, so the section's hairline is right above it */
  opensSection?: boolean;
  /** stacked in the sticky column, so it carries no grid placement of its own */
  split?: boolean;
  /** overrides the copy band, so a section can divide 4/8 instead of 6/6 */
  place?: string;
}) {
  const narrow = split ? "" : (place ?? NARROW);
  const wide = split ? "" : WIDE;

  switch (block.type) {
    case "p":
      // Body copy sits back from the foreground, the same as the notes column,
      // so the `**bold**` runs inside it are the beats that carry a section.
      return (
        <p data-reveal="up" className={`leading-relaxed text-muted ${narrow}`}>
          {withEmphasis(block.text)}
        </p>
      );

    case "pull":
      // Body size, but carried in the foreground at the same weight as an
      // emphasised phrase — the beat of a section reads as one, not as a
      // heading set in the middle of the copy.
      return (
        <p
          data-reveal="up"
          className={`text-base font-medium leading-snug text-fg ${narrow}`}
        >
          {withEmphasis(block.text)}
        </p>
      );

    case "stats":
      return (
        <div data-reveal-group className={wide}>
          <BlockLabel>{block.label ?? "Key metrics"}</BlockLabel>

          {/* value over label. No column gap, padding instead, so the rules
              meet and read as one line across the row. */}
          <div
            className={`mt-10 grid gap-y-8 ${
              split
                ? "sm:grid-cols-2"
                : block.items.length >= 4
                  ? "sm:grid-cols-2 lg:grid-cols-4"
                  : "sm:grid-cols-3"
            }`}
          >
            {block.items.map((stat, i) => (
              <div
                key={stat.label}
                data-reveal-item="up"
                style={
                  { "--reveal-delay": `${i * 90}ms` } as React.CSSProperties
                }
                className="flex flex-col pr-8"
              >
                <span className="font-hero-1 text-3xl leading-none text-fg sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-4 border-t border-border pt-4 text-sm text-muted">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "impact":
      return (
        <ImpactList
          label={block.label}
          items={block.items}
          compact={block.compact}
          className={narrow}
        />
      );

    case "pairs":
      return (
        <dl data-reveal-group className={narrow}>
          <PairRows items={block.items} dropFirstRule={opensSection} />
        </dl>
      );

    case "notes":
      return (
        // One gap scale down the column instead of per-element margins: 24px
        // between groups, 16px between a group's own parts, 20px between the
        // paragraphs inside one. A group that opens with a marker takes a
        // wider gap above it, since the marker starts a new thought.
        <div data-reveal-group className={`flex flex-col gap-6 ${narrow}`}>
          {block.groups.map((group, g) => (
            <div
              // a group without a marker has no heading to key on
              key={group.heading ?? g}
              data-reveal-item="up"
              style={{ "--reveal-delay": `${g * 90}ms` } as React.CSSProperties}
              className={`flex flex-col gap-4 ${
                group.heading && g > 0 ? "mt-4" : ""
              }`}
            >
              {group.heading && (
                <h4 className="font-label text-contrast">{group.heading}</h4>
              )}
              {group.text && (
                <p
                  className={
                    group.lead
                      ? "font-body-xl text-fg"
                      : "leading-relaxed text-muted"
                  }
                >
                  {withEmphasis(group.text)}
                </p>
              )}

              {/* a listing rather than an argument. `**bold**` inside a bullet
                  still resolves to the foreground, as it does in any copy. */}
              {group.bullets && (
                <ul className="flex list-disc flex-col gap-3 pl-5 marker:text-muted">
                  {group.bullets.map((bullet, b) => (
                    <li key={b} className="leading-relaxed text-muted">
                      {withEmphasis(bullet)}
                    </li>
                  ))}
                </ul>
              )}
              {group.items && (
                <div className="flex flex-col gap-5">
                  {group.items.map((item, i) => (
                    <div key={item.title ?? i}>
                      {/* nested under the group's own label, so a level down
                          and set in sentence case rather than caps */}
                      {item.title && (
                        <h5
                          data-case="normal"
                          className="font-label text-contrast"
                        >
                          {item.title}
                        </h5>
                      )}
                      <p className="leading-relaxed text-muted">
                        {withEmphasis(item.text)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "comparison":
      return (
        <div data-reveal-group className={wide}>
          {block.label && <BlockLabel>{block.label}</BlockLabel>}

          {/* two columns and an arrow gutter, so every row lines up under its
              heading and the arrow column stays the same width throughout */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-x-4 sm:gap-x-10">
            <h3 className="text-2xl leading-[1.1] text-fg sm:text-3xl md:text-4xl">
              {block.headings[0]}
            </h3>
            <span aria-hidden="true" className="w-4 sm:w-5" />
            <h3 className="text-2xl leading-[1.1] text-fg sm:text-3xl md:text-4xl">
              {block.headings[1]}
            </h3>
          </div>
          <div className="hairline mt-6 h-px w-full" />

          {block.rows.map((row, i) => (
            <div
              key={row.before}
              data-reveal-item="up"
              style={
                { "--reveal-delay": `${i * 110}ms` } as React.CSSProperties
              }
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 py-5 sm:gap-x-10 md:py-7"
            >
              <p className="text-sm leading-snug text-muted sm:text-base md:text-lg">
                {row.before}
              </p>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4 shrink-0 text-muted sm:size-5 md:size-6"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <p className="text-sm font-medium leading-snug text-fg sm:text-base md:text-lg">
                {row.after}
              </p>
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        // scrolls inside its own box, so a long cell can never push the page
        // sideways on a phone
        <div data-reveal="up" className={`w-full overflow-x-auto ${narrow}`}>
          <table className="w-full min-w-[22rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {block.headings.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-3 pr-6 font-medium text-fg last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([a, b]) => (
                <tr key={a} className="border-b border-border last:border-0">
                  <td className="py-3 pr-6 leading-relaxed text-muted">
                    {withEmphasis(a)}
                  </td>
                  <td className="py-3 leading-relaxed text-muted">
                    {withEmphasis(b)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "inputs":
      return (
        <div data-reveal-group className={narrow}>
          {/* the actual inputs, at thumbnail size: the point is how few there
              are, not what they look like */}
          <div className="flex flex-wrap items-center gap-3">
            {block.items.map((item, i) => (
              <Fragment key={item.src}>
                {i === block.items.length - 1 && block.items.length > 1 && (
                  <span aria-hidden="true" className="px-1 text-lg text-muted">
                    +
                  </span>
                )}
                <span
                  data-reveal-item="up"
                  style={
                    { "--reveal-delay": `${i * 90}ms` } as React.CSSProperties
                  }
                  className="block h-12 w-12 overflow-hidden rounded-xl bg-surface"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={48}
                    height={48}
                    unoptimized
                    className={`h-full w-full ${
                      item.fit === "contain" ? "object-contain" : "object-cover"
                    }`}
                  />
                </span>
              </Fragment>
            ))}
          </div>
          {block.label && (
            <p className="mt-3 text-sm text-muted">{block.label}</p>
          )}
        </div>
      );

    case "points":
      // numbered: a ruled band of 01/02/03 columns, run at full width
      if (block.numbered)
        return (
          <div data-reveal-group className={wide}>
            <span data-reveal="line" className="hairline block h-px w-full" />
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-3 lg:mt-14">
              {block.items.map((point, i) => (
                <div
                  key={point.title}
                  data-reveal-item="up"
                  style={
                    { "--reveal-delay": `${i * 110}ms` } as React.CSSProperties
                  }
                >
                  <span className="text-sm text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-xl leading-snug text-fg">
                    {point.title}
                  </h3>
                  <p className="font-body-sm mt-4 text-muted">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      return (
        <div data-reveal-group className={`flex flex-col gap-y-6 ${narrow}`}>
          {block.label && <BlockLabel>{block.label}</BlockLabel>}
          {block.items.map((point, i) => (
            <div
              key={point.title}
              data-reveal-item="up"
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <h3 className="text-lg leading-snug text-fg">{point.title}</h3>
              <p className="font-body-sm mt-2 text-muted">{point.text}</p>
            </div>
          ))}
        </div>
      );

    case "media":
      // handled by the full-bleed runs in StorySection, never inside the grid
      return null;
  }
}

// A section is split into alternating runs: figures break out of the reading
// column and run the full viewport, everything else stays in the 12-col grid.
// Splitting rather than breaking out with `w-screen` keeps the page free of
// horizontal overflow when a scrollbar is present.
type Run = { media: boolean; blocks: CaseStudyBlock[] };

function toRuns(blocks: CaseStudyBlock[]): Run[] {
  const runs: Run[] = [];
  for (const block of blocks) {
    const media = block.type === "media";
    if (media && !SHOW_EMPTY_MEDIA && !block.items.some((i) => i.src)) continue;
    const last = runs[runs.length - 1];
    if (last && last.media === media) last.blocks.push(block);
    else runs.push({ media, blocks: [block] });
  }
  return runs;
}

// The split layout: heading and copy pinned in a left column while the
// section's figures scroll past on the right. The pinned column is a grid item
// with `self-start`, without which it would stretch to the row's full height
// and have no room left to travel.
function SplitSection({
  id,
  act,
  heading,
  blocks,
}: {
  id: string;
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
}) {
  // Stats break out of the pinned column and run the full width beneath the
  // figures, where a row of numbers has the room to be read as a row.
  const copy = blocks.filter((b) => b.type !== "media" && !isResult(b));
  const results = blocks.filter(isResult);
  const figures = blocks.flatMap((b) => (b.type === "media" ? b.items : []));
  const shown = SHOW_EMPTY_MEDIA ? figures : figures.filter((f) => f.src);

  return (
    <section id={id} className={`relative scroll-mt-24 ${SECTION_PAD}`}>
      <SectionRule />
      <div className={COLUMN}>
        <div className="relative">
          <div className="flex flex-col gap-y-8 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:sticky lg:top-24 lg:col-span-6 lg:col-start-1 lg:self-start">
              {act && (
                <div className="act-mark pb-4 text-sm font-medium uppercase tracking-[-0.02em]">
                  {act}
                </div>
              )}
              <h2
                data-reveal="up"
                className="text-[2.25rem] leading-[1.1] text-fg"
              >
                {heading}
              </h2>
              {copy.length > 0 && (
                <div className="mt-6 flex flex-col gap-y-6">
                  {copy.map((block, i) => (
                    <Block key={i} block={block} opensSection={i === 0} split />
                  ))}
                </div>
              )}
            </div>

            {shown.length > 0 && (
              <div
                className={`lg:col-span-6 lg:col-start-7 ${
                  shown.length >= 4
                    ? "grid grid-cols-2 gap-2"
                    : "flex flex-col gap-2"
                }`}
              >
                {shown.map((item) => (
                  <Media key={item.title} item={item} />
                ))}
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-10 flex flex-col gap-y-12 lg:mt-14">
              {results.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// The stacked layout: copy at the top, figures full width beneath it, results
// last. For a section whose figure is the proof of its claim and needs the room
// to make it, rather than sitting in a column beside the copy.
function StackedSection({
  id,
  act,
  heading,
  blocks,
  barcode,
}: {
  id: string;
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
  barcode?: string;
}) {
  const copy = blocks.filter((b) => b.type !== "media" && !isResult(b));
  const results = blocks.filter(isResult);
  const figures = blocks.flatMap((b) => (b.type === "media" ? b.items : []));
  const shown = SHOW_EMPTY_MEDIA ? figures : figures.filter((f) => f.src);

  return (
    <section id={id} className={`relative scroll-mt-24 ${SECTION_PAD}`}>
      <SectionRule />
      <div className={COLUMN}>
        <div className="relative">
          {act && (
            <div className="act-mark pb-4 text-sm font-medium uppercase tracking-[-0.02em]">
              {act}
            </div>
          )}
          {/* a figure-only section has none, and an empty one would still
              take its top margin with it */}
          {heading && (
            <h2
              data-reveal="up"
              className="max-w-3xl text-[2.25rem] leading-[1.1] text-fg"
            >
              {heading}
            </h2>
          )}
          {copy.length > 0 && (
            <div className="mt-6 flex max-w-2xl flex-col gap-y-6">
              {copy.map((block, i) => (
                <Block key={i} block={block} split />
              ))}
            </div>
          )}

          {/* A stacked section's copy is capped at max-w-2xl, so the right of
              the row is empty by design. On a closing beat it carries the site
              mark, sat on the baseline of the copy beside it the way it would be
              printed in the margin of a spec sheet. Below lg the copy has the
              full width and there is no margin to put it in. */}
          {barcode && (
            <div
              data-reveal="up"
              className="pointer-events-none absolute bottom-0 right-0 hidden lg:block"
            >
              <BarcodeMark code={barcode} className="text-fg opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* the figure runs the full viewport, in the footer's gutters */}
      {shown.length > 0 && (
        <div className="mt-10 flex w-full flex-col gap-2 section-gutter lg:mt-14">
          {shown.map((item) => (
            <Media key={item.title} item={item} />
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className={`${COLUMN} mt-12 flex flex-col gap-y-14 lg:mt-16`}>
          {results.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      )}
    </section>
  );
}

function StorySection({
  id,
  act,
  heading,
  blocks,
  split = false,
  layout,
  barcode,
  columns = "half",
}: {
  id: string;
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
  split?: boolean;
  layout?: "stacked";
  barcode?: string;
  /** "wide" divides 4/8 instead of the page's 6/6 spine, which the header
      sets and every section follows */
  columns?: "half" | "wide";
}) {
  // Results land under the figures, never above them: a number means more once
  // the thing it measures has been seen.
  const results = blocks.filter(isResult);
  const runs = toRuns(blocks.filter((b) => !isResult(b)));
  const wide = columns === "wide";
  const headingBand = wide
    ? "lg:col-span-4 lg:col-start-1"
    : "lg:col-span-6 lg:col-start-1";
  const copyBand = wide ? "lg:col-span-8 lg:col-start-5" : undefined;

  const resultsRun =
    results.length > 0 ? (
      <div className="mt-10 flex flex-col gap-y-14 lg:mt-14">
        {results.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    ) : null;

  // A section can ask for the stacked treatment even inside a split story.
  if (layout === "stacked") {
    return (
      <StackedSection
        id={id}
        act={act}
        heading={heading}
        blocks={blocks}
        barcode={barcode}
      />
    );
  }

  // A section with no figures has nothing to pin the copy against, and the
  // split would leave two thirds of the row empty — those keep the standard
  // heading-beside-copy layout.
  if (split && blocks.some((b) => b.type === "media")) {
    return <SplitSection id={id} act={act} heading={heading} blocks={blocks} />;
  }

  return (
    // scroll-mt clears the fixed nav when the rail jumps to this section
    <section id={id} className={`relative scroll-mt-24 ${SECTION_PAD}`}>
      <SectionRule />
      {runs.map((run, runIndex) => {
        const items = run.media
          ? run.blocks.flatMap((b) => (b.type === "media" ? b.items : []))
          : [];
        // Landscape figures run one after another at full width — a wide
        // screenshot loses its detail the moment it shares a row. Only tall
        // figures pack across, where a set of clips reads as a set and
        // stacking them would each be a screen of scrolling on its own.
        // gap-2 is the experiments bento's 8px, matching the home page wall.
        const packs =
          items.length > 1 &&
          items.every(
            (i) => !i.width || !i.height || i.width / i.height < 1.2,
          );
        const mediaLayout = !packs
          ? "flex flex-col gap-y-6"
          : items.length >= 4
            ? "grid grid-cols-2 gap-2 lg:grid-cols-4"
            : "grid gap-2 sm:grid-cols-2";

        return run.media ? (
          // Full viewport width, in the footer's 16px gutters. A trailing run
          // takes no bottom margin — the section's own padding closes it, and
          // stacking both left a gap twice the size of the one under the rule.
          <div
            key={runIndex}
            className={`mt-10 w-full section-gutter lg:mt-16 ${
              runIndex === runs.length - 1 ? "" : "mb-10 lg:mb-16"
            } ${mediaLayout}`}
          >
            {items.map((item) => (
              <Media key={item.title} item={item} />
            ))}
          </div>
        ) : (
          <div key={runIndex} className={COLUMN}>
            <div className="relative">
              {runIndex === 0 && act && (
                <div className="act-mark pb-4 text-sm font-medium uppercase tracking-[-0.02em]">
                  {act}
                </div>
              )}

              <div className={SECTION_GRID}>
                {/* body sans, not the display face: these headings sit in the
                    reading column beside the copy, not over it */}
                {runIndex === 0 && (
                  <h2
                    data-reveal="up"
                    className={`text-[2.25rem] leading-[1.1] text-fg ${headingBand}`}
                  >
                    {heading}
                  </h2>
                )}
                {run.blocks.map((block, i) => (
                  <Block
                    key={i}
                    block={block}
                    place={copyBand}
                    opensSection={runIndex === 0 && i === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {resultsRun && <div className={COLUMN}>{resultsRun}</div>}
    </section>
  );
}

// Split the story's sections into runs that share a pinned panel and singles
// that render on their own. A section joins a run when the story is split and
// it hasn't asked for another layout — a beat carrying no figure of its own
// joins too, and simply leaves the column empty while it is read. Dropping it
// out instead ended the run at that beat and opened a fresh one at the next
// figure, which reprinted the act label and made the pinned panel let go and
// re-catch in the middle of an act.
type SectionGroup =
  | { run: ActRunSection[]; section?: undefined }
  | { run?: undefined; section: CaseStudySection & { id: string } };

function groupSections(
  story: CaseStudy,
  ids: string[],
  split: boolean,
): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let act: string | undefined;

  story.sections.forEach((section, i) => {
    const id = ids[i + 2];
    if (section.act) act = section.act;

    const figures = section.blocks.flatMap((b) =>
      b.type === "media" ? b.items : [],
    );
    // A figureless section that is the whole of its act has nothing to pin
    // against, and joining would hold most of a screen of empty column open
    // beside its copy — the run reserves that height so the copy has room to
    // settle. Full width instead: no column, so nothing to leave empty. A
    // figureless beat *inside* an act still joins, where the empty column is
    // the cheaper of the two costs.
    const aloneInAct = !!section.act && !!story.sections[i + 1]?.act;
    // Numbers need the full-width band under a section, which a run has not
    // got, so a beat that ends in them still renders on its own.
    const joins =
      split &&
      !section.layout &&
      (figures.length > 0 ||
        (!section.blocks.some(isResult) && !aloneInAct));
    if (!joins) {
      // Copy-only sections run full width. Set beside a figure column they
      // have nothing to fill it with, and their copy reads as a caption on
      // the next section's image.
      const layout = section.layout ?? (split ? "stacked" : undefined);
      groups.push({ section: { ...section, id, layout } });
      return;
    }
    const copy = section.blocks.filter(
      (b) => b.type !== "media" && !isResult(b),
    );

    const entry: ActRunSection = {
      id,
      // carried down, so an act label stays put across every section in it
      act,
      heading: section.heading,
      copy: copy.map((block, bi) => <Block key={bi} block={block} split />),
      figures: figures.length ? (
        /* The column is pinned so a short figure stays beside the copy it
           belongs to. A figure that pins its own contents is not short and does
           not want it: nesting one sticky mechanism inside another leaves the
           inner one measuring its own position against a rect that has stopped
           tracking the scroll, and the stack desyncs from what is on screen. */
        <div
          className={`${figures.some((f) => f.figure && SELF_PINNING.has(f.figure)) ? "" : "lg:sticky lg:top-24"} ${
            figures.length >= 4
              ? "grid grid-cols-2 gap-2"
              : "flex flex-col gap-2"
          }`}
        >
          {figures.map((item) => (
            <Media key={item.title} item={item} />
          ))}
        </div>
      ) : null,
      // A beat with no figure has nothing on the right to give it height, so
      // it would be scrolled through in an instant and its copy would never
      // settle. Hold the row open for most of a screen instead.
      className: figures.length
        ? "pb-8 lg:pb-14"
        : "pb-8 lg:min-h-[60vh] lg:pb-14",
    };

    const last = groups[groups.length - 1];
    if (last?.run) last.run.push(entry);
    else groups.push({ run: [entry] });
  });

  return groups;
}

export function CaseStudyStory({ story }: { story: CaseStudy }) {
  // same list the rail is built from: [overview, my role, ...sections]
  const ids = storySectionIds(story);
  const split = story.layout === "split";

  return (
    <div className="mt-12 sm:mt-16" data-story>
      {/* figures drift against the copy beside them, scrubbed to the scroll */}
      <StoryMotion />
      {/* The opening section. A composed one keeps the standard layout on
          purpose — its heading belongs on the left with the whole run of copy
          beside it, which the pinned split cannot do. */}
      {story.overview ? (
        <StorySection
          id={ids[0]}
          heading={story.overview.heading}
          blocks={story.overview.blocks}
        />
      ) : story.summary?.length || story.summaryMedia?.length ? (
        <StorySection
          split={split}
          id={ids[0]}
          heading="Overview"
          blocks={[
            { type: "pairs", items: story.summary ?? [] },
            ...(story.summaryMedia?.length
              ? ([{ type: "media", items: story.summaryMedia }] as const)
              : []),
          ]}
        />
      ) : /* a story whose opening matter lives in the header has no second
             section to give it — an empty Overview frame is worse than none */
      null}
      {/* Heading left, copy in the right band — and never the pinned split, so
          the three Spaces screens still run the full width beneath rather than
          sitting shrunk in a column beside the copy. */}
      <StorySection
        split={false}
        id={ids[1]}
        heading="My role"
        blocks={[
          // prose, a paragraph per line, or the owned / built / guided rows
          ...(story.roleText
            ? story.roleText
                .split("\n")
                .filter((line) => line.trim())
                .map((text) => ({ type: "p", text }) as const)
            : ([{ type: "pairs", items: story.role ?? [] }] as const)),
          // the outcome sits with the copy, not after the screens below it
          ...(story.roleImpact?.length
            ? ([
                {
                  type: "impact",
                  label: "The impact",
                  compact: true,
                  items: story.roleImpact,
                },
              ] as const)
            : []),
          ...(story.roleMedia?.length
            ? ([{ type: "media", items: story.roleMedia }] as const)
            : []),
        ]}
      />

      {/* Consecutive split sections that carry figures share one pinned panel:
          the copy holds its place and swaps as you cross into the next, rather
          than each section pinning and scrolling away on its own. Anything else
          — stacked sections, sections with no figures — renders on its own. */}
      {groupSections(story, ids, split).map((group, g) =>
        group.run ? (
          <div key={`run-${g}`} className={SECTION_PAD}>
            <StickyActRun sections={group.run} />
          </div>
        ) : (
          <StorySection
            key={group.section.id}
            split={split}
            layout={group.section.layout}
            barcode={group.section.barcode}
            id={group.section.id}
            act={group.section.act}
            heading={group.section.heading}
            blocks={group.section.blocks}
          />
        ),
      )}
    </div>
  );
}
