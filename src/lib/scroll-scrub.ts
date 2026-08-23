// One way to tie an animation to the scroll position, shared by every figure
// that does it.
//
// Everything here is scrubbed: progress is the scroll position, so halfway down
// a section is halfway through its animation and scrolling back up runs it
// backwards. Nothing autoplays and nothing loops.
//
// Pinning is left to CSS `position: sticky` rather than ScrollTrigger's `pin`.
// The case study already sticks its copy panel that way, and a pin-spacer
// injected inside one of those runs re-parents the column mid-scroll and the
// panel loses its place. ScrollTrigger is used only to read progress.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

const ready = () => {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
};

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type ScrubOptions = {
  /** where in the viewport the run starts, in ScrollTrigger's terms */
  start?: string;
  /** and where it ends */
  end?: string;
  /** a little easing on the scrub, so a flicked wheel does not judder */
  smooth?: number;
};

/**
 * Calls `onProgress` with 0..1 as `el` travels the viewport.
 *
 * Under reduced motion nothing is created: the callback is handed 1 once, so
 * the finished state is what renders. Returns a teardown.
 */
export function scrub(
  el: Element,
  onProgress: (p: number) => void,
  { start = "top bottom", end = "bottom top", smooth = 0.4 }: ScrubOptions = {},
) {
  if (reducedMotion()) {
    onProgress(1);
    return () => {};
  }
  ready();

  const trigger = ScrollTrigger.create({
    trigger: el,
    start,
    end,
    scrub: smooth,
    onUpdate: (self) => onProgress(self.progress),
    onRefresh: (self) => onProgress(self.progress),
  });

  return () => trigger.kill();
}

/**
 * A vertical offset tied to scroll — the whole of the parallax on this page.
 * `depth` is how far the element drifts against the scroll, in pixels, and it
 * never moves horizontally, so the grid holds.
 */
export function drift(el: HTMLElement, depth: number, opts?: ScrubOptions) {
  if (reducedMotion()) return () => {};
  ready();

  const set = gsap.quickSetter(el, "y", "px");
  return scrub(
    el,
    (p) => set((p - 0.5) * -2 * depth),
    { start: "top bottom", end: "bottom top", ...opts },
  );
}

/** Recompute every trigger — call after something changes the page's height. */
export function refreshScrub() {
  if (registered) ScrollTrigger.refresh();
}
