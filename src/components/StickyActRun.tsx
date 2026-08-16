"use client";

// StickyActRun — one pinned text panel for a run of sections.
//
// The previous split pinned each section's copy inside its own section, so the
// text travelled to the section boundary and scrolled away before the next one
// arrived. Here the panel is pinned across the whole run: it holds its place
// while the figures scroll past on the right, and its contents swap as you
// cross into the next section. The act label carries down from the last
// section that declared one, so "I. THE PORT" stays put through every section
// belonging to that act.
//
// Below lg there is nothing to pin against: each section renders its copy
// directly above its own figures, and the panel is hidden.

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ActRunSection = {
  id: string;
  /* the act this section belongs to, carried down from the last one to set it */
  act?: string;
  heading: string;
  copy: ReactNode;
  figures: ReactNode;
  /* extra pad so a short figure column still gives the panel room to sit */
  className?: string;
};

export function StickyActRun({ sections }: { sections: ActRunSection[] }) {
  const [active, setActive] = useState(0);
  const runRef = useRef<HTMLDivElement>(null);

  // Which section is being read: the last one whose top has crossed the read
  // line at 45% viewport height. Same approach as the section rail — figure
  // columns are taller than the viewport, so intersection ratios say little.
  useEffect(() => {
    if (sections.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;
      let next = 0;
      sections.forEach((section, i) => {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) next = i;
      });
      setActive(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <div
      ref={runRef}
      className="mx-auto w-full section-gutter lg:grid lg:grid-cols-12 lg:gap-x-8"
    >
      {/* the pinned panel: every section's copy stacked in one grid cell, so
          the panel is as tall as the longest and only opacity changes */}
      <div className="hidden lg:sticky lg:top-24 lg:col-span-6 lg:col-start-1 lg:grid lg:self-start">
        {sections.map((section, i) => (
          <div
            key={section.id}
            aria-hidden={i === active ? undefined : true}
            className={`col-start-1 row-start-1 transition-opacity duration-500 ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {section.act && (
              <div className="pb-4 text-sm font-medium uppercase tracking-[-0.02em] text-muted">
                {section.act}
              </div>
            )}
            <h2 className="text-[2.25rem] leading-tight text-fg">
              {section.heading}
            </h2>
            <div className="mt-6 flex flex-col gap-y-6">{section.copy}</div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={`scroll-mt-24 ${section.className ?? ""}`}
          >
            {/* below lg the copy travels with its own figures */}
            <div className="lg:hidden">
              {section.act && (
                <div className="pb-4 text-sm font-medium uppercase tracking-[-0.02em] text-muted">
                  {section.act}
                </div>
              )}
              <h2 className="text-[2.25rem] leading-tight text-fg">
                {section.heading}
              </h2>
              <div className="mt-6 flex flex-col gap-y-6">{section.copy}</div>
            </div>
            {/* on the same rhythm as a full-width figure run, so a figure sits
                the same distance from its copy wherever it is set */}
            <div className="mt-10 lg:mt-0">{section.figures}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
