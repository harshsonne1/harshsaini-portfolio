"use client";

// The change of order, made by actually reordering it.
//
// The beat's argument is that nothing was added or taken away — the same steps
// were put in a different sequence. So the figure holds one set of cards and
// moves them: Generate rises from third to first, Brand Memory drops from
// second to third, the sign-up step falls away, and the sentence that earns the
// whole thing arrives between them. A crossfade between two diagrams would
// have shown two diagrams. This shows one being rearranged.
//
// The stage is sticky at the centre of the viewport inside a run several
// screens tall, so it holds while the sequence changes underneath the reader
// and releases when it is done. Everything is scrubbed: the reorder is at the
// scroll position, and scrolling back up puts the old order back.
//
// Pinning is CSS `position: sticky`, not ScrollTrigger's pin — the case study
// pins its copy panel the same way, and a pin-spacer inside that run would
// re-parent this column mid-scroll.

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { scrub, reducedMotion } from "@/lib/scroll-scrub";

/* one row of the sequence, in px */
const ROW = 96;
const SLOTS = 4;

type Card = {
  id: string;
  label: string;
  /* where it sits before, and where it ends up. null on either side means it is
     not part of that order. */
  before: number | null;
  after: number | null;
  /* the one that is not a step but a reason */
  quote?: boolean;
};

const CARDS: Card[] = [
  { id: "signup", label: "Sign up", before: 0, after: null },
  { id: "memory", label: "Brand Memory", before: 1, after: 2 },
  { id: "generate", label: "Generate", before: 2, after: 0 },
  {
    id: "notice",
    label: "This doesn't feel like my brand.",
    before: null,
    after: 1,
    quote: true,
  },
  { id: "again", label: "Generate again", before: null, after: 3 },
];

/* Where the travel goes. The turn is three moves, not one: the step that is
   dropped leaves first, then what remains slides into its new place, and only
   then do the new steps drop in. Overlapped, they all pass through the same
   slots at once and the cards land on top of each other. */
const BUILD = [0, 0.26] as const;
const LEAVE = [0.36, 0.46] as const;
const MOVE = [0.44, 0.66] as const;
const ARRIVE = [0.64, 0.8] as const;

const ease = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const across = (p: number, [from, to]: readonly [number, number]) =>
  clamp01((p - from) / (to - from));

/* the slot a card starts painted in */
const home = (card: Card) => (card.before ?? card.after ?? 0) * ROW;

export function FlowReorder() {
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = runRef.current;
    const stage = stageRef.current;
    if (!run || !stage) return;

    const cards = CARDS.map((card) => {
      const el = stage.querySelector<HTMLElement>(`[data-card="${card.id}"]`);
      return el
        ? {
            card,
            y: gsap.quickSetter(el, "y", "px"),
            o: gsap.quickSetter(el, "opacity") as (v: number) => void,
            s: gsap.quickSetter(el, "scale") as (v: number) => void,
          }
        : null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    const labels = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-state]"),
    ).map((el) => ({
      el,
      after: el.dataset.state === "after",
      o: gsap.quickSetter(el, "opacity") as (v: number) => void,
    }));

    const at = (p: number) => {
      const built = ease(across(p, BUILD));
      const left = ease(across(p, LEAVE));
      const moved = ease(across(p, MOVE));
      const arrived = ease(across(p, ARRIVE));

      cards.forEach(({ card, y, o, s }) => {
        const inBefore = card.before !== null;
        const inAfter = card.after !== null;

        // what stays, moves
        y(inBefore && inAfter ? (card.after! - card.before!) * ROW * moved : 0);

        let alpha: number;
        if (inBefore && inAfter) alpha = built;
        else if (inBefore) alpha = built * (1 - left);
        else alpha = arrived;

        o(alpha);
        // the faintest settle, so a card lands rather than snapping
        s(0.985 + 0.015 * alpha);
      });

      /* Handed over rather than crossfaded: two lines of copy at half opacity
         in the same place is two lines of copy nobody can read. */
      const swap = Math.min(1, moved * 2);
      const back = Math.max(0, moved * 2 - 1);
      labels.forEach(({ after, o }) => o(after ? back : 1 - swap));
    };

    if (reducedMotion()) {
      // the finished order, with nothing in transit
      at(1);
      return;
    }

    at(0);
    return scrub(run, at, { start: "top top", end: "bottom bottom" });
  }, []);

  return (
    <div className="flr" ref={runRef}>
      <div className="flr-stage">
        {/* the mat sits here rather than around the whole run: this is the
            only box the size of what is on screen */}
        <div
          className="flr-inner overlay-secondary-white rounded-lg p-4 sm:p-6"
          ref={stageRef}
        >
          {/* which order is on screen */}
          <div className="flr-head">
            <span className="flr-state" data-state="before">
              BEFORE
            </span>
            <span className="flr-state" data-state="after">
              AFTER
            </span>
          </div>

          <div className="flr-rows" style={{ height: SLOTS * ROW }}>
            {CARDS.map((card) => (
              <div
                key={card.id}
                data-card={card.id}
                className={`flr-card${card.quote ? " is-quote" : ""}`}
                style={{ top: home(card) }}
              >
                {card.label}
              </div>
            ))}
          </div>

          {/* the supporting line, which changes with the order */}
          <div className="flr-foot">
            <p className="flr-note" data-state="before">
              Memory asked for before there was anything to remember about.
            </p>
            <p className="flr-note" data-state="after">
              Memory offered at the moment it can explain itself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
