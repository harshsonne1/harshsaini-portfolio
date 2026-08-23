"use client";

// The control cohort as a funnel: thirty-seven at the mouth, one at the spout.
//
// Four bands, each one narrower than the last, so the collapse is the shape
// rather than something you work out from the numbers. What left is set beside
// the band it left from — seventeen skipped straight past the scan, and nobody
// failed at the end of it. That second callout is the one that mattered: a
// funnel that loses everyone without a single failure is not broken, it is
// being walked away from, and those need different fixes.
//
// Geometry is static, so this is written as SVG rather than built at runtime.
// The bands are plain polygons stroked in their own fill with a round join,
// which rounds the corners of a trapezoid for far less arithmetic than four
// arcs a corner. The stroke has to take the same gradient, not a flat shade of
// it, or the join paints a rim inside every band. Colour is CSS, so the whole figure inverts with the theme.
//
// The reveal is CSS too: the stylesheet holds the finished funnel, the effect
// rewinds it while the figure is off screen, and an observer lets it play once.
// No JS, or reduced motion, and the finished state is what renders.

import { useEffect, useRef } from "react";

const W = 1200;
const H = 960;

const CX = 540; // funnel axis, left of centre to leave the callouts room
const TOP_Y = 40;
const BOT_Y = 920;
const W_TOP = 780;
const W_BOT = 260;

const BAND_H = 208;
const BAND_GAP = 16;

/* number, label, and what left at this step */
const BANDS: {
  count: string;
  label: string;
  leak?: string;
}[] = [
  { count: "37", label: "users in the test" },
  { count: "20", label: "clicked Scan", leak: "17 skipped" },
  { count: "1", label: "entered a URL" },
  { count: "1", label: "completed the scan", leak: "0 failed" },
];

/* the envelope: how wide the funnel is at any height */
const widthAt = (y: number) =>
  W_TOP - (W_TOP - W_BOT) * ((y - TOP_Y) / (BOT_Y - TOP_Y));

const bandTop = (i: number) => TOP_Y + i * (BAND_H + BAND_GAP);

/* Stroked in its own fill to round the corners, so the polygon is pulled in by
   half the stroke to keep the painted size honest. */
const JOIN = 18;

const bandPath = (i: number) => {
  const y0 = bandTop(i) + JOIN / 2;
  const y1 = bandTop(i) + BAND_H - JOIN / 2;
  const half0 = widthAt(y0) / 2 - JOIN / 2;
  const half1 = widthAt(y1) / 2 - JOIN / 2;
  return `M ${CX - half0} ${y0} L ${CX + half0} ${y0} L ${CX + half1} ${y1} L ${CX - half1} ${y1} Z`;
};

const midY = (i: number) => bandTop(i) + BAND_H / 2;
const rightEdge = (i: number) => CX + widthAt(midY(i)) / 2;

export function ScanFunnel() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // rewound while the figure is still below the fold
    svg.classList.add("is-armed");

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        svg.classList.add("is-in");
      },
      { threshold: 0.2 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className="fun"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A funnel of the control cohort. 37 users in the test. 20 clicked Scan, so 17 skipped it. 1 entered a URL. 1 completed the scan, and 0 failed."
    >
      <defs>
        {BANDS.map((_, i) => (
          <linearGradient
            key={i}
            id={`fun-g${i}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor={`var(--fun-${i}a)`} />
            <stop offset="1" stopColor={`var(--fun-${i}b)`} />
          </linearGradient>
        ))}
      </defs>

      {BANDS.map((band, i) => {
        const y = midY(i);
        return (
          <g key={band.label}>
            <g
              className="fun-band"
              style={{ "--i": i } as React.CSSProperties}
            >
              <path
                d={bandPath(i)}
                fill={`url(#fun-g${i})`}
                // the same paint as the fill, or the round join shows as a rim
                stroke={`url(#fun-g${i})`}
                strokeWidth={JOIN}
                strokeLinejoin="round"
              />
              <text className="fun-num" x={CX} y={y - 4}>
                {band.count}
              </text>
              <text className="fun-lab" x={CX} y={y + 40}>
                {band.label}
              </text>
            </g>

            {/* what left, set beside the band it left from */}
            {band.leak && (
              <g
                className="fun-leak"
                style={{ "--i": BANDS.length + i * 0.5 } as React.CSSProperties}
              >
                <line
                  className="fun-dash"
                  x1={rightEdge(i) + 24}
                  y1={y}
                  x2={rightEdge(i) + 88}
                  y2={y}
                />
                <circle
                  className="fun-pip"
                  cx={rightEdge(i) + 96}
                  cy={y}
                  r="4.5"
                />
                <text className="fun-note" x={rightEdge(i) + 114} y={y + 7}>
                  {band.leak}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
