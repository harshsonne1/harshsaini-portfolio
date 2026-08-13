"use client";

// One cell of the experiments gallery: a clipped, rounded viewport that renders
// a live React component rather than a screenshot of one.
//
// Division of responsibility — the card owns clipping, muting, hover glow, lift
// and transition; the experiment owns its own interaction. The card's hover
// rules stop at .exp-stage (see globals.css), so nothing cascades into the
// experiment except the shared brightness filter, which is the muting itself.
//
// Hover is pure CSS — :hover on the card, :has() on the gallery for dimming the
// others — so moving the pointer across the wall never touches React state.
//
// Mounting is deferred until the card is near the viewport, so a wall of live
// components doesn't start every animation loop during page load.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExperimentViewer } from "./ExperimentViewer";

type ExperimentCardProps = {
  title: string;
  description: string;
  /** rendered live inside the card, never rasterised */
  component: ReactNode;
  /** The aspect ratio of what's inside — width ÷ height of the actual asset.
      It sets the tile's shape AND its share of the row, so the media fills the
      tile exactly and never has to be cropped to fit. */
  aspect: number;
  /** extra classes; placement comes from `aspect`, not from spans */
  className?: string;
  /** stage type scale. cqi units make text experiments size to the card. */
  fontSize?: string;
  /** standalone document to open full size when the tile is clicked. Tiles
      without one stay exactly as they were: live, inline, not clickable. */
  href?: string;
};

export function ExperimentCard({
  title,
  description,
  component,
  aspect,
  className = "",
  fontSize = "clamp(0.85rem, 7cqi, 2.75rem)",
  href,
}: ExperimentCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setLive(true); /* no IO: just mount */
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setLive(true);
        io.disconnect(); /* one-shot — a mounted experiment stays mounted */
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`exp-card ${className}`}
      style={{ "--exp-aspect": aspect } as React.CSSProperties}
    >
      {/* `is-in` arms any [data-reveal-item] the experiment uses: the page-wide
          ScrollReveal observer collected its targets long before this card
          mounted, so a lazily mounted reveal would otherwise never fire */}
      <div
        data-reveal-group
        style={{ fontSize }}
        className={`exp-stage ${live ? "is-in" : ""}`}
      >
        {live ? component : null}
      </div>

      {/* A plain tile draws nothing on hover — it is the whole statement, and
          its title is there only for anyone reading the page aloud. An
          openable one names itself, since a tile you can click should say
          what it opens. */}
      {href ? (
        <>
          <h3 className="exp-title">{title}</h3>
          <p className="sr-only">{description}</p>
        </>
      ) : (
        <div className="sr-only">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      )}

      {/* an openable tile says so with a corner arrow, since there is no
          caption left to explain it */}
      {href && (
        <span aria-hidden="true" className="exp-open">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path d="M17 7l-10 10" />
            <path d="M8 7l9 0l0 9" />
          </svg>
        </span>
      )}

      {/* the whole tile is the hit area — sits above the stage so the click
          lands on the card rather than being swallowed by the preview */}
      {href && (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-current"
          >
            <span className="sr-only">Open {title}</span>
          </button>
          {open && (
            <ExperimentViewer
              src={href}
              title={title}
              onClose={() => setOpen(false)}
            />
          )}
        </>
      )}
    </article>
  );
}
