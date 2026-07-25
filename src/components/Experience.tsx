"use client";

import { useEffect, useRef } from "react";
import { experience } from "@/content/site";

// Timeline of roles, mirroring the reference: a wide three-column row per job —
// period (left), role + company (center), description (right). A hairline under
// each entry draws in left→right the first time it scrolls into view.
export function Experience() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lines = rootRef.current?.querySelectorAll<HTMLElement>(".exp-line");
    if (!lines?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-drawn");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    lines.forEach((l) => io.observe(l));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="experience"
      className="relative scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <h2 className="mb-12 font-hero-1 text-4xl leading-none text-fg sm:mb-16 sm:text-5xl">
        <span className="font-wordmark">E</span>xperience
      </h2>

      <div>
        {experience.map((job, i) => (
          <div key={job.company} className="relative">
            <div className="grid grid-cols-1 gap-3 py-10 md:grid-cols-12 md:gap-8 md:py-16">
              <div className="text-xs uppercase tracking-wider text-muted md:col-span-2">
                {job.period}
              </div>
              <div className="md:col-span-4 md:col-start-4">
                <h3 className="text-xl leading-tight text-fg">{job.role}</h3>
                <p className="mt-2 text-base text-fg">{job.company}</p>
              </div>
              <p className="leading-relaxed text-muted md:col-span-5 md:col-start-8">
                {job.description}
              </p>
            </div>
            {/* separator that draws in from the left when it enters view
                (skipped after the last entry) */}
            {i < experience.length - 1 && (
              <span className="exp-line absolute bottom-0 left-0 h-px w-full bg-border" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
