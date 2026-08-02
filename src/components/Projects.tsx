"use client";

import Link from "next/link";
import { projects } from "@/content/site";
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
  return (
    <section id="projects" className="relative scroll-mt-20 px-4 py-20 sm:py-28">
      {/* label cursor — only appears over the project tiles */}
      <MagneticCursor label="View case" size={150} triggerSelector="[data-cursor]" />

      <div>
        {/* header: title */}
        <div className="mb-14">
          <h2 className="font-hero-1 text-4xl leading-none text-fg sm:text-5xl">
            <GlitchInitial letter="W" intervalMs={5200} />ork
          </h2>
        </div>

        {/* tiles in a row (stacks only on small screens) */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {projects.map((project, i) => {
            return (
              <div key={project.title}>
                {/* the tile opens the case study; the live site is linked from there */}
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor="View case"
                  aria-label={project.title}
                  className="group relative block aspect-video w-full overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.5)]"
                >
                  {/* the frame stays put; only this media layer scales on hover */}
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={
                      project.image
                        ? {
                            backgroundImage: `url(${project.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            background:
                              TILE_GRADIENTS[i % TILE_GRADIENTS.length],
                          }
                    }
                  />
                </Link>

                {/* meta below the tile */}
                <div className="mt-5">
                  {project.year && (
                    <div className="font-mono text-xs uppercase tracking-wider text-muted">
                      {project.year}
                    </div>
                  )}
                  {/* UI sans-serif (body font) — no display/pixel treatment */}
                  <h3 className="mt-2 text-2xl text-fg sm:text-3xl">
                    {project.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
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
