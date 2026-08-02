"use client";

// MagneticCursor — a label box that follows the pointer and scales in while
// hovering elements matching `triggerSelector`. mix-blend-mode: exclusion means
// it nearly vanishes on dark backgrounds and inverts on light/colourful ones.
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
  /** box background colour */
  background?: string;
};

export default function MagneticCursor({
  label = "View case",
  size = 150,
  fontSize = 20,
  triggerSelector = "[data-cursor]",
  background = "#0f0f0f",
}: MagneticCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [text, setText] = useState(label);
  // bumped on every enter so the label re-scrambles each time the cursor appears
  const [glitchKey, setGlitchKey] = useState(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const box = boxRef.current;
    if (!cursor || !box) return;
    // touch / no-hover devices never get a custom cursor
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    // the component is rendered inside the section it belongs to — everything
    // (triggers, movement, painting) is scoped to that element
    const container = cursor.parentElement;
    if (!container) return;

    // zero-lag position tracking
    const setX = gsap.quickSetter(cursor, "left", "px");
    const setY = gsap.quickSetter(cursor, "top", "px");

    // container bounds in viewport coords; re-read on scroll/resize, not per move
    let bounds = container.getBoundingClientRect();
    const readBounds = () => {
      bounds = container.getBoundingClientRect();
    };

    // clip the (fixed-position) box to the container so it can never paint
    // outside the section. inset() is in the element's own pre-transform box,
    // whose origin sits at the pointer, hence the clientX/clientY offsets.
    let lastClip = "";
    const clipToContainer = (x: number, y: number) => {
      const top = Math.max(0, bounds.top - y);
      const left = Math.max(0, bounds.left - x);
      const right = Math.max(0, x + size - bounds.right);
      const bottom = Math.max(0, y + size - bounds.bottom);
      const clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      if (clip !== lastClip) {
        cursor.style.clipPath = clip;
        lastClip = clip;
      }
    };

    let lastX = 0;
    let lastY = 0;
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      setX(e.clientX);
      setY(e.clientY);
      clipToContainer(e.clientX, e.clientY);
    };

    const onScrollOrResize = () => {
      readBounds();
      clipToContainer(lastX, lastY);
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
      gsap.to(box, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.4)",
      });
    };

    const onLeave = () => {
      setHovered(false);
      gsap.to(box, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
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
      gsap.killTweensOf(box);
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

  const Corner = ({ pos, d }: { pos: "tl" | "tr" | "bl" | "br"; d: string }) => (
    <div style={cornerStyle(pos)}>
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
        <path d={d} stroke="#fff" strokeWidth="1" opacity={hovered ? 1 : 0.4} />
      </svg>
    </div>
  );

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "exclusion",
        transform: "translate(-50%, -50%)",
        willChange: "left, top",
        left: "-200px",
        top: "-200px",
      }}
    >
      <div
        ref={boxRef}
        style={{
          background,
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transform: "scale(0)",
          opacity: 0,
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
              color: "#fff",
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
  );
}
