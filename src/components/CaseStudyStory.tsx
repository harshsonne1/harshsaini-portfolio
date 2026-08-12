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

import Image from "next/image";
import type { CaseStudy, CaseStudyBlock, CaseStudyMedia } from "@/content/site";
import { CoverVideo } from "@/components/CoverVideo";
import type { RailItem } from "@/components/SectionRail";

// Empty image slots still render as labelled frames so the art direction is
// visible while assets are being cut. Flip to false to hide every slot that
// has no `src` yet.
const SHOW_EMPTY_MEDIA = true;

// vertical rhythm, matching the reference's fluid scale: 56px top and bottom,
// opening to 200px at the foot of a section on desktop (both at a 1440 design
// width, and both clamped so they hold up either side of it)
const SECTION_PAD =
  "pt-[clamp(2rem,3.9vw,3.5rem)] pb-[clamp(2rem,3.9vw,3.5rem)] lg:pb-[clamp(3.5rem,13.9vw,12.5rem)]";

// the reading column — capped and centred. Figures deliberately skip this and
// run the full viewport in the footer's 16px gutters instead.
const COLUMN = "mx-auto w-full max-w-[1400px] px-4";

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
    { id: ids[0], label: "Overview" },
    { id: ids[1], label: "My role" },
    ...story.sections.flatMap((section, i) =>
      section.railSkip
        ? []
        : [{ id: ids[i + 2], label: section.heading, act: section.act }],
    ),
  ];
}

const isVideo = (src: string) => /\.(webm|mp4|mov)$/i.test(src);

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
        <figcaption className="mt-3 text-xs text-muted">
          {item.title}
        </figcaption>
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
function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pb-3">
      <h3 className="text-xs uppercase tracking-wider text-muted">
        {children}
      </h3>
      <span
        data-reveal="line"
        className="hairline absolute inset-x-0 bottom-0 h-px"
      />
    </div>
  );
}

// label / text rows, used by `pairs` and by the front-matter lists
function PairRows({ items }: { items: { label: string; text: string }[] }) {
  return (
    <>
      {items.map((pair, i) => (
        <div
          key={pair.label}
          data-reveal-item="up"
          style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          className="grid grid-cols-1 gap-1 border-t border-border py-5 sm:grid-cols-4 sm:gap-8"
        >
          <dt className="text-xs uppercase tracking-wider text-muted">
            {pair.label}
          </dt>
          <dd className="leading-relaxed text-fg sm:col-span-3">{pair.text}</dd>
        </div>
      ))}
    </>
  );
}

function Block({ block }: { block: CaseStudyBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p
          data-reveal="up"
          className={`text-lg leading-relaxed text-fg ${NARROW}`}
        >
          {block.text}
        </p>
      );

    case "pull":
      return (
        <p
          data-reveal="up"
          className={`border-l border-border pl-5 text-xl leading-snug text-fg sm:text-2xl ${NARROW}`}
        >
          {block.text}
        </p>
      );

    case "stats":
      return (
        <div data-reveal-group className={WIDE}>
          <BlockLabel>Key metrics</BlockLabel>
          <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:flex lg:justify-between">
            {block.items.map((stat, i) => (
              <li
                key={stat.label}
                data-reveal-item="up"
                style={
                  { "--reveal-delay": `${i * 90}ms` } as React.CSSProperties
                }
                className="flex flex-col lg:flex-1"
              >
                <span className="font-hero-1 text-3xl leading-none text-fg sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-2 max-w-[16rem] text-sm text-muted">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "pairs":
      return (
        <dl data-reveal-group className={NARROW}>
          <PairRows items={block.items} />
        </dl>
      );

    case "points":
      return (
        <div data-reveal-group className={`flex flex-col gap-y-6 ${NARROW}`}>
          {block.items.map((point, i) => (
            <div
              key={point.title}
              data-reveal-item="up"
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <h3 className="text-lg leading-snug text-fg">{point.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{point.text}</p>
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

function StorySection({
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
  const runs = toRuns(blocks);

  return (
    // scroll-mt clears the fixed nav when the rail jumps to this section
    <section id={id} className={`scroll-mt-24 ${SECTION_PAD}`}>
      {runs.map((run, runIndex) => {
        const items = run.media
          ? run.blocks.flatMap((b) => (b.type === "media" ? b.items : []))
          : [];
        // One figure runs the full width; a set of them shares the row, so
        // four portrait clips read as a set rather than as four screens of
        // scrolling.
        const mediaLayout =
          items.length >= 4
            ? "grid grid-cols-2 gap-4 lg:grid-cols-4"
            : items.length > 1
              ? "grid gap-4 sm:grid-cols-2"
              : "flex flex-col gap-y-6";

        return run.media ? (
          // full viewport width, in the footer's 16px gutters
          <div
            key={runIndex}
            className={`my-6 w-full px-4 lg:my-8 ${mediaLayout}`}
          >
            {items.map((item) => (
              <Media key={item.title} item={item} />
            ))}
          </div>
        ) : (
          <div key={runIndex} className={COLUMN}>
            <div className="relative">
              {/* the hairline that opens every section, drawn left to right */}
              {runIndex === 0 && (
                <span
                  data-reveal="line"
                  className="hairline absolute inset-x-0 top-0 h-px"
                />
              )}

              {runIndex === 0 && act && (
                <div className="pb-10 pt-6 text-xs uppercase tracking-[0.25em] text-muted sm:pb-14">
                  {act}
                </div>
              )}

              <div
                className={`${SECTION_GRID} ${runIndex === 0 && !act ? "pt-6" : ""}`}
              >
                {/* body sans, not the display face: these headings sit in the
                    reading column beside the copy, not over it */}
                {runIndex === 0 && (
                  <h2
                    data-reveal="up"
                    className="text-[2.25rem] leading-tight text-fg lg:col-span-6 lg:col-start-1"
                  >
                    {heading}
                  </h2>
                )}
                {run.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function CaseStudyStory({ story }: { story: CaseStudy }) {
  // same list the rail is built from: [overview, my role, ...sections]
  const ids = storySectionIds(story);

  return (
    <div className="mt-12 sm:mt-16">
      <StorySection
        id={ids[0]}
        heading="Overview"
        blocks={[
          { type: "pairs", items: story.summary },
          ...(story.summaryMedia?.length
            ? ([{ type: "media", items: story.summaryMedia }] as const)
            : []),
        ]}
      />
      {/* the role figures close this section, so they run full-bleed under it */}
      <StorySection
        id={ids[1]}
        heading="My role"
        blocks={[
          { type: "pairs", items: story.role },
          ...(story.roleMedia?.length
            ? ([{ type: "media", items: story.roleMedia }] as const)
            : []),
        ]}
      />

      {story.sections.map((section, i) => (
        <StorySection
          key={ids[i + 2]}
          id={ids[i + 2]}
          act={section.act}
          heading={section.heading}
          blocks={section.blocks}
        />
      ))}
    </div>
  );
}
