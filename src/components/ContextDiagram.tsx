"use client";

// Four product types, the context each one needs, and the single CREATE step
// they all drop into. Every wire falls straight down — nothing routes sideways
// — so "four different contexts, one create" is the only available reading.
//
// The diagram is data. Edit PRODUCTS; the columns, wires and the shared bar
// beneath them are derived from it.

import { useEffect, useRef } from "react";

const PRODUCTS: [string, string[]][] = [
  ["FASHION", ["fabric", "fit", "construction", "movement"]],
  ["MERCHANDISE", ["graphics", "surfaces", "print placement"]],
  ["LUXURY", ["material", "composition", "restraint"]],
  ["FOOTWEAR", ["silhouette", "materials", "stance"]],
];

const X0 = 48;
const CW = 252;
const GAP = 16;
const HY = 176; // product header band
const HH = 58;
const TY = 296; // term list
const TLH = 42;
const BY = 540; // the shared create bar
const BH = 120;

const NS = "http://www.w3.org/2000/svg";

const colX = (i: number) => X0 + i * (CW + GAP);
const RIGHT = colX(PRODUCTS.length - 1) + CW;

export function ContextDiagram() {
  const artRef = useRef<SVGGElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const art = artRef.current;
    const packetEl = packetRef.current;
    if (!art || !packetEl) return;

    // dev's double-invoked effect would otherwise draw the diagram twice
    art.replaceChildren();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cancelled = false;
    const frames = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const make = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>,
    ) => {
      const node = document.createElementNS(NS, name);
      for (const key in attrs) node.setAttribute(key, String(attrs[key]));
      return node as SVGElementTagNameMap[K];
    };
    const add = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>,
    ) => {
      const node = make(name, attrs);
      art.appendChild(node);
      return node;
    };

    const caption = add("text", { class: "pipe-cap", x: X0, y: HY - 22 });
    caption.textContent = "WHAT THE SYSTEM HAS TO UNDERSTAND";

    /* ---- the one shared step ---- */

    const bar = add("rect", {
      class: "ctx-bar",
      x: X0,
      y: BY,
      width: RIGHT - X0,
      height: BH,
      rx: 3,
    });
    const createLabel = add("text", {
      class: "ctx-kt",
      x: (X0 + RIGHT) / 2,
      y: BY + 50,
      "text-anchor": "middle",
    });
    createLabel.textContent = "CREATE";
    const createSub = add("text", {
      class: "pipe-cap",
      x: (X0 + RIGHT) / 2,
      y: BY + 82,
      "text-anchor": "middle",
    });
    createSub.textContent = "THE SAME STEP — ONLY THE CONTEXT CHANGES";

    /* ---- columns ---- */

    const cols = PRODUCTS.map(([name, terms], i) => {
      const x = colX(i);
      const mx = x + CW / 2;
      const group = add("g", { class: "ctx-col" });
      const put = <K extends keyof SVGElementTagNameMap>(
        tag: K,
        attrs: Record<string, string | number>,
      ) => {
        const node = make(tag, attrs);
        group.appendChild(node);
        return node;
      };

      put("rect", {
        class: "ctx-frame",
        x,
        y: HY,
        width: CW,
        height: HH,
        rx: 3,
      });
      const label = put("text", {
        class: "ctx-pt",
        x: mx,
        y: HY + 36,
        "text-anchor": "middle",
      });
      label.textContent = name;

      const termEls = terms.map((term, j) => {
        const t = put("text", {
          class: "ctx-term",
          x: mx,
          y: TY + j * TLH,
          "text-anchor": "middle",
        });
        t.textContent = term;
        return t;
      });

      const wire = put("path", {
        class: "ctx-wire",
        d: `M${mx} ${TY + terms.length * TLH - 4} L${mx} ${BY - 10}`,
      });
      put("path", {
        class: "ctx-tip",
        d: `M${mx - 5} ${BY - 10} L${mx} ${BY - 2} L${mx + 5} ${BY - 10} z`,
      });

      return { group, termEls, wire };
    });

    const footer = add("text", {
      class: "pipe-cap",
      x: (X0 + RIGHT) / 2,
      y: BY + BH + 46,
      "text-anchor": "middle",
    });
    footer.textContent =
      "GIVE THE SYSTEM THE RIGHT CONTEXT BEFORE ASKING IT TO CREATE";

    /* ---- run: one product at a time — gather context, then create ---- */

    const raf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame((t) => {
        frames.delete(id);
        fn(t);
      });
      frames.add(id);
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(
          () => {
            timers.delete(id);
            resolve();
          },
          reduced ? Math.min(ms, 70) : ms,
        );
        timers.add(id);
      });

    const drop = (col: (typeof cols)[number], ms: number) =>
      new Promise<void>((resolve) => {
        if (reduced || cancelled) return resolve();
        const len = col.wire.getTotalLength();
        const start = performance.now();
        packetEl.style.opacity = "1";
        const step = (now: number) => {
          if (cancelled) {
            packetEl.style.opacity = "0";
            return resolve();
          }
          // a frame can be timestamped before the start it was scheduled from
          const k = Math.max(0, Math.min(1, (now - start) / ms));
          const p = col.wire.getPointAtLength(len * k);
          packetEl.setAttribute("cx", String(p.x));
          packetEl.setAttribute("cy", String(p.y));
          if (k < 1) raf(step);
          else {
            packetEl.style.opacity = "0";
            resolve();
          }
        };
        step(start);
      });

    const run = async (): Promise<void> => {
      if (cancelled) return;

      cols.forEach((col) => {
        col.group.classList.remove("is-live", "is-done");
        col.termEls.forEach((t) => t.classList.remove("is-on"));
      });
      bar.classList.remove("is-hit");
      await wait(600);

      for (const col of cols) {
        if (cancelled) return;
        col.group.classList.add("is-live");

        for (const t of col.termEls) {
          if (cancelled) return;
          t.classList.add("is-on");
          await wait(380);
        }
        await wait(180);

        // context first, then and only then create
        await drop(col, 460);
        if (cancelled) return;

        bar.classList.add("is-hit");
        col.group.classList.remove("is-live");
        col.group.classList.add("is-done");
        await wait(280);
        bar.classList.remove("is-hit");
      }

      await wait(2000);
      return run();
    };

    run();

    return () => {
      cancelled = true;
      frames.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      frames.clear();
      timers.clear();
    };
  }, []);

  return (
    <svg
      className="pipe"
      viewBox="0 0 1200 800"
      role="img"
      aria-label="Four product types each need different context before the same create step. Fashion: fabric, fit, construction, movement. Merchandise: graphics, surfaces, print placement. Luxury: material, composition, restraint. Footwear: silhouette, materials, stance. Give the system the right context before asking it to create."
    >
      <text className="pipe-h ctx-h" x="48" y="62">
        DIFFERENT PRODUCTS, DIFFERENT INTELLIGENCE
      </text>
      <g ref={artRef} />
      <circle className="pipe-packet" ref={packetRef} r="4" />
    </svg>
  );
}
