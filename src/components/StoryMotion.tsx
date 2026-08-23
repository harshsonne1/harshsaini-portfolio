"use client";

// StoryMotion — the drift that runs the length of a case study.
//
// A figure that scrolls past travels a little slower than the copy beside it,
// so a beat reads as one layout being rearranged rather than a column of cards
// arriving. It is only ever vertical, only ever a few pixels, and only above lg.
//
// Two kinds of figure are left alone.
//
// A figure inside a sticky column is not travelling at all — the split runs pin
// their figure column against the pinned copy panel, and both hold still while
// the section goes by. Offsetting one of those against the scroll does not read
// as parallax; it reads as the image creeping inside its own frame. So anything
// with a sticky ancestor is skipped, which leaves the full-width figures in the
// stacked sections, and those genuinely do travel.
//
// And a figure that already answers to the scroll itself: the stacked reels,
// the context graph, the funnel, the composer and the reorder each own their
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

    /* Walks up to the story root looking for anything the browser is pinning.
       Checked against the computed style rather than the class, so a column
       that is only sticky above lg is read correctly at the width in use. */
    const pinned = (el: HTMLElement) => {
      for (
        let node: HTMLElement | null = el.parentElement;
        node && !node.hasAttribute("data-story");
        node = node.parentElement
      ) {
        const position = getComputedStyle(node).position;
        if (position === "sticky" || position === "fixed") return true;
      }
      return false;
    };

    const figures = Array.from(
      document.querySelectorAll<HTMLElement>("[data-story] figure"),
    ).filter(
      (el) =>
        !el.matches(OWN_MOTION) &&
        !el.querySelector(OWN_MOTION) &&
        !pinned(el),
    );

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
