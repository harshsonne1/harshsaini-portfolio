"use client";

// A faint horizontal line that sweeps up the viewport, pauses, then repeats.
// Dark-mode only: the wrapper carries `hll` and globals.css hides it whenever
// <html data-theme="light">, so it never shows over the light background.

import { useEffect, useRef } from "react";

const TRAVEL_MS = 1000;
const GAP_MS = 5000;

type HorizontalLineLoaderProps = {
  color?: string;
  thickness?: number;
  travelMs?: number;
  gapMs?: number;
};

export default function HorizontalLineLoader({
  color = "rgba(255,255,255,0.35)",
  thickness = 0.25,
  travelMs = TRAVEL_MS,
  gapMs = GAP_MS,
}: HorizontalLineLoaderProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    function animate() {
      if (!line) return;
      const parent = line.parentElement;
      const h = parent ? parent.offsetHeight : window.innerHeight;

      line.style.transition = "none";
      line.style.bottom = "0px";
      line.style.opacity = "1";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          line.style.transition = `bottom ${travelMs}ms linear, opacity 200ms linear ${travelMs - 200}ms`;
          line.style.bottom = `${h}px`;
          line.style.opacity = "0";
        });
      });

      timerRef.current = setTimeout(animate, travelMs + gapMs);
    }

    animate();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [travelMs, gapMs]);

  return (
    <div
      className="hll"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <div
        ref={lineRef}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: thickness,
          background: color,
          bottom: 0,
          opacity: 1,
        }}
      />
    </div>
  );
}
