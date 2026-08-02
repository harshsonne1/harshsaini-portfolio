"use client";

// LineReveal — splits a paragraph into its rendered visual lines and slides
// each one up from behind a mask, staggered. Line breaks depend on wrapping, so
// they're measured off an invisible probe that copies the element's width and
// type metrics, then re-measured whenever the element resizes.
//
// The reveal itself piggybacks on the ScrollReveal group system: each line is a
// [data-reveal-item="line-up"], so it fires when the enclosing
// [data-reveal-group] scrolls into view.
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type LineRevealProps = {
  text: string;
  className?: string;
  /** ms before the first line moves, on top of --reveal-base */
  delay?: number;
  /** ms between consecutive lines */
  stagger?: number;
};

// group the words into rendered lines by comparing each word's offsetTop
function measureLines(el: HTMLElement, text: string): string[] {
  const width = el.clientWidth;
  if (!width) return [];

  const cs = getComputedStyle(el);
  const probe = document.createElement("div");
  Object.assign(probe.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "normal",
    width: `${width}px`,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    wordSpacing: cs.wordSpacing,
    textTransform: cs.textTransform,
  } satisfies Partial<CSSStyleDeclaration>);

  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    probe.appendChild(span);
    if (i < words.length - 1) probe.appendChild(document.createTextNode(" "));
  });

  document.body.appendChild(probe);
  const tops = Array.from(probe.querySelectorAll("span")).map(
    (s) => (s as HTMLElement).offsetTop,
  );
  probe.remove();

  const lines: string[] = [];
  let current: string[] = [];
  let currentTop: number | null = null;
  words.forEach((word, i) => {
    if (currentTop === null || Math.abs(tops[i] - currentTop) < 1) {
      current.push(word);
      currentTop ??= tops[i];
    } else {
      lines.push(current.join(" "));
      current = [word];
      currentTop = tops[i];
    }
  });
  if (current.length) lines.push(current.join(" "));
  return lines;
}

export default function LineReveal({
  text,
  className = "",
  delay = 0,
  stagger = 120,
}: LineRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setLines(measureLines(el, text));
  }, [text]);

  // re-split when the column width changes
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      setLines(measureLines(el, text));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  // before measuring (and without JS) the paragraph renders as plain text
  if (!lines?.length) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className} aria-label={text}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden="true" className="line-mask">
          <span
            data-reveal-item="line-up"
            style={
              {
                "--reveal-delay": `${delay + i * stagger}ms`,
              } as React.CSSProperties
            }
            className="block"
          >
            {line}
          </span>
        </span>
      ))}
    </p>
  );
}
