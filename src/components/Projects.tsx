"use client";

import { useState } from "react";
import { projects } from "@/content/site";
import TargetCursor from "./TargetCursor";

// gradient placeholders for tiles without an image (cycled by index)
const TILE_GRADIENTS = [
  "radial-gradient(circle at 50% 42%, rgba(150,180,90,0.45), transparent 62%), #161615",
  "linear-gradient(135deg, #38bdf8 0%, #e879f9 46%, #fb923c 100%)",
  "linear-gradient(135deg, #22d3ee 0%, #6366f1 55%, #0f172a 100%)",
  "radial-gradient(circle at 60% 40%, rgba(244,114,182,0.5), transparent 60%), #1a1420",
];

export function Projects() {
  // the reticle cursor only takes over while the pointer is inside this section
  const [cursorOn, setCursorOn] = useState(false);

  return (
    <section
      id="projects"
      onMouseEnter={() => setCursorOn(true)}
      onMouseLeave={() => setCursorOn(false)}
      className="relative scroll-mt-20 px-4 py-20 sm:py-28"
    >
      {cursorOn && (
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          cursorColor="#ffffff"
          cursorColorOnTarget="#B497CF"
        />
      )}

      <div>
        {/* header: title */}
        <div className="mb-14">
          <h2 className="font-hero-1 text-4xl leading-none text-fg sm:text-5xl">
            <span className="font-wordmark">W</span>ork
          </h2>
        </div>

        {/* tiles in a row (stacks only on small screens) */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {projects.map((project, i) => {
            const external = project.link?.startsWith("http");
            return (
              <div key={project.title}>
                <a
                  href={project.link || "#"}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="cursor-target group relative block aspect-video w-full overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out hover:-translate-y-1"
                  style={
                    project.image
                      ? {
                          backgroundImage: `url(${project.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: TILE_GRADIENTS[i % TILE_GRADIENTS.length] }
                  }
                >
                  {/* View case — fades in on hover */}
                  <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="bg-white/85 px-8 py-6 text-sm font-medium text-black">
                      View case
                    </span>
                  </div>
                </a>

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
