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
import { CoverVideo } from "@/components/CoverVideo";
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

  return [
    {
      id: ids[0],
      label: story.overview?.railLabel ?? story.overview?.heading ?? "Overview",
    },
    { id: ids[1], label: "My role" },
    ...story.sections.flatMap((section, i) =>
      section.railSkip
        ? []
        : [{ id: ids[i + 2], label: section.heading, act: section.act }],
    ),
  ];
}

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

function Media({ item }: { item: CaseStudyMedia }) {
  if (item.src) {
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
          {isVideo(item.src) ? (
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
      <span className="max-w-3xl text-sm leading-relaxed text-muted">
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
      return (
        <p data-reveal="up" className={`font-body-sm text-fg ${narrow}`}>
          {withEmphasis(block.text)}
        </p>
      );

    case "pull":
      return (
        <p
          data-reveal="up"
          className={`text-xl leading-snug text-fg sm:text-2xl ${narrow}`}
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
        <div data-reveal-group className={narrow}>
          {block.label && <BlockLabel>{block.label}</BlockLabel>}
          {/* one rule down the whole set, in the figure colour — the lines are
              read together, so they share a single mark rather than each
              carrying its own */}
          <ul
            className={`flex flex-col gap-6 border-l-2 border-[var(--color-stat)] pl-6 ${
              block.label ? "mt-8" : ""
            }`}
          >
            {block.items.map((item, i) => (
              <li
                key={i}
                data-reveal-item="up"
                style={
                  { "--reveal-delay": `${i * 90}ms` } as React.CSSProperties
                }
                className="text-sm font-medium leading-snug text-fg"
              >
                {withEmphasis(item)}
              </li>
            ))}
          </ul>
        </div>
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
            <h3 className="text-2xl leading-tight text-fg sm:text-3xl md:text-4xl">
              {block.headings[0]}
            </h3>
            <span aria-hidden="true" className="w-4 sm:w-5" />
            <h3 className="text-2xl leading-tight text-fg sm:text-3xl md:text-4xl">
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
                <div className="pb-10 text-sm font-medium uppercase tracking-[-0.02em] text-muted">
                  {act}
                </div>
              )}
              <h2
                data-reveal="up"
                className="text-[2.25rem] leading-tight text-fg"
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
}: {
  id: string;
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
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
            <div className="pb-10 text-sm font-medium uppercase tracking-[-0.02em] text-muted">
              {act}
            </div>
          )}
          <h2
            data-reveal="up"
            className="max-w-3xl text-[2.25rem] leading-tight text-fg"
          >
            {heading}
          </h2>
          {copy.length > 0 && (
            <div className="mt-6 flex max-w-2xl flex-col gap-y-6">
              {copy.map((block, i) => (
                <Block key={i} block={block} split />
              ))}
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
  columns = "half",
}: {
  id: string;
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
  split?: boolean;
  layout?: "stacked";
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
      <StackedSection id={id} act={act} heading={heading} blocks={blocks} />
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
        // One figure runs the full width; a set of them shares the row, so
        // four portrait clips read as a set rather than as four screens of
        // scrolling.
        const mediaLayout =
          // gap-2 is the experiments bento's 8px, so a row of figures is set
          // to the same rhythm as the wall on the home page
          items.length >= 4
            ? "grid grid-cols-2 gap-2 lg:grid-cols-4"
            : items.length > 1
              ? "grid gap-2 sm:grid-cols-2"
              : "flex flex-col gap-y-6";

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
                <div className="pb-10 text-sm font-medium uppercase tracking-[-0.02em] text-muted sm:pb-14">
                  {act}
                </div>
              )}

              <div className={SECTION_GRID}>
                {/* body sans, not the display face: these headings sit in the
                    reading column beside the copy, not over it */}
                {runIndex === 0 && (
                  <h2
                    data-reveal="up"
                    className={`text-[2.25rem] leading-tight text-fg ${headingBand}`}
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
// that render on their own. A section joins a run when the story is split, it
// has figures, and it hasn't asked for another layout.
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

    const joins =
      split &&
      !section.layout &&
      section.blocks.some((b) => b.type === "media");
    if (!joins) {
      groups.push({ section: { ...section, id } });
      return;
    }

    const figures = section.blocks.flatMap((b) =>
      b.type === "media" ? b.items : [],
    );
    const copy = section.blocks.filter(
      (b) => b.type !== "media" && !isResult(b),
    );

    const entry: ActRunSection = {
      id,
      // carried down, so an act label stays put across every section in it
      act,
      heading: section.heading,
      copy: copy.map((block, bi) => <Block key={bi} block={block} split />),
      figures: (
        <div
          className={
            figures.length >= 4
              ? "grid grid-cols-2 gap-2"
              : "flex flex-col gap-2"
          }
        >
          {figures.map((item) => (
            <Media key={item.title} item={item} />
          ))}
        </div>
      ),
      className: "pb-16 lg:pb-28",
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
    <div className="mt-12 sm:mt-16">
      {/* The opening section. A composed one keeps the standard layout on
          purpose — its heading belongs on the left with the whole run of copy
          beside it, which the pinned split cannot do. */}
      {story.overview ? (
        <StorySection
          id={ids[0]}
          heading={story.overview.heading}
          blocks={story.overview.blocks}
        />
      ) : (
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
      )}
      {/* Heading left, copy in the right band — and never the pinned split, so
          the three Spaces screens still run the full width beneath rather than
          sitting shrunk in a column beside the copy. */}
      <StorySection
        split={false}
        id={ids[1]}
        heading="My role"
        blocks={[
          // one paragraph across the column, or the owned / built / guided rows
          ...(story.roleText
            ? ([{ type: "p", text: story.roleText }] as const)
            : ([{ type: "pairs", items: story.role ?? [] }] as const)),
          // the outcome sits with the copy, not after the screens below it
          ...(story.roleImpact?.length
            ? ([
                {
                  type: "impact",
                  label: "The impact",
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
