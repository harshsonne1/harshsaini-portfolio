"use client";

// The context graph: one brand held as a graph, not a history. No caption in
// the art — the copy beside it already names it.
//
// A centre, five branches, and three leaves on each. The whole argument of the
// beat is in the shape — an agent that needs the tone of voice walks to one
// branch and takes three nodes, instead of reading everything the brand has
// ever said. Packets run the branch edges so the graph reads as something being
// queried rather than a static picture.
//
// Canvas because of what the nodes are: each is a small shaded sphere with a
// soft bloom behind it, and there are twenty-one of them. Twenty-one layered
// radial gradients are cheap to paint and expensive to keep in the DOM.
//
// Drawn in a fixed 1210x680 space and scaled to the width it is given, so every
// coordinate below is a design coordinate and nothing is ever re-measured.

import { useEffect, useRef } from "react";

const W = 1210;
const H = 680;

const CX = 605;
const CY = 330;

/* label, direction from the centre in degrees (screen: 0 is right, negative is
   up), how far out the branch sits, and what hangs off it */
const BRANCHES: {
  label: string;
  angle: number;
  dist: number;
  leaves: string[];
}[] = [
  {
    label: "Brand voice",
    angle: -90,
    dist: 140,
    leaves: ["Tone · warm", "Avoid jargon", "Tagline"],
  },
  {
    label: "Guidelines",
    angle: 187,
    dist: 333,
    leaves: ["Do / Don't", "Palette", "Logo space"],
  },
  {
    label: "Audience",
    angle: -7,
    dist: 333,
    leaves: ["Gen-Z", "EU markets", "Repeat buyers"],
  },
  {
    label: "Campaigns",
    angle: 153,
    dist: 230,
    leaves: ["Open 38%", "Launch deck", "Summer '24"],
  },
  {
    label: "Catalog",
    angle: 27,
    dist: 230,
    leaves: ["SKUs", "Bestsellers", "Price tiers"],
  },
];

const LEAF_DIST = 148;
const LEAF_FAN = 36; // degrees between a branch's leaves

const R_CORE = 11;
const R_BRANCH = 8;
const R_LEAF = 4.5;

const QUERY_MS = 1500; // one branch being read
const REST_MS = 700;

const rad = (deg: number) => (deg * Math.PI) / 180;

type Node = { x: number; y: number; r: number; label: string; branch: number };

/* the graph, laid out once */
const CORE: Node = { x: CX, y: CY, r: R_CORE, label: "Context graph", branch: -1 };

