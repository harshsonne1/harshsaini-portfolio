"use client";

// MagneticCursor — a label box that follows the pointer and scales in while
// hovering elements matching `triggerSelector`.
//
// The panel is frosted glass: a translucent dark ground with the tile behind
// it blurred, and the brackets and label painted over it on their own layer so
// the filter never touches the type.
//
// It cannot also be blended. An element with mix-blend-mode is a backdrop root
// — the same list as filter, opacity below 1 and mask — so a backdrop-filter
// inside one can only sample within it, and inside the panel layer there is
// nothing behind the box. The blur read an empty backdrop and painted nothing,
// which is why the card was only ever its brackets and its type. Exclusion
// against a near-black panel was invisible in its own right (about 5% off its
// own backdrop), so the frost is the half worth keeping.
//
// Two layers all the same: the filter belongs to the panel, and the type has
// to stay out of it. Both are moved, clipped and scaled as one.

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import DecryptedText from "./DecryptedText";

// same glitch alphabet as the hero wordmark, plus lowercase for mixed-case labels
const GLITCH_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

type MagneticCursorProps = {
  /** fallback label; a trigger can override it with `data-cursor="…"` */
  label?: string;
  /** box size in px */
  size?: number;
  /** label type size in px */
  fontSize?: number;
  /** CSS selector for hover targets */
  triggerSelector?: string;
  /** panel colour — this is the layer that blends with the page. Carries an
      alpha, or the backdrop blur below has nothing to show through it. */
  background?: string;
  /** brackets and label, painted over the panel unblended */
  ink?: string;
  /** px of blur applied to whatever the panel is over */
  blur?: number;
};

