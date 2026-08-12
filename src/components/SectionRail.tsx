"use client";

// SectionRail — the fixed tick rail down the right edge of a case study, one
// tick per story section. The tick for the section you're reading widens and
// goes full contrast; the rest sit at 55%. Clicking a tick scrolls to it.
// No hover state by design: the rail answers where you are on the page, not
// where the pointer is. The heading only exists as the button's aria-label.
//
// Ids come from `storyRailItems` in CaseStudyStory, which is also what stamps
// them onto the sections — one list feeds both, so they can't drift apart.
//
// Hidden below lg: at that width the reading column already runs to the
// gutters and the rail would sit on top of the copy.

import { useCallback, useEffect, useState } from "react";

export type RailItem = {
  /** the section's dom id */
  id: string;
  /** the section heading — read out as the tick's accessible name */
  label: string;
  /** act header, when this section opens one */
  act?: string;
};

export default function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(0);
  // hidden over the header; the first scroll pass decides
  const [visible, setVisible] = useState(false);

  // scroll spy: the active section is the last one whose top has crossed the
  // read line at 40% viewport height. Cheaper and steadier than an observer
  // here — sections are taller than the viewport, so intersection ratios say
  // very little about which one is actually being read.
  useEffect(() => {
    if (items.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let next = 0;
      let firstTop = Infinity;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (i === 0) firstTop = top;
        if (top <= line) next = i;
      });
      // the back link runs past the last section — hold the last tick there
      // rather than letting it fall back to the one before
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      setActive(atEnd ? items.length - 1 : next);

      // The rail belongs to the story. It fades in once the title, meta row
      // and cover have gone by, and back out the moment the footer arrives —
      // there is nothing left to page through by then, and the rail would
      // otherwise sit on top of it.
      const footerTop =
        document.querySelector("footer")?.getBoundingClientRect().top ??
        Infinity;
      setVisible(
        firstTop <= window.innerHeight * 0.8 &&
          footerTop > window.innerHeight * 0.98,
      );
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
  }, [items]);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Case study sections"
      className={`cs-section-rail${visible ? " is-visible" : ""}`}
      // out of the tab order and off the a11y tree while it's parked over the
      // header, so it can't be tabbed into before it's on screen
      aria-hidden={visible ? undefined : true}
      inert={visible ? undefined : true}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          className="cs-rail-tick"
          // the act gives the heading its place in the story when it's read
          // out on its own, with nothing above it for context
          aria-label={item.act ? `${item.label} · ${item.act}` : item.label}
          aria-current={i === active ? "true" : undefined}
          // an act break gets extra air, so the rail reads as chapters
          data-act-start={item.act ? "" : undefined}
          onClick={() => goTo(item.id)}
        >
          <span className="cs-rail-mark" />
        </button>
      ))}
    </nav>
  );
}
