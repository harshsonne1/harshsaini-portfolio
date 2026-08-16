"use client";

// Four product pipelines against one shared CREATE step. The run walks them
// one at a time, lighting each piece of context before the wire feeds the
// create panel — the order is the argument: context first, creation second.
//
// The diagram is data. Edit PRODUCTS; the rows, chip widths, wires and the
// brace beneath them are all derived from it.

import { useEffect, useRef } from "react";

const PRODUCTS: [string, string[]][] = [
  ["FASHION", ["FABRIC", "FIT", "CONSTRUCTION", "MOVEMENT"]],
  ["MERCHANDISE", ["GRAPHICS", "SURFACES", "PRINT PLACEMENT"]],
  ["LUXURY", ["MATERIAL", "COMPOSITION", "RESTRAINT"]],
  ["FOOTWEAR", ["SILHOUETTE", "MATERIALS", "STANCE"]],
];

const PX = 48; // product column
const PW = 196;
const RH = 104;
const R0 = 168;
const PITCH = 134;
const CX = 292; // where the context chips start
const KX = 966; // the shared create panel
const KW = 186;
const CHIP_H = 38;
const CHIP_GAP = 12;

const NS = "http://www.w3.org/2000/svg";

const rowY = (i: number) => R0 + i * PITCH;
const TOP = rowY(0);
const BOT = rowY(PRODUCTS.length - 1) + RH;

export function PipelinesDiagram() {
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

    /* ---- column captions ---- */

    const product = add("text", { class: "pipe-cap", x: PX, y: TOP - 22 });
    product.textContent = "PRODUCT";
    const context = add("text", { class: "pipe-cap", x: CX, y: TOP - 22 });
    context.textContent = "WHAT THE SYSTEM MUST UNDERSTAND FIRST";

    /* ---- the shared create panel: one step, four contexts feeding it ---- */

    add("rect", {
      class: "pipes-createbox",
      x: KX,
      y: TOP,
      width: KW,
      height: BOT - TOP,
      rx: 3,
    });
    add("line", {
      class: "pipes-rule",
      x1: KX,
      y1: TOP + 46,
      x2: KX + KW,
      y2: TOP + 46,
    });
    const createLabel = add("text", {
      class: "pipes-pt",
      x: KX + KW / 2,
      y: TOP + 29,
      "text-anchor": "middle",
    });
    createLabel.textContent = "CREATE";

    ["same step", "every time", "—", "context is", "what changes"].forEach(
      (line, i) => {
        const t = add("text", {
          class: "pipes-ct2",
          x: KX + KW / 2,
          y: (TOP + BOT) / 2 - 40 + i * 21,
          "text-anchor": "middle",
        });
        t.textContent = line;
      },
    );

    /* ---- rows ---- */

    const rows = PRODUCTS.map(([name, terms], i) => {
      const y = rowY(i);
      const my = y + RH / 2;
      const group = add("g", { class: "pipes-row" });
      const put = <K extends keyof SVGElementTagNameMap>(
        tag: K,
        attrs: Record<string, string | number>,
      ) => {
        const node = make(tag, attrs);
        group.appendChild(node);
        return node;
      };

      put("rect", {
        class: "pipes-frame",
        x: PX,
        y,
        width: PW,
        height: RH,
        rx: 3,
      });
      put("circle", { class: "pipes-pip", cx: PX + 16, cy: y + 20, r: 3.5 });
      const label = put("text", {
        class: "pipes-pt",
        x: PX + PW / 2 + 8,
        y: my + 5,
        "text-anchor": "middle",
      });
      label.textContent = name;

      // chips run left to right, each sized from its own label
      let x = CX;
      const chips = terms.map((term) => {
        const w = term.length * 7.6 + 26;
        const chip = put("rect", {
          class: "pipes-chip",
          x,
          y: my - CHIP_H / 2,
          width: w,
          height: CHIP_H,
          rx: 19,
        });
        const t = put("text", {
          class: "pipes-ct",
          x: x + w / 2,
          y: my + 4,
          "text-anchor": "middle",
        });
        t.textContent = term;
        x += w + CHIP_GAP;
        return chip;
      });

      const wire = put("path", {
        class: "pipes-wire",
        d: `M${x + 6} ${my} L${KX - 10} ${my}`,
      });
      put("path", {
        class: "pipes-tip",
        d: `M${KX - 10} ${my - 5} L${KX - 2} ${my} L${KX - 10} ${my + 5} z`,
      });

      return { group, chips, wire };
    });

    /* ---- the principle, stated once, under everything ---- */

    add("path", {
      class: "pipes-brace",
      d:
        `M${PX} ${BOT + 26} L${PX} ${BOT + 34} ` +
        `L${KX + KW} ${BOT + 34} L${KX + KW} ${BOT + 26}`,
    });
    const foot = add("text", {
      class: "pipe-cap",
      x: (PX + KX + KW) / 2,
      y: BOT + 58,
      "text-anchor": "middle",
    });
    foot.textContent =
      "DIFFERENT WORKFLOWS · SAME PRINCIPLE: CONTEXT BEFORE CREATION";

    /* ---- run ---- */

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
          reduced ? Math.min(ms, 80) : ms,
        );
        timers.add(id);
      });

    const travel = (row: (typeof rows)[number], ms: number) =>
      new Promise<void>((resolve) => {
        if (reduced || cancelled) return resolve();
        const len = row.wire.getTotalLength();
        const start = performance.now();
        packetEl.style.opacity = "1";
        const step = (now: number) => {
          if (cancelled) {
            packetEl.style.opacity = "0";
            return resolve();
          }
          // a frame can be timestamped before the start it was scheduled from
          const k = Math.max(0, Math.min(1, (now - start) / ms));
          const p = row.wire.getPointAtLength(len * k);
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

      rows.forEach((row) => {
        row.group.classList.remove("is-live", "is-done");
        row.chips.forEach((c) => c.classList.remove("is-on", "is-was"));
      });
      await wait(500);

      for (const row of rows) {
        if (cancelled) return;
        row.group.classList.add("is-live");

        // context is gathered first…
        for (const chip of row.chips) {
          if (cancelled) return;
          chip.classList.add("is-on");
          await wait(420);
        }
        await wait(200);

        // …then, and only then, create
        await travel(row, 520);
        if (cancelled) return;

        row.chips.forEach((c) => {
          c.classList.remove("is-on");
          c.classList.add("is-was");
        });
        row.group.classList.remove("is-live");
        row.group.classList.add("is-done");
        await wait(360);
      }

      await wait(1800);
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
      aria-label="Four product-specific pipelines — fashion, merchandise, luxury and footwear — each giving the system a different set of things to understand first: fabric, fit, construction and movement for fashion; graphics, surfaces and print placement for merchandise; material, composition and restraint for luxury; silhouette, materials and stance for footwear. All four feed the same create step. Different workflows, same principle: context before creation."
    >
      <text className="pipe-h" x="48" y="62">
        FOUR PIPELINES
      </text>
      <text className="pipe-cap" x="1152" y="60" textAnchor="end">
        ONE PRINCIPLE
      </text>
      <g ref={artRef} />
      <circle className="pipe-packet" ref={packetRef} r="4" />
    </svg>
  );
}
