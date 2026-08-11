"use client";

// CoverVideo — a looping cover that sits on top of a still poster.
//
// Two triggers:
//   "hover"  — plays while the pointer is on the card (the work grid)
//   "inview" — plays whenever it is on screen (the case study cover)
//
// A device with no pointer falls back to "inview": there is no hover to wait
// for, and a cover that never moves on a phone just reads as a broken still.
// Either way playback stops once the element leaves the viewport, and
// reduced-motion never starts it — the poster is the whole experience there.

import { useEffect, useRef } from "react";

type CoverVideoProps = {
  src: string;
  /** still frame under the video: shown until it plays, and instead of it
      whenever it doesn't */
  poster?: string;
  trigger?: "hover" | "inview";
  /** ancestor whose hover drives playback; defaults to the direct parent */
  hoverSelector?: string;
  className?: string;
};

export function CoverVideo({
  src,
  poster,
  trigger = "inview",
  hoverSelector,
  className = "absolute inset-0 h-full w-full object-cover",
}: CoverVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mode =
      trigger === "hover" && window.matchMedia("(hover: hover)").matches
        ? "hover"
        : "inview";

    let onScreen = false;
    let hovering = false;
    const sync = () => {
      if (onScreen && (mode === "inview" || hovering)) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // a little lead-in, so it is already running by the time it is read
      { rootMargin: "200px" },
    );
    io.observe(video);

    const host = hoverSelector
      ? video.closest(hoverSelector)
      : video.parentElement;
    const enter = () => {
      hovering = true;
      sync();
    };
    const leave = () => {
      hovering = false;
      sync();
    };
    if (mode === "hover" && host) {
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointerleave", leave);
    }

    return () => {
      io.disconnect();
      host?.removeEventListener("pointerenter", enter);
      host?.removeEventListener("pointerleave", leave);
    };
  }, [trigger, hoverSelector]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
    />
  );
}
