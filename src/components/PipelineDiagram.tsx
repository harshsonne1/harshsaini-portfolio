"use client";

// The original generation pipeline, drawn rather than screenshotted: five
// inputs feeding six stages, with the refine/retry loop that closes it. The
// run animates so the loop is something you watch happen instead of read
// about — quality check fails some of the time and sends it back to the top.
//
// The diagram is data. Edit INPUTS and STAGES; every wire, arrow and stack
// position is derived from the box geometry below them.

import { useEffect, useRef } from "react";

const INPUTS = [
  "PRODUCT IMAGE",
  "MODEL IMAGE",
  "BRAND LOGO",
  "SCENE REFERENCE",
  "TEXT PROMPT",
];

// title, body (| breaks a line), how long the stage takes to run
const STAGES: [string, string, number][] = [
  ["INGEST", "validate &|standardise inputs", 700],
  ["UNDERSTAND", "detect garment, attributes|& brand context", 1100],
  ["COMPOSE", "build scene, pose|& composition", 900],
  ["GENERATE", "render images|(video optional)", 1800],
  ["BRAND ALIGN", "apply logo, colors,|visual consistency", 800],
  ["QUALITY CHECK", "rules & vision|checks", 900],
];

const COL = [420, 668, 916];
const ROW = [180, 450];
const BW = 224;
const BH = 230;
const HDR = 46;
const BUS = 330;
const RX = 1168;

const NS = "http://www.w3.org/2000/svg";

