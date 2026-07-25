"use client";

// LayoutSkeleton — a gaussian shimmer sweeps once across width-graduated
// vertical strokes (thin on the left, thick on the right), then the overlay
// fades out and unmounts. Ported from the SolidJS original to React + GSAP.

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type LayoutSkeletonProps = {
  columns?: number;
  minStroke?: number;
  maxStroke?: number;
  peak?: number;
  sigma?: number;
  duration?: number;
  pause?: number;
  color?: string;
  className?: string;
  onDone?: () => void;
};

export default function LayoutSkeleton({
  columns = 16,
  minStroke = 1,
  maxStroke = 14,
  peak = 0.55,
  sigma = 2.8,
  duration = 1.8,
  pause = 0.5,
  color = "#ffffff",
  className,
  onDone,
}: LayoutSkeletonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const strokes = Array.from(
      wrap.querySelectorAll<HTMLElement>(".sk-stroke"),
    );
    const state = { pos: 0 };

    // each frame: opacity follows a bell curve centered on the sweep position
    const tickerFn = () => {
      strokes.forEach((s, i) => {
        const dist = i - state.pos;
        s.style.opacity = String(
          peak * Math.exp(-(dist * dist) / (2 * sigma * sigma)),
        );
      });
    };
    gsap.ticker.add(tickerFn);

    state.pos = -sigma * 2;
    const sweepTween = gsap.to(state, {
      pos: columns - 1 + sigma * 2,
      duration,
      ease: "none",
      onComplete: () => {
        // one sweep done — fade the overlay out, then unmount + notify
        gsap.to(wrap, {
          opacity: 0,
          duration: 0.4,
          delay: pause,
          onComplete: () => {
            onDone?.();
            setDone(true);
          },
        });
      },
    });

    return () => {
      gsap.ticker.remove(tickerFn);
      sweepTween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      ref={wrapRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: columns }).map((_, i) => {
        const t = i / (columns - 1);
        const strokeW = minStroke + (maxStroke - minStroke) * (t * t);
        return (
          <div
            key={i}
            style={{ flex: 1, height: "100%", position: "relative" }}
          >
            <div
              className="sk-stroke"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: "100%",
                width: `${strokeW.toFixed(1)}px`,
                background: color,
                opacity: 0,
                borderRadius: "1px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
