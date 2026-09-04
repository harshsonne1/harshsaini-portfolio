"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { projects } from "@/content/site";
import {
  cueCaseStudyOpen,
  cueWorkSound,
  primeWorkSound,
  rearmWorkSound,
} from "@/lib/work-sound";
import { CoverVideo } from "./CoverVideo";
import MagneticCursor from "./MagneticCursor";
import GlitchInitial from "./GlitchInitial";

// gradient placeholders for tiles without an image (cycled by index)
const TILE_GRADIENTS = [
  "radial-gradient(circle at 50% 42%, rgba(150,180,90,0.45), transparent 62%), #161615",
  "linear-gradient(135deg, #38bdf8 0%, #e879f9 46%, #fb923c 100%)",
  "linear-gradient(135deg, #22d3ee 0%, #6366f1 55%, #0f172a 100%)",
  "radial-gradient(circle at 60% 40%, rgba(244,114,182,0.5), transparent 60%), #1a1420",
];

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // fetched and decoded before the first hover, so the cue is not a wait
    primeWorkSound();

    /* The cue is armed once per visit to the section, and leaving the viewport
       is what counts as leaving — not the pointer wandering off the tiles. So
       hovering around inside Work stays silent after the first click, while
       scrolling away and coming back earns it again. */
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) rearmWorkSound();
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative scroll-mt-20 px-4 py-20 sm:py-28"
      // the whole section is the target, so reaching Work at all sounds it
      onPointerEnter={cueWorkSound}
    >
      {/* label cursor — only appears over the project tiles */}
      <MagneticCursor
        label="View case"
        size={150}
        triggerSelector="[data-cursor]"
      />

      <div>
        {/* header: title */}
        <div className="mb-14">
          <h2 className="font-hero-1 text-4xl leading-none text-fg sm:text-5xl">
            <GlitchInitial letter="W" intervalMs={5200} />
            ork
          </h2>
        </div>

        {/* tiles in a row (stacks only on small screens) */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {projects.map((project, i) => {
            return (
              // one trigger per card: the media wipes in, then the copy rises
              <div key={project.title} data-reveal-group>
                {/* the tile opens the case study; the live site is linked from there */}
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor="View case"
                  aria-label={project.title}
                  className="work-card group relative block aspect-video w-full overflow-hidden"
                  // onClick rather than pointerdown: it covers opening the case
                  // study from the keyboard too, and skips a right-click
                  onClick={cueCaseStudyOpen}
                >
                  {/* wipe layer — kept separate from the link (whose drop shadow
                      a clip-path would cut) and from the media layer (whose own
                      transform transition it would override) */}
                  <div data-reveal-item="wipe" className="absolute inset-0">
                    {/* the frame stays put; only the media scales on hover */}
                    <div
                      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      style={
                        project.image
                          ? {
                              backgroundImage: `url(${project.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : project.video
                            ? // a video with no poster covers the tile itself —
                              // a gradient behind it would only flash on load
                              undefined
                            : {
                                background:
                                  TILE_GRADIENTS[i % TILE_GRADIENTS.length],
                              }
                      }
                    >
                      {/* the cover only moves while the pointer is on the
                          card — the wall of tiles stays still otherwise */}
                      {project.video && (
                        <CoverVideo
                          src={project.video}
                          poster={project.image}
                          trigger="hover"
                          hoverSelector=".work-card"
                        />
                      )}
                    </div>
                  </div>
                </Link>

                {/* meta below the tile — rises once the wipe is underway.
                    The year lives on the case study's meta row, not the card. */}
                <div className="mt-5">
                  {/* UI sans-serif (body font) — no display/pixel treatment */}
                  <h3
                    data-reveal-item="up"
                    style={{ "--reveal-delay": "650ms" } as React.CSSProperties}
                    className="text-2xl text-fg sm:text-3xl"
                  >
                    {project.title}
                  </h3>
                  <p
                    data-reveal-item="up"
                    style={{ "--reveal-delay": "750ms" } as React.CSSProperties}
                    // full card width, not a narrower measure, so the longer
                    // descriptions run the width of the tile above them
                    className="mt-2 text-base leading-relaxed text-muted"
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
