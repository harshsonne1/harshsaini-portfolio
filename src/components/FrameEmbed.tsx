"use client";

// A standalone HTML experiment running inside a bento tile.
//
// Some experiments are whole documents rather than components — their own
// reset, their own font, their own layout. A frame is the honest container
// for those: it isolates them completely and keeps them genuinely live.
//
// The page inside lays out at `designWidth` and is then scaled to the tile,
// so a document written for a browser window stays legible in a card. The
// frame's height is set to the tile height *in design pixels*, which means the
// page sees a viewport of exactly the tile's shape — no letterboxing, and its
// own responsive rules still apply.
//
// Documents that scale themselves (the kanban board sizes its own stage to the
// window) don't need this — give those a plain iframe and let them fit.

import { useEffect, useRef } from "react";

type FrameEmbedProps = {
  src: string;
  title: string;
  /** width the document is laid out at, before scaling into the tile */
  designWidth?: number;
};

export function FrameEmbed({ src, title, designWidth = 820 }: FrameEmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    if (!host || !frame) return;

    const fit = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const scale = width / designWidth;
      frame.style.width = `${designWidth}px`;
      frame.style.height = `${height / scale}px`;
      frame.style.transform = `scale(${scale})`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, [designWidth]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <iframe
        ref={frameRef}
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts"
        scrolling="no"
        className="block origin-top-left border-0"
      />
    </div>
  );
}
