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

function Media({ item }: { item: CaseStudyMedia }) {
  if (item.src) {
    return (
      <figure data-reveal="up">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={item.src}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
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
              style={
                { "--reveal-delay": `${i * 90}ms` } as React.CSSProperties
              }
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
  act,
  heading,
  blocks,
}: {
  act?: string;
  heading: string;
  blocks: CaseStudyBlock[];
}) {
  const runs = toRuns(blocks);

  return (
    <section className={SECTION_PAD}>
      {runs.map((run, runIndex) =>
        run.media ? (
          // full viewport width, in the footer's 16px gutters
          <div
            key={runIndex}
            className="my-6 flex w-full flex-col gap-y-6 px-4 lg:my-8"
          >
            {run.blocks.flatMap((block) =>
              block.type === "media"
                ? block.items.map((item) => (
                    <Media key={item.title} item={item} />
                  ))
                : [],
            )}
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
                {runIndex === 0 && (
                  <h2
                    data-reveal="up"
                    className="font-hero-1 text-2xl leading-tight text-fg sm:text-3xl lg:col-span-6 lg:col-start-1"
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
        ),
      )}
    </section>
  );
}

export function CaseStudyStory({ story }: { story: CaseStudy }) {
  return (
    <div className="mt-12 sm:mt-16">
      <StorySection
        heading="Overview"
        blocks={[{ type: "pairs", items: story.summary }]}
      />
      <StorySection
        heading="My role"
        blocks={[{ type: "pairs", items: story.role }]}
      />

      {story.sections.map((section) => (
        <StorySection
          key={section.heading}
          act={section.act}
          heading={section.heading}
          blocks={section.blocks}
        />
      ))}
    </div>
  );
}
