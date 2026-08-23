"use client";

// IterationsReel — a stack of photos built by scrolling, used twice in the
// iterations act: the whiteboards behind the thinking, and the boards that show
// what Brand DNA and Mood actually looked like.
//
// Each photo is a sticky card. Scrolling the act brings the next one over the
// last, and every card already laid down shrinks a little, so the stack fans
// open and you can still see the top edge of everything underneath. The card
// currently arriving is always the one at full size.
//
// Built on a scroll listener rather than ScrollTrigger: the pinned copy panel
// beside this and the section rail both track scroll the same way, and adding a
// plugin for one figure would be the only one on the page.
//
// The photos are not all the same shape, so a card takes its own ratio rather
// than a common box and nothing is cropped to fit. Two of them were shot with
// the board sideways; they are turned upright here, which also makes them
// landscape like the rest.
//
// Without JS, or under reduced motion, the cards still stack and fan, because
// that part is `position: sticky`. Only the scaling needs the listener.

import { useEffect, useRef } from "react";
import Image from "next/image";

const BASE = "/case-studies/brand-memory";

type Shot = { src: string; ratio: number; alt: string };
export type SetName = "exploration" | "mood";

/* In the order they were worked through: the extraction pass, the memory
   screen, the system sketch, the DNA/mood split, the retrieval question. */
const EXPLORATION: Shot[] = [
  {
    src: `${BASE}/exploration/06.webp`,
    ratio: 1200 / 555,
    alt: "Whiteboard: a website resolved into the attributes worth keeping — logo, colours, font, tagline, buttons, voice, accent.",
  },
  {
    src: `${BASE}/exploration/03.webp`,
    ratio: 1200 / 555,
    alt: "Whiteboard: the scan drawn as a pipeline, from the URL through to the memory it writes.",
  },
  {
    src: `${BASE}/exploration/04.webp`,
    ratio: 1024 / 590,
    alt: "Whiteboard: notes on the product page, the customer, time and traffic, with the memory screen sketched beside them.",
  },
  {
    src: `${BASE}/exploration/05.webp`,
    ratio: 1200 / 555,
    alt: "Whiteboard: the wider system, with Brand Memory sitting between the workflows that write it and the ones that read it.",
  },
  {
    src: `${BASE}/exploration/08.webp`,
    ratio: 1200 / 555,
    alt: "Whiteboard: screen by screen flow for the memory surface, in three colours of marker.",
  },
  {
    src: `${BASE}/exploration/09.webp`,
    ratio: 1024 / 590,
    alt: "Whiteboard: memory drawn as a core ringed by message, voice, visual playbook and the do's and don'ts, beside the question of what should actually be captured.",
  },
];

/* What stays true, then what is allowed to change — the beat's own order. The
   products and the reference language are Brand DNA; the moodboard and the
   lighting direction are one campaign's mood, and could be replaced next
   season without touching the brand. */
const MOOD: Shot[] = [
  {
    src: `${BASE}/mood/22.webp`,
    ratio: 1,
    alt: "Brand DNA: the product line shot front and back, the same graphics running across black, red and white tees.",
  },
  {
    src: `${BASE}/mood/21.webp`,
    ratio: 1,
    alt: "Brand DNA: the reference language — a void, a concrete interior, a landscape at golden hour, and the wordmark.",
  },
  {
    src: `${BASE}/mood/19.webp`,
    ratio: 1,
    alt: "Mood: a campaign moodboard, graphic streetwear against surreal minimal set pieces, with its palette named swatch by swatch.",
  },
  {
    src: `${BASE}/mood/20.webp`,
    ratio: 1,
    alt: "Mood: the lighting direction for that campaign — soft frontal studio light, hard top and side daylight, warm golden hour.",
  },
];

const SETS = { exploration: EXPLORATION, mood: MOOD };

/* How far into the run each card has finished shrinking, and how small it ends.
   The last card never shrinks — it is the one you are looking at when the run
   ends. */
const START = (i: number, n: number) => i / n;
const TARGET = (i: number, n: number) => Math.max(0.6, 1 - (n - i - 1) * 0.08);

export function IterationsReel({ set = "exploration" }: { set?: SetName }) {
  const shots = SETS[set];
  const runRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = runRef.current;
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(
      run.querySelectorAll<HTMLElement>("[data-imr-card]"),
    );
    if (cards.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const box = run.getBoundingClientRect();
      // 0 when the run's top reaches the top of the viewport, 1 when its
      // bottom does — the same span the cards are sticky across
      const travel = box.height - window.innerHeight;
      const progress =
        travel <= 0 ? 0 : Math.min(1, Math.max(0, -box.top / travel));

      cards.forEach((card, i) => {
        const start = START(i, cards.length);
        const local =
          progress <= start ? 0 : Math.min(1, (progress - start) / (1 - start));
        const scale = 1 + (TARGET(i, cards.length) - 1) * local;
        card.style.transform = `scale(${scale.toFixed(4)})`;
      });
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
      // hand the resting state back to CSS
      cards.forEach((card) => card.style.removeProperty("transform"));
    };
  }, []);

  return (
    <div className="imr" data-set={set} ref={runRef}>
      {shots.map((shot, i) => (
        <div key={shot.src} className="imr-slot">
          <div
            data-imr-card
            className="imr-card"
            style={
              {
                "--imr-ar": shot.ratio,
                // each card sits a little lower than the one it covers, so the
                // stack reads as a stack
                "--imr-step": `${i * 13}px`,
              } as React.CSSProperties
            }
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(max-width: 1023px) 92vw, 46vw"
              // cut and encoded at the size the card shows them
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  );
}
