"use client";

// Before / after on the scene reference: the operator supplies three inputs,
// the one that required taste is struck out and dropped, and what remains —
// product and logo — is enough for the system to derive the world itself.
//
// The run animates the deletion rather than showing two states side by side,
// because the deletion is the argument.

import { useEffect, useRef } from "react";

const X0 = 48;
const CW = 238;
const GAP = 52;
const PY = 258;
const PH = 300;

const colX = (i: number) => X0 + i * (CW + GAP);
const MIDY = PY + PH / 2;

const HEADS: [string, string][] = [
  ["BEFORE", "(OPERATOR-DRIVEN)"],
  ["AFTER", "(SIMPLIFIED INPUT)"],
  ["DERIVED WORLD", "(AI REASONING)"],
  ["HERO IMAGE", "(OUTPUT)"],
];

// where the reasoning nodes sit, relative to the cluster's centre
const PTS: [number, number][] = [
  [-70, -52],
  [-16, -64],
  [46, -40],
  [62, 10],
  [24, 60],
  [-40, 46],
  [-78, 4],
  [6, -18],
  [-34, -8],
  [38, -70],
];

const BULLETS = [
  "UNDERSTANDS PRODUCT",
  "ANALYZES CONTEXT",
  "SELECTS THE RIGHT WORLD",
  "DETERMINES COMPOSITION,",
  "LIGHT, TONE & MOOD",
];

const NS = "http://www.w3.org/2000/svg";