const NODES: { branch: Node; leaves: Node[] }[] = BRANCHES.map((b, i) => {
  const bx = CX + Math.cos(rad(b.angle)) * b.dist;
  const by = CY + Math.sin(rad(b.angle)) * b.dist;
  return {
    branch: { x: bx, y: by, r: R_BRANCH, label: b.label, branch: i },
    /* Fanned so the leaves read in listed order from the top down. On a branch
       pointing left the fan has to run the other way round, or the list comes
       out upside down. */
    leaves: b.leaves.map((label, k) => {
      const spin = Math.cos(rad(b.angle)) < 0 ? -1 : 1;
      const a = rad(b.angle + (k - 1) * LEAF_FAN * spin);
      return {
        x: bx + Math.cos(a) * LEAF_DIST,
        y: by + Math.sin(a) * LEAF_DIST,
        r: R_LEAF,
        label,
        branch: i,
      };
    }),
  };
});

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function ContextGraph() {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /* On a light page the graph would be a white cloud on white, so the ink
       flips with the theme. Read off the host, not hard-coded, and re-read
       when the theme attribute changes. */
    let light = false;
    let font = "system-ui, sans-serif";
    const readTheme = () => {
      light = document.documentElement.dataset.theme === "light";
      font = getComputedStyle(host).fontFamily || font;
    };
    readTheme();

    const ink = () => (light ? "17,17,20" : "255,255,255");
    const hi = () => (light ? "#f8fafc" : "#f2f5fa");
    const mid = () => (light ? "#8b93a6" : "#9aa6bd");
    const low = () => (light ? "#39404f" : "#46505f");

    let dpr = 1;
    const size = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const scale = (rect.width / W) * dpr;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    /* ---------- pieces ---------- */

    // the diffuse light each node sits in
    const bloom = (x: number, y: number, r: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${ink()},${alpha})`);
      g.addColorStop(1, `rgba(${ink()},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // a small shaded sphere: lit from the top left, dark at the lower edge
    const sphere = (x: number, y: number, r: number) => {
      const g = ctx.createRadialGradient(
        x - r * 0.38,
        y - r * 0.42,
        r * 0.1,
        x,
        y,
        r,
      );
      g.addColorStop(0, hi());
      g.addColorStop(0.55, mid());
      g.addColorStop(1, low());
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const edge = (a: Node, b: Node, alpha: number) => {
      ctx.strokeStyle = `rgba(${ink()},${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const text = (
      label: string,
      x: number,
      y: number,
      opts: { size: number; alpha: number; align?: CanvasTextAlign },
    ) => {
      ctx.fillStyle = `rgba(${ink()},${opts.alpha})`;
      ctx.font = `400 ${opts.size}px ${font}`;
      ctx.textAlign = opts.align ?? "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
    };

    /* A leaf's label sits on the far side of it from the centre, so an edge
       never runs through its own text. */
    const leafLabel = (node: Node, alpha: number) => {
      const dx = node.x - CX;
      const dy = node.y - CY;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (dx / len) * 22;
      const oy = (dy / len) * 22;
      const align: CanvasTextAlign =
        Math.abs(dx) < 60 ? "center" : dx > 0 ? "left" : "right";
      text(node.label, node.x + ox, node.y + oy, {
        size: 13.5,
        alpha,
        align,
      });
    };

    /* ---------- a frame ---------- */

    // active: which branch is being read. reach: how far the query has run.
    const draw = (active: number, reach: number) => {
      ctx.clearRect(0, 0, W, H);

      // the light behind everything
      bloom(CX, CY, 210, light ? 0.05 : 0.07);
      NODES.forEach(({ branch }, i) => {
        const on = i === active;
        bloom(branch.x, branch.y, 96, (light ? 0.035 : 0.05) + (on ? 0.05 : 0));
      });

      // edges, centre outwards
      NODES.forEach(({ branch, leaves }, i) => {
        const on = i === active;
        edge(CORE, branch, on ? 0.3 : 0.13);
        leaves.forEach((leaf) => edge(branch, leaf, on ? 0.22 : 0.1));
      });

      // the packet, running the active branch's edge and on into its leaves
      if (active >= 0 && reach > 0) {
        const { branch, leaves } = NODES[active];
        const t = easeInOut(Math.min(1, reach));
        const px = CORE.x + (branch.x - CORE.x) * t;
        const py = CORE.y + (branch.y - CORE.y) * t;
        bloom(px, py, 22, 0.22);
        sphere(px, py, 3.2);
        if (reach > 1) {
          const lt = easeInOut(Math.min(1, reach - 1));
          leaves.forEach((leaf) => {
            const lx = branch.x + (leaf.x - branch.x) * lt;
            const ly = branch.y + (leaf.y - branch.y) * lt;
            sphere(lx, ly, 2.6);
          });
        }
      }

      // nodes
      NODES.forEach(({ branch, leaves }) => {
        leaves.forEach((leaf) => sphere(leaf.x, leaf.y, leaf.r));
        sphere(branch.x, branch.y, branch.r);
      });
      sphere(CORE.x, CORE.y, CORE.r);

      // labels last, so nothing is drawn over them
      NODES.forEach(({ branch, leaves }, i) => {
        const on = i === active;
        leaves.forEach((leaf) => leafLabel(leaf, on ? 0.78 : 0.46));
        text(branch.label, branch.x, branch.y + 30, {
          size: 15,
          alpha: on ? 1 : 0.82,
        });
      });
      text(CORE.label, CORE.x, CORE.y + 34, { size: 15, alpha: 0.95 });
    };

    /* ---------- the run ---------- */

    let raf = 0;
    let startedAt = 0;
    let running = false;
    const CYCLE = QUERY_MS + REST_MS;

    const frame = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = now - startedAt;
      const turn = Math.floor(t / CYCLE);
      const phase = t - turn * CYCLE;
      const active = turn % BRANCHES.length;
      // 0..2: out to the branch, then on to its leaves
      const reach = phase < QUERY_MS ? (phase / QUERY_MS) * 2 : 0;
      draw(phase < QUERY_MS ? active : -1, reach);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    size();
    draw(-1, 0);

    // nothing ticks behind the fold
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !reduced) start();
        else stop();
      },
      { threshold: 0.15 },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      size();
      if (!running) draw(-1, 0);
    });
    ro.observe(canvas);

    const themes = new MutationObserver(() => {
      readTheme();
      if (!running) draw(-1, 0);
    });
    themes.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      themes.disconnect();
    };
  }, []);

  return (
    <figure ref={hostRef} className="cgr">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={W}
        height={H}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {/* the canvas is decoration; this is what the figure says */}
      <p className="sr-only">
        The brand held as a context graph: a centre with five branches — brand
        voice, guidelines, audience, campaigns and catalog — and three nodes on
        each, such as tone, palette, Gen-Z, open rate and price tiers. A query
        walks to one branch and takes its nodes, rather than reading the whole
        history.
      </p>
    </figure>
  );
}
