"use client";

// The same brief, run with brand memory off and on.
//
// The composer types two prompts before switching memory on, because that is
// the problem in one gesture: an operator uploading a shoe writes the cream
// palette, the daylight, the print and the "premium not sporty" every single
// time. The second prompt says "again" out loud. Then the switch goes on, and
// the point is that none of it has to be said next time.
//
// Under it, what the brief returned with memory off and with it on.
//
// The finished state — second prompt typed, switch on — is what renders without
// JS and under reduced motion. The effect rewinds to the start while the figure
// is still off screen, so nothing is seen out of order.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const BASE = "/case-studies/brand-memory";

/* What a brand keeps re-typing. The repeats are the argument: cream, the soft
   daylight, the print, premium not sporty, restated in both. */
const PROMPTS = [
  "hero shot on a cream backdrop, soft daylight, lots of negative space, keep the blue porcelain print sharp, premium not sporty",
  "same pair worn while walking, cream and sand tones, soft daylight again, don't crop the print, premium not sporty",
];

const TYPE_MS = 14;
const ERASE_MS = 6;
/* long enough to read the prompt before it is thrown away and retyped */
const HOLD_MS = 1100;

const SHOTS = [
  {
    label: "Without Memory",
    src: `${BASE}/compare-without-memory.webp`,
    alt: "The same brief with memory off: a plain product cut-out on white, with none of the brand's styling.",
  },
  {
    label: "With Memory",
    src: `${BASE}/compare-with-memory.webp`,
    alt: "The same brief with memory on: the shoe worn in a cream-palette scene with the negative space the prompt asked for.",
  },
];

export function MemoryCompare() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(PROMPTS[PROMPTS.length - 1]);
  const [memoryOn, setMemoryOn] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    // rewound while the figure is still below the fold
    setTyped("");
    setMemoryOn(false);

    const type = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        setTyped(text.slice(0, i));
        await wait(TYPE_MS);
      }
    };

    const erase = async (text: string) => {
      for (let i = text.length; i >= 0; i--) {
        if (cancelled) return;
        setTyped(text.slice(0, i));
        await wait(ERASE_MS);
      }
    };

    const run = async () => {
      await type(PROMPTS[0]);
      await wait(HOLD_MS);
      await erase(PROMPTS[0]);
      await type(PROMPTS[1]);
      await wait(HOLD_MS);
      if (cancelled) return;
      // and now it never has to be typed again
      setMemoryOn(true);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void run();
      },
      { threshold: 0.3 },
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="bmc" ref={hostRef}>
      {/* the prompt as an operator types it, and the switch under it */}
      <div className="bmc-composer">
        <p className="bmc-prompt">
          {typed}
          <span className="bmc-caret" aria-hidden="true" />
        </p>

        <div className="bmc-row">
          <div className="bmc-tools">
            <span className="bmc-round bmc-add" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </span>

            <span
              className={`bmc-switch${memoryOn ? " is-on" : ""}`}
              role="img"
              aria-label={`Brand memory ${memoryOn ? "on" : "off"}`}
            >
              <span className="bmc-track" aria-hidden="true">
                <span className="bmc-knob" />
              </span>
              <span className="bmc-switch-label">Brand memory</span>
            </span>
          </div>

          <span className="bmc-round bmc-send" aria-hidden="true">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </span>
        </div>
      </div>

      {/* what came back, one panel each */}
      <div className="bmc-pair">
        {SHOTS.map((shot) => (
          <div key={shot.label} className="bmc-panel">
            <p className="bmc-label">{shot.label}</p>
            <div className="bmc-shot">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 900px) 92vw, 42vw"
                // cut and encoded at the size the panel shows them
                unoptimized
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
