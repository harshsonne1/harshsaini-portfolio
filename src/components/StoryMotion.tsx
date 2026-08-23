"use client";

// StoryMotion — the drift that runs the length of a case study.
//
// Figures travel a little slower than the copy beside them, so a beat reads as
// one layout being rearranged rather than a column of cards arriving. It is
// only ever vertical, only ever a few pixels, and only above lg, where the
// pinned copy panel exists for it to be read against. Below that the copy sits
// directly above its own figures and there is nothing to drift against.
//
// Figures that already answer to the scroll themselves are left alone: the
// stacked reels, the context graph, the funnel and the composer each own their
// motion, and a second offset on top would fight it.
//
// Everything is scrubbed. Nothing here plays on its own.

import { useEffect } from "react";

import { drift, refreshScrub, reducedMotion } from "@/lib/scroll-scrub";

/* figures with their own scroll behaviour, left as they are */
const OWN_MOTION = ".imr, .cgr, .fun, .bmc, .flr";

/* how far a figure drifts against the scroll. Small: the grid has to hold. */
const DEPTH = 22;

export default function StoryMotion() {
  useEffect(() => {
    if (reducedMotion()) return;
    // the drift is read against the pinned panel, which only exists above lg
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const figures = Array.from(
      document.querySelectorAll<HTMLElement>("[data-story] figure"),
    ).filter((el) => !el.matches(OWN_MOTION) && !el.querySelector(OWN_MOTION));

    const stops = figures.map((el, i) =>
      // alternating depth, so consecutive figures are not in lockstep
      drift(el, i % 2 === 0 ? DEPTH : DEPTH * 0.6),
    );

    // media finishing its load changes the page's height under the triggers
    const settle = window.setTimeout(refreshScrub, 400);

    return () => {
      window.clearTimeout(settle);
      stops.forEach((stop) => stop());
    };
  }, []);

  return null;
}
