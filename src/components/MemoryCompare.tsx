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
// It is scrubbed to the scroll rather than run on a clock: the first prompt
// types as the figure comes up, is thrown away and retyped as the second, and
// the switch goes on as it settles. Halfway down is halfway through, and
// scrolling back up untypes it.
//
// The finished state — second prompt typed, switch on — is what renders without
// JS and under reduced motion.

import { useEffect, useRef, useState } from "react";

import { scrub } from "@/lib/scroll-scrub";
import Image from "next/image";

const BASE = "/case-studies/brand-memory";

/* What a brand keeps re-typing. The repeats are the argument: cream, the soft
   daylight, the print, premium not sporty, restated in both. */
const PROMPTS = [
  "hero shot on a cream backdrop, soft daylight, lots of negative space, keep the blue porcelain print sharp, premium not sporty",
  "same pair worn while walking, cream and sand tones, soft daylight again, don't crop the print, premium not sporty",
];

/* The figure's travel, divided: type the first prompt, hold it long enough to
   read, throw it away, type the second, hold, and switch memory on for the rest
   of the way. */
const BEATS: [number, number][] = [
  [0.0, 0.3], // typing the first
  [0.3, 0.44], // holding it
  [0.44, 0.55], // erasing it
  [0.55, 0.8], // typing the second
];
const SWITCH_AT = 0.9;

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

    const cut = (text: string, t: number) =>
      text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, t))));

    /* how far into a beat the scroll has come, 0 before it and 1 after */
    const through = (p: number, i: number) => {
      const [from, to] = BEATS[i];
      return Math.min(1, Math.max(0, (p - from) / (to - from)));
    };

    const at = (p: number) => {
      if (p >= BEATS[3][0]) setTyped(cut(PROMPTS[1], through(p, 3)));
      else if (p >= BEATS[2][0]) setTyped(cut(PROMPTS[0], 1 - through(p, 2)));
      else if (p >= BEATS[1][0]) setTyped(PROMPTS[0]);
      else setTyped(cut(PROMPTS[0], through(p, 0)));
      // and now it never has to be typed again
      setMemoryOn(p >= SWITCH_AT);
    };

    at(0);
    return scrub(host, at, { start: "top 82%", end: "bottom 40%" });
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
