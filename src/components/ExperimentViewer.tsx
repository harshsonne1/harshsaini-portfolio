"use client";

// Full-size viewer for an experiment that is a standalone document — or, when
// the source is a video file, for the piece itself.
//
// The tile shows a scaled-down preview; this opens the real thing at real
// size, with nothing scaled and nothing sandboxed, so every behaviour it has
// works exactly as it does on its own: sliders, drag-and-drop, the file
// picker, the render loop. It is first-party content out of /public, so the
// sandbox that guards the preview would only break the file picker here.
//
// A video opens as a video rather than in a frame: no player chrome at all,
// just the piece running full size on the backdrop. Muted for the same reason
// it has no controls — with nothing to press, playback can never be left
// blocked by an autoplay policy, and there is no way to unmute it either.
//
// Portalled to <body> on purpose: .exp-card carries a filter (and a transform
// on hover), either of which makes it a containing block for fixed-position
// descendants — a viewer rendered inside the card would be trapped in the
// card's box instead of covering the page.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ExperimentViewerProps = {
  src: string;
  title: string;
  onClose: () => void;
};

export function ExperimentViewer({
  src,
  title,
  onClose,
}: ExperimentViewerProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isVideo = /\.(webm|mp4|mov)(\?.*)?$/i.test(src);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // the page behind must not scroll under the viewer
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Escape typed while focus is inside the frame never reaches this document,
  // so the same handler is attached in there too. Same-origin and unsandboxed,
  // hence reachable; guarded anyway so a failure can't break the viewer.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let inner: Document | null = null;
    const onKey = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape") onClose();
    };
    const attach = () => {
      try {
        inner = frame.contentDocument;
        inner?.addEventListener("keydown", onKey);
      } catch {
        /* cross-origin — the close button and backdrop still work */
      }
    };
    frame.addEventListener("load", attach);
    attach();
    return () => {
      frame.removeEventListener("load", attach);
      try {
        inner?.removeEventListener("keydown", onKey);
      } catch {
        /* frame already torn down */
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex flex-col bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bg"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3">
          <h2 className="text-sm text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded p-1.5 text-muted transition-colors hover:text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-current"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            >
              <path
                d="M2.5 2.5l9 9M11.5 2.5l-9 9"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
        {isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            // min-h-0: without it a replaced element keeps its intrinsic
            // height as a floor and grows straight out of the flex column
            className="w-full min-h-0 flex-1 bg-black object-contain"
          />
        ) : (
          /* no sandbox, no scrolling override — it behaves as it does standalone */
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            className="w-full flex-1 border-0"
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