export function InputFlowDiagram() {
  const artRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;

    // dev's double-invoked effect would otherwise draw the diagram twice
    art.replaceChildren();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cancelled = false;
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
    const txt = (
      cls: string,
      x: number,
      y: number,
      s: string,
      anchor?: string,
    ) => {
      const t = add("text", {
        class: cls,
        x,
        y,
        ...(anchor ? { "text-anchor": anchor } : {}),
      });
      t.textContent = s;
      return t;
    };

    /* ---- glyphs, drawn in a 40×40 box ---- */

    const tee = (g: SVGGElement, x: number, y: number, s = 1) => {
      const pts: [number, number][] = [
        [14, 6],
        [10, 6],
        [4, 13],
        [9, 19],
        [12, 16],
        [12, 35],
        [28, 35],
        [28, 16],
        [31, 19],
        [36, 13],
        [30, 6],
        [26, 6],
        [20, 10],
      ];
      const d =
        "M" + pts.map(([px, py]) => `${x + px * s},${y + py * s}`).join(" L");
      g.appendChild(make("path", { class: "flow-gly", d: d + " Z" }));
    };

    const logo = (g: SVGGElement, x: number, y: number) => {
      g.appendChild(
        make("circle", { class: "flow-gly", cx: x + 20, cy: y + 20, r: 13 }),
      );
      const t = make("text", {
        class: "flow-glyph-label",
        x: x + 20,
        y: y + 23.5,
        "text-anchor": "middle",
      });
      t.textContent = "LOGO";
      g.appendChild(t);
    };

    const scene = (g: SVGGElement, x: number, y: number) => {
      g.appendChild(
        make("rect", {
          class: "flow-gly",
          x: x + 6,
          y: y + 9,
          width: 28,
          height: 22,
          rx: 2,
        }),
      );
      g.appendChild(
        make("path", {
          class: "flow-gly",
          d: `M${x + 9} ${y + 29} L${x + 17} ${y + 18} L${x + 25} ${y + 29} Z`,
        }),
      );
      g.appendChild(
        make("circle", { class: "flow-gly", cx: x + 27, cy: y + 16, r: 3 }),
      );
    };

    const tile = (
      parent: SVGGElement,
      x: number,
      y: number,
      kind: "tee" | "logo" | "scene",
      label: string,
    ) => {
      const g = make("g", {});
      parent.appendChild(g);
      g.appendChild(
        make("rect", {
          class: "flow-tile",
          x,
          y,
          width: 52,
          height: 52,
          rx: 7,
        }),
      );
      const gx = x + 6;
      const gy = y + 6;
      if (kind === "tee") tee(g, gx, gy);
      if (kind === "logo") logo(g, gx, gy);
      if (kind === "scene") scene(g, gx, gy);

      const lines = label.split("|");
      lines.forEach((line, i) => {
        const t = make("text", {
          class: "flow-lbl",
          x: x + 68,
          y: y + (lines.length > 1 ? 24 : 31) + i * 15,
        });
        t.textContent = line;
        g.appendChild(t);
      });
      return g;
    };

    /* ---- column headers ---- */

    HEADS.forEach((h, i) => {
      const mx = colX(i) + CW / 2;
      txt("pipe-cap", mx, PY - 40, h[0], "middle");
      txt("pipe-cap", mx, PY - 22, h[1], "middle");
    });

    /* ---- 1 · before ---- */

    const s1 = add("g", { class: "flow-step" });
    s1.appendChild(
      make("rect", {
        class: "flow-panel is-dash",
        x: colX(0),
        y: PY,
        width: CW,
        height: PH,
        rx: 4,
      }),
    );
    const bx = colX(0) + 26;
    tile(s1, bx, PY + 34, "tee", "PRODUCT");
    txt("flow-plus", bx + 26, PY + 106, "+", "middle");
    tile(s1, bx, PY + 120, "logo", "LOGO");
    txt("flow-plus", bx + 26, PY + 192, "+", "middle");

    const doomed = make("g", { class: "flow-doomed" });
    s1.appendChild(doomed);
    tile(doomed, bx, PY + 206, "scene", "SCENE|REFERENCE");
    const strike = add("line", {
      class: "flow-strike",
      x1: bx - 8,
      y1: PY + 238,
      x2: bx + 144,
      y2: PY + 238,
    });

    /* ---- 2 · after ---- */

    const s2 = add("g", { class: "flow-step" });
    s2.appendChild(
      make("rect", {
        class: "flow-panel is-dash",
        x: colX(1),
        y: PY,
        width: CW,
        height: PH,
        rx: 4,
      }),
    );
    const ax = colX(1) + 26;
    tile(s2, ax, PY + 78, "tee", "PRODUCT");
    txt("flow-plus", ax + 26, PY + 150, "+", "middle");
    tile(s2, ax, PY + 164, "logo", "LOGO");

    /* ---- 3 · derived world ---- */

    const s3 = add("g", { class: "flow-step" });
    s3.appendChild(
      make("rect", {
        class: "flow-panel",
        x: colX(2),
        y: PY,
        width: CW,
        height: PH,
        rx: 14,
      }),
    );
    const cx3 = colX(2) + CW / 2;
    const cy3 = PY + 130;

    const nodes = PTS.map(([dx, dy]) => ({ x: cx3 + dx, y: cy3 + dy }));
    const edges = nodes.map((n) => {
      const l = make("line", {
        class: "flow-edge",
        x1: cx3,
        y1: cy3,
        x2: n.x,
        y2: n.y,
      });
      s3.appendChild(l);
      return l;
    });
    const dots = nodes.map((n) => {
      const c = make("circle", { class: "flow-node", cx: n.x, cy: n.y, r: 5 });
      s3.appendChild(c);
      return c;
    });
    s3.appendChild(
      make("circle", { class: "flow-node is-core", cx: cx3, cy: cy3, r: 6 }),
    );
    s3.appendChild(
      make("circle", { class: "flow-node", cx: cx3, cy: cy3, r: 11 }),
    );

    /* ---- 4 · hero image ---- */

    const s4 = add("g", { class: "flow-step" });
    s4.appendChild(
      make("rect", {
        class: "flow-panel",
        x: colX(3),
        y: PY,
        width: CW,
        height: PH,
        rx: 14,
      }),
    );
    const hx = colX(3);
    const C = 22;
    (
      [
        [hx + 18, PY + 18, 1, 1],
        [hx + CW - 18, PY + 18, -1, 1],
        [hx + 18, PY + PH - 18, 1, -1],
        [hx + CW - 18, PY + PH - 18, -1, -1],
      ] as const
    ).forEach(([x, y, sx, sy]) => {
      s4.appendChild(
        make("path", {
          class: "flow-gly",
          d: `M${x} ${y + sy * C} L${x} ${y} L${x + sx * C} ${y}`,
        }),
      );
    });
    const heroG = make("g", {});
    s4.appendChild(heroG);
    tee(heroG, colX(3) + CW / 2 - 46, PY + (PH - 92) / 2, 2.3);

    /* ---- arrows between the four ---- */

    const arrows = [0, 1, 2].map((i) => {
      const x1 = colX(i) + CW + 12;
      const x2 = colX(i + 1) - 12;
      const a = add("path", {
        class: "flow-arrow",
        d: `M${x1} ${MIDY} L${x2 - 7} ${MIDY}`,
      });
      const h = add("path", {
        class: "flow-arrowhead",
        d: `M${x2 - 8} ${MIDY - 5} L${x2} ${MIDY} L${x2 - 8} ${MIDY + 5} z`,
      });
      return { a, h };
    });

    /* ---- captions under each column ---- */

    const stalkCaption = (i: number, lines: string[]) => {
      const mx = colX(i) + CW / 2;
      add("path", {
        class: "flow-stalk",
        d: `M${mx} ${PY + PH + 8} L${mx} ${PY + PH + 34}`,
      });
      return lines.map((l, j) =>
        txt("flow-capline pipe-cap", mx, PY + PH + 58 + j * 17, l, "middle"),
      );
    };
    const cap1 = stalkCaption(0, ["OPERATOR DECIDES", "THE WORLD"]);
    const cap2 = stalkCaption(1, [
      "OPERATOR FOCUSES ONLY",
      "ON CORE INPUTS",
    ]);
    const cap4 = stalkCaption(3, [
      "CONSISTENT, CONTEXTUALLY",
      "RIGHT HERO IMAGE",
    ]);

    // what the reasoning step is actually doing, revealed as it works
    const bulletDots: SVGCircleElement[] = [];
    const bullets = BULLETS.map((s, j) => {
      const x = colX(2) + 14;
      const y = PY + PH + 34 + j * 19;
      const t = txt("flow-bul flow-capline", x, y, s);
      if (j < 4) {
        bulletDots[j] = add("circle", {
          class: "flow-capline flow-bul-dot",
          cx: x - 8,
          cy: y - 3.5,
          r: 1.8,
        });
      }
      return t;
    });

    /* ---- run ---- */

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(
          () => {
            timers.delete(id);
            resolve();
          },
          reduced ? Math.min(ms, 60) : ms,
        );
        timers.add(id);
      });

    const show = (els: Element[], on = true) =>
      els.forEach((e) => e.classList.toggle("is-shown", on));

    const run = async (): Promise<void> => {
      if (cancelled) return;

      [s1, s2, s3, s4].forEach((s) => s.classList.remove("is-on"));
      arrows.forEach(({ a, h }) => {
        a.classList.remove("is-lit");
        h.classList.remove("is-lit");
      });
      doomed.classList.remove("is-gone");
      strike.classList.remove("is-on");
      dots.forEach((d) => d.classList.remove("is-lit"));
      edges.forEach((e) => e.classList.remove("is-lit"));
      show([...cap1, ...cap2, ...cap4, ...bullets, ...bulletDots], false);
      await wait(700);
      if (cancelled) return;

      s1.classList.add("is-on");
      show(cap1);
      await wait(1200);
      if (cancelled) return;

      // the headline, animated: strike the taste-dependent input, then drop it
      strike.classList.add("is-on");
      await wait(650);
      doomed.classList.add("is-gone");
      await wait(500);
      if (cancelled) return;
      s1.classList.remove("is-on");

      arrows[0].a.classList.add("is-lit");
      arrows[0].h.classList.add("is-lit");
      await wait(320);
      s2.classList.add("is-on");
      show(cap2);
      await wait(1100);
      if (cancelled) return;
      s2.classList.remove("is-on");

      arrows[1].a.classList.add("is-lit");
      arrows[1].h.classList.add("is-lit");
      await wait(320);
      s3.classList.add("is-on");

      // the system works the world out
      for (let i = 0; i < dots.length; i++) {
        if (cancelled) return;
        dots[i].classList.add("is-lit");
        edges[i].classList.add("is-lit");
        if (i % 2 === 0 && i / 2 < bullets.length) {
          bullets[i / 2].classList.add("is-shown");
          bulletDots[i / 2]?.classList.add("is-shown");
        }
        await wait(150);
      }
      show(bullets);
      show(bulletDots);
      await wait(900);
      if (cancelled) return;
      s3.classList.remove("is-on");

      arrows[2].a.classList.add("is-lit");
      arrows[2].h.classList.add("is-lit");
      await wait(320);
      s4.classList.add("is-on");
      show(cap4);
      await wait(2600);
      return run();
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, []);

  return (
    <svg
      className="pipe"
      viewBox="0 0 1200 800"
      role="img"
      aria-label="Before: the operator supplies a product, a logo and a scene reference, deciding the world themselves. The scene reference is deleted. After: product and logo only. The system then reasons out the world — understanding the product, analysing context, selecting the world, and determining composition, light, tone and mood — and returns a consistent hero image."
    >
      <text className="pipe-h flow-h" x="48" y="52">
        DELETE THE INPUT THAT
      </text>
      <text className="pipe-h flow-h" x="48" y="76">
        REQUIRED TASTE.
      </text>
      <path className="flow-mark" d="M48 98 L48 110 M48 104 L140 104" />
      <rect className="flow-mark-block" x="140" y="100" width="8" height="8" />
      <g ref={artRef} />
    </svg>
  );
}