export default function MagneticCursor({
  label = "View case",
  size = 150,
  fontSize = 20,
  triggerSelector = "[data-cursor]",
  background = "rgba(12, 12, 14, 0.42)",
  ink = "#ffffff",
  blur = 22,
}: MagneticCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  /* the panel, tracking the same pointer one layer below the type */
  const groundRef = useRef<HTMLDivElement>(null);
  const groundBoxRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [text, setText] = useState(label);
  // bumped on every enter so the label re-scrambles each time the cursor appears
  const [glitchKey, setGlitchKey] = useState(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const box = boxRef.current;
    const ground = groundRef.current;
    const groundBox = groundBoxRef.current;
    if (!cursor || !box || !ground || !groundBox) return;
    // touch / no-hover devices never get a custom cursor
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    // the component is rendered inside the section it belongs to — everything
    // (triggers, movement, painting) is scoped to that element
    const container = cursor.parentElement;
    if (!container) return;

    // zero-lag position tracking
    const setX = gsap.quickSetter(cursor, "left", "px");
    const setY = gsap.quickSetter(cursor, "top", "px");
    const setGX = gsap.quickSetter(ground, "left", "px");
    const setGY = gsap.quickSetter(ground, "top", "px");

    // container bounds in viewport coords; re-read on scroll/resize, not per move
    let bounds = container.getBoundingClientRect();
    const readBounds = () => {
      bounds = container.getBoundingClientRect();
    };

    // the box is centred on the pointer (translate(-50%,-50%)), so it occupies
    // x ± half / y ± half on screen
    const half = size / 2;

    // hold the box inside the container instead of letting it run off the edge
    // and lose half its label. Near a boundary it stops tracking that axis —
    // the same thing an edge-aware tooltip does.
    const clampToContainer = (x: number, y: number) => {
      const cx =
        bounds.width < size
          ? bounds.left + bounds.width / 2
          : Math.min(Math.max(x, bounds.left + half), bounds.right - half);
      const cy =
        bounds.height < size
          ? bounds.top + bounds.height / 2
          : Math.min(Math.max(y, bounds.top + half), bounds.bottom - half);
      return { cx, cy };
    };

    // safety net for a container smaller than the box: clip whatever still
    // sticks out. inset() applies to the element's own PRE-transform box, which
    // runs [x, x + size] — hence the extra half when converting from the
    // on-screen edges, which run [x - half, x + half].
    let lastClip = "";
    const clipToContainer = (x: number, y: number) => {
      const top = Math.max(0, bounds.top + half - y);
      const left = Math.max(0, bounds.left + half - x);
      const right = Math.max(0, x + half - bounds.right);
      const bottom = Math.max(0, y + half - bounds.bottom);
      const clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      if (clip !== lastClip) {
        cursor.style.clipPath = clip;
        ground.style.clipPath = clip;
        lastClip = clip;
      }
    };

    // the raw pointer, so a scroll/resize re-clamps against the new bounds
    // rather than re-clamping an already-clamped value
    let lastX = 0;
    let lastY = 0;
    const place = (x: number, y: number) => {
      const { cx, cy } = clampToContainer(x, y);
      setX(cx);
      setY(cy);
      setGX(cx);
      setGY(cy);
      clipToContainer(cx, cy);
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      place(e.clientX, e.clientY);
    };

    const onScrollOrResize = () => {
      readBounds();
      place(lastX, lastY);
    };

    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      // place it before it scales in, so it can't flash at the previous spot
      const me = e as MouseEvent;
      readBounds();
      onMove(me);
      const custom = el.dataset.cursor;
      setText(custom && custom.length > 0 ? custom : label);
      setGlitchKey((k) => k + 1);
      setHovered(true);
      gsap.to([box, groundBox], {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.4)",
      });
    };

    const onLeave = () => {
      setHovered(false);
      gsap.to([box, groundBox], {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    };

    // triggers are looked up inside the container only — a `data-cursor`
    // elsewhere on the page is none of this instance's business
    const triggers = Array.from(
      container.querySelectorAll<HTMLElement>(triggerSelector),
    );
    triggers.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      // hide the native cursor on the trigger (children inherit it)
      el.style.cursor = "none";
    });

    // movement is tracked on the container, so nothing runs off-section
    container.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      container.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      triggers.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.style.cursor = "";
      });
      gsap.killTweensOf([box, groundBox]);
    };
  }, [triggerSelector, label, size]);

  const cornerStyle = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => {
    const inset = hovered ? "0" : "4px";
    return {
      position: "absolute",
      width: "7px",
      height: "7px",
      transition: "all 0.3s ease",
      ...(pos === "tl" && { top: inset, left: inset }),
      ...(pos === "tr" && { top: inset, right: inset }),
      ...(pos === "bl" && { bottom: inset, left: inset }),
      ...(pos === "br" && { bottom: inset, right: inset }),
    };
  };

  const Corner = ({
    pos,
    d,
  }: {
    pos: "tl" | "tr" | "bl" | "br";
    d: string;
  }) => (
    <div style={cornerStyle(pos)}>
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
        <path d={d} stroke={ink} strokeWidth="1" opacity={hovered ? 1 : 0.4} />
      </svg>
    </div>
  );

  /* both layers sit at the same point and scale together; only the lower one
     carries the blend */
  const layer = (z: number): React.CSSProperties => ({
    position: "fixed",
    pointerEvents: "none",
    zIndex: z,
    transform: "translate(-50%, -50%)",
    willChange: "left, top",
    left: "-200px",
    top: "-200px",
  });

  const boxBase: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transform: "scale(0)",
    opacity: 0,
  };

  return (
    <>
      {/* the panel: its own fixed layer, so the blend has the page to work
          against rather than the inside of a stacking context */}
      <div ref={groundRef} aria-hidden="true" style={layer(9998)}>
        {/* The frost. backdrop-filter only reads through the element's own
            alpha, so the ground is translucent rather than solid — solid,
            there would be nothing of the tile left to blur. The saturate
            keeps a bright tile's colour in the glass instead of letting the
            blur wash it grey. */}
        <div
          ref={groundBoxRef}
          style={{
            ...boxBase,
            background,
            backdropFilter: `blur(${blur}px) saturate(140%)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(140%)`,
          }}
        />
      </div>

      <div ref={cursorRef} aria-hidden="true" style={layer(9999)}>
        <div
          ref={boxRef}
          style={{
            ...boxBase,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* corner brackets */}
          <Corner pos="tl" d="M1 7V1H7" />
          <Corner pos="tr" d="M6 7V1H0" />
          <Corner pos="bl" d="M1 0V6H7" />
          <Corner pos="br" d="M6 0V6H0" />

          {/* label with slide-up reveal — height comes from the content (a fixed
            em height clipped the inline-block's descender box) */}
          <div
            style={{
              overflow: "hidden",
              position: "relative",
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              /* never let the flex parent squeeze the label — it would clip it */
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: "block",
                color: ink,
                fontFamily: "var(--font-label, monospace)",
                fontSize: `${fontSize}px`,
                lineHeight: 1.4,
                letterSpacing: "0.02em",
                transition: "transform 0.3s ease",
                transform: hovered ? "translateY(0)" : "translateY(110%)",
              }}
            >
              <DecryptedText
                text={text}
                animateOn="hover"
                glitchKey={glitchKey}
                intervalMs={2500}
                speed={40}
                maxIterations={14}
                characters={GLITCH_CHARS}
                style={{ display: "block", whiteSpace: "pre" }}
              />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
