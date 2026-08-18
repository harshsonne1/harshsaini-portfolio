// A short digital click, sounded at two moments in the work grid: reaching the
// Work section, and opening a case study from it.
//
// Reaching Work is once per visit. Hovering the section sounds it and disarms
// it, so moving the pointer around the tiles, or off them and back, stays
// silent. Scrolling the section out of the viewport re-arms it: coming back to
// Work is a fresh arrival and earns the click again, once.
//
// Opening a case study sounds every time. It marks a deliberate act rather than
// an arrival, so there is nothing to spend.
//
// On autoplay: hovering is not a user gesture, so a browser that has seen no
// interaction yet refuses to play. That refusal does not spend the visit's cue —
// it stays armed and a later hover takes it. A click is a gesture and is never
// refused, which is why the two triggers need different handling.

const SRC = "/work-enter.mp3";
/** the file is levelled to about -1 dBTP, so it plays as recorded */
const VOLUME = 1;
/** Hovering into Work and clicking a tile can happen in one motion. Far enough
    apart and both are heard, as they should be; on top of each other the same
    click stuttering over itself is worse than hearing it once. */
const MIN_GAP_MS = 350;

let audio: HTMLAudioElement | null = null;
let armed = true;
let lastPlayed = Number.NEGATIVE_INFINITY;

/** Fetch and decode ahead of the first hover, so the cue is not a wait. */
export function primeWorkSound() {
  if (typeof window === "undefined" || audio) return;
  audio = new Audio(SRC);
  audio.preload = "auto";
  audio.volume = VOLUME;
}

/** Sounds it. `onRefused` runs if the browser would not, so a caller that was
    spending its one cue can hand it back. */
function strike(onRefused?: () => void) {
  if (typeof window === "undefined") return;

  primeWorkSound();
  if (!audio) {
    onRefused?.();
    return;
  }

  const now = performance.now();
  if (now - lastPlayed < MIN_GAP_MS) return;
  lastPlayed = now;

  // rewind, so it is heard from the top rather than mid-click
  audio.currentTime = 0;
  void audio.play().catch(() => onRefused?.());
}

/** The pointer has reached the Work section — once per visit to it. */
export function cueWorkSound() {
  if (!armed) return;
  armed = false;
  strike(() => {
    armed = true;
  });
}

/** A case study has been opened from the grid. Sounds every time. */
export function cueCaseStudyOpen() {
  strike();
}

/** The Work section has left the viewport; returning to it should sound again. */
export function rearmWorkSound() {
  armed = true;
}