export function PipelineDiagram() {
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

    // everything the run schedules, so unmounting can stop all of it
    let cancelled = false;
    const frames = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const add = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>,
    ) => {
      const node = document.createElementNS(NS, name);
      for (const key in attrs) node.setAttribute(key, String(attrs[key]));
      art.appendChild(node);
      return node as SVGElementTagNameMap[K];
    };

    /* ---- inputs, gathered onto one bus and fed into the first stage ---- */

    const entry = ROW[0] + BH / 2;
    const first = entry - ((INPUTS.length - 1) / 2) * 52;

    INPUTS.forEach((name, i) => {
      const y = first + i * 52;
      const label = add("text", { class: "pipe-in", x: 48, y: y + 5 });
      label.textContent = name;
      add("path", {
        class: "pipe-wire pipe-feed",
        d: `M${52 + name.length * 9.1} ${y} L${BUS} ${y}`,
      });
    });

    add("path", {
      class: "pipe-wire pipe-feed",
      d: `M${BUS} ${first} L${BUS} ${first + (INPUTS.length - 1) * 52}`,
    });
    add("path", {
      class: "pipe-wire pipe-feed",
      d: `M${BUS} ${entry} L${COL[0] - 34} ${entry}`,
    });
    add("path", {
      class: "pipe-arrow",
      d: `M${COL[0] - 28} ${entry - 7} L${COL[0] - 12} ${entry} L${COL[0] - 28} ${entry + 7} z`,
    });

    /* ---- the six stages ---- */

    const nodes = STAGES.map(([title, body, ms], i) => {
      const x = COL[i % 3];
      const y = ROW[Math.floor(i / 3)];
      const group = add("g", { class: "pipe-stage" });

      const put = <K extends keyof SVGElementTagNameMap>(
        name: K,
        attrs: Record<string, string | number>,
      ) => {
        const node = document.createElementNS(NS, name);
        for (const key in attrs) node.setAttribute(key, String(attrs[key]));
        group.appendChild(node);
        return node as SVGElementTagNameMap[K];
      };

      put("rect", {
        class: "pipe-frame",
        x,
        y,
        width: BW,
        height: BH,
        rx: 3,
      });
      put("line", {
        class: "pipe-rule",
        x1: x,
        y1: y + HDR,
        x2: x + BW,
        y2: y + HDR,
      });

      const heading = put("text", {
        class: "pipe-bt",
        x: x + BW / 2 + 8,
        y: y + 29,
        "text-anchor": "middle",
      });
      heading.textContent = title;

      const lines = body.split("|");
      const top = y + HDR + (BH - HDR - (lines.length - 1) * 22) / 2 + 5;
      lines.forEach((line, j) => {
        const copy = put("text", {
          class: "pipe-bb",
          x: x + BW / 2,
          y: top + j * 22,
          "text-anchor": "middle",
        });
        copy.textContent = line;
      });

      put("circle", { class: "pipe-pip", cx: x + 16, cy: y + 23, r: 4 });
      const meter = put("rect", {
        class: "pipe-meter",
        x,
        y: y + HDR - 2,
        width: 0,
        height: 2,
      });

      return { group, meter, ms };
    });

    /* ---- wires, derived from where the boxes ended up ---- */

    const mid = (row: number) => ROW[row] + BH / 2;
    const wire = (d: string, kind: string) =>
      add("path", { class: `pipe-wire ${kind}`, d });

    const flow: SVGPathElement[] = [];
    ([
      [0, 0],
      [1, 0],
      [3, 1],
      [4, 1],
    ] as const).forEach(([i, row]) => {
      const c = i % 3;
      flow[i] = wire(
        `M${COL[c] + BW} ${mid(row)} L${COL[c + 1]} ${mid(row)}`,
        "pipe-flow",
      );
    });

    // the wrap from the end of the top row down to the start of the bottom
    const sweep = (ROW[0] + BH + ROW[1]) / 2;
    flow[2] = wire(
      `M${COL[2] + BW / 2} ${ROW[0] + BH} L${COL[2] + BW / 2} ${sweep} ` +
        `L${COL[0] + BW / 2} ${sweep} L${COL[0] + BW / 2} ${ROW[1]}`,
      "pipe-flow",
    );

    const retry = wire(
      `M${COL[2] + BW} ${mid(1)} L${RX} ${mid(1)} L${RX} 90 ` +
        `L${COL[0] + BW / 2} 90 L${COL[0] + BW / 2} ${ROW[0]}`,
      "pipe-retry",
    );
    add("circle", {
      class: "pipe-tap",
      cx: COL[2] + BW,
      cy: mid(1),
      r: 3.5,
    });
    add("circle", {
      class: "pipe-tap",
      cx: COL[0] + BW / 2,
      cy: ROW[0],
      r: 3.5,
    });
    const caption = add("text", {
      class: "pipe-cap",
      x: RX,
      y: 68,
      "text-anchor": "end",
    });
    caption.textContent = "REFINE / RETRY";

    /* ---- run it ---- */

    const raf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame((t) => {
        frames.delete(id);
        fn(t);
      });
      frames.add(id);
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const ramp = (node: (typeof nodes)[number], ms: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const step = (now: number) => {
          if (cancelled) return resolve();
          // a frame can be timestamped before the start it was scheduled from
          const k = Math.max(0, Math.min(1, (now - start) / ms));
          node.meter.setAttribute("width", String(BW * k));
          k < 1 ? raf(step) : resolve();
        };
        step(start);
      });

    const packet = (path: SVGPathElement, ms: number) =>
      new Promise<void>((resolve) => {
        if (reduced || cancelled) return resolve();
        const len = path.getTotalLength();
        const start = performance.now();
        packetEl.style.opacity = "1";
        const step = (now: number) => {
          if (cancelled) {
            packetEl.style.opacity = "0";
            return resolve();
          }
          const k = Math.max(0, Math.min(1, (now - start) / ms));
          const p = path.getPointAtLength(len * k);
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

    const reset = () => {
      nodes.forEach((n) => {
        n.group.classList.remove("is-live", "is-done", "is-fail");
        n.meter.setAttribute("width", "0");
      });
      flow.forEach((w) => w.classList.remove("is-lit"));
      retry.classList.remove("is-lit");
    };

    const run = async (): Promise<void> => {
      if (cancelled) return;
      reset();

      for (let i = 0; i < nodes.length; i++) {
        if (cancelled) return;
        const node = nodes[i];

        node.group.classList.add("is-live");
        await ramp(node, reduced ? 120 : node.ms);
        if (cancelled) return;
        node.group.classList.remove("is-live");
        // the bar clears; the pip is what marks the stage as done
        node.meter.setAttribute("width", "0");

        // quality check rejects some of the time, and the run starts over
        if (i === 5 && Math.random() < 0.3) {
          node.group.classList.add("is-fail");
          retry.classList.add("is-lit");
          await packet(retry, 900);
          retry.classList.remove("is-lit");
          await wait(200);
          return run();
        }

        node.group.classList.add("is-done");
        if (i < 5) {
          flow[i].classList.add("is-lit");
          await packet(flow[i], i === 2 ? 600 : 260);
        }
      }

      await wait(1600);
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
      aria-label="The original generation pipeline: five inputs — product image, model image, brand logo, scene reference and text prompt — feed six stages: ingest, understand, compose, generate, brand align and quality check, with a refine and retry loop back to the start."
    >
      <text className="pipe-h" x="48" y="66">
        INPUTS
      </text>
      <path className="pipe-arrow" d="M182 58 L196 66 L182 74 z" />
      <g ref={artRef} />
      <circle className="pipe-packet" ref={packetRef} r="4" />
    </svg>
  );
}
