"use client";

// The context graph: one brand held as a graph, not a history. No caption in
// the art — the copy beside it already names it.
//
// A centre, five branches, and three leaves on each. The whole argument of the
// beat is in the shape — an agent that needs the tone of voice walks to one
// branch and takes three nodes, instead of reading everything the brand has
// ever said.
//
// Which branch is being read is scrubbed to the scroll: the five are taken in
// turn as the figure crosses the viewport, so halfway down is halfway round the
// graph and scrolling back up walks it in reverse.
//
// Under that, dots run every edge inwards — a leaf into its branch, a branch
// into the centre — pulsing up as they set off and out as they arrive. That one
// piece is on a clock rather than the scroll, because a current that stops when
// you stop scrolling is not a current. It runs only while the figure is on
// screen, and not at all under reduced motion.
//
// Canvas because of what the nodes are: each is a small shaded sphere with a
// soft bloom behind it, and there are twenty-one of them. Twenty-one layered
// radial gradients are cheap to paint and expensive to keep in the DOM.
//
// Drawn in a fixed 1210x680 space and scaled to the width it is given, so every
// coordinate below is a design coordinate and nothing is ever re-measured.

import { useEffect, useRef } from "react";

import { scrub, reducedMotion } from "@/lib/scroll-scrub";

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

/* Every edge, pointed inwards: a leaf feeds its branch, a branch feeds the
   centre. The flow runs along these, always towards the middle, because that is
   the direction the brand's information actually travels. */
type Segment = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  branch: number;
  /* offset into the cycle, so twenty dots do not arrive together */
  phase: number;
};

const SEGMENTS: Segment[] = (() => {
  const out: Segment[] = [];
  NODES.forEach(({ branch, leaves }, i) => {
    leaves.forEach((leaf, k) => {
      out.push({
        from: leaf,
        to: branch,
        branch: i,
        phase: (i * 3 + k) / 15,
      });
    });
    out.push({ from: branch, to: CORE, branch: i, phase: (i + 0.5) / 5 });
  });
  return out;
})();

/* How long a dot takes to run its segment. Slow: it is a current, not traffic. */
const FLOW_MS = 3200;

export function ContextGraph() {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* The graph has no ground of its own, so on a light page every part of it
       has to swap or it is a white cloud on white. Three separate inks rather
       than one: the glow, the wiring and the type do not want the same
       treatment when the page turns over.

       Read off the host and re-read when the theme attribute changes, so the
       accent stays whatever --color-act is rather than a copy of it. */
    let light = false;
    let font = "system-ui, sans-serif";
    let accent = "212,40,0";

    /* "#d42800" -> "212,40,0", for use inside rgba() */
    const rgbOf = (hex: string, fallback: string) => {
      const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) return fallback;
      const n = parseInt(m[1], 16);
      return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    };

    const readTheme = () => {
      const cs = getComputedStyle(host);
      light = document.documentElement.dataset.theme === "light";
      font = cs.fontFamily || font;
      accent = rgbOf(cs.getPropertyValue("--color-act"), accent);
    };
    readTheme();

    /* The bloom behind a node. White on the dark page; on the light one it
       takes the accent, because grey light on a grey ground is not light at
       all — it is a smudge. */
    const glow = () => (light ? accent : "255,255,255");
    /* Wiring wants to be read, not to shine, so it stays neutral either way. */
    const wire = () => (light ? "44,52,66" : "255,255,255");
    const ink = () => (light ? "17,17,20" : "255,255,255");

    /* A pearl lit from the top left. On a light page the whole sphere steps
       down, or its highlight is the background and the node loses its top. */
    const hi = () => (light ? "#aab2c4" : "#f2f5fa");
    const mid = () => (light ? "#5c6579" : "#9aa6bd");
    const low = () => (light ? "#2a3141" : "#46505f");

    /* How hard each of those has to be pushed for the theme it is in. */
    const A = () => ({
      core: light ? 0.15 : 0.07,
      branch: light ? 0.09 : 0.05,
      branchOn: light ? 0.14 : 0.05,
      edge: light ? 0.2 : 0.13,
      edgeOn: light ? 0.42 : 0.3,
      leaf: light ? 0.16 : 0.1,
      leafOn: light ? 0.34 : 0.22,
      flow: light ? 0.5 : 0.42,
      flowOn: light ? 0.95 : 0.9,
    });

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
      g.addColorStop(0, `rgba(${glow()},${alpha})`);
      g.addColorStop(1, `rgba(${glow()},0)`);
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
      ctx.strokeStyle = `rgba(${wire()},${alpha})`;
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

    // active: which branch the scroll is reading. now: the clock the inward
    // flow runs on, which is the one thing here that is not scroll driven.
    const draw = (active: number, now: number) => {
      ctx.clearRect(0, 0, W, H);

      const a = A();

      // the light behind everything
      bloom(CX, CY, 210, a.core);
      NODES.forEach(({ branch }, i) => {
        bloom(branch.x, branch.y, 96, i === active ? a.branchOn : a.branch);
      });

      // edges, centre outwards
      NODES.forEach(({ branch, leaves }, i) => {
        const on = i === active;
        edge(CORE, branch, on ? a.edgeOn : a.edge);
        leaves.forEach((leaf) => edge(branch, leaf, on ? a.leafOn : a.leaf));
      });

      /* The flow: dots running every edge inwards, brighter on the branch the
         scroll is reading. They pulse rather than crawl — up as they set off,
         out as they arrive — so the graph reads as being fed continuously
         rather than as something with traffic on it. */
      SEGMENTS.forEach((seg) => {
        const t = (now / FLOW_MS + seg.phase) % 1;
        const on = seg.branch === active;
        // in at the start, out at the end
        const pulse = Math.sin(t * Math.PI);
        const alpha = pulse * (on ? a.flowOn : a.flow);
        if (alpha < 0.02) return;
        const x = seg.from.x + (seg.to.x - seg.from.x) * t;
        const y = seg.from.y + (seg.to.y - seg.from.y) * t;
        bloom(x, y, 13, alpha * 0.55);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${glow()},${alpha})`;
        ctx.fill();
      });

      // nodes
      NODES.forEach(({ branch, leaves }) => {
        leaves.forEach((leaf) => sphere(leaf.x, leaf.y, leaf.r));
        sphere(branch.x, branch.y, branch.r);
      });
      sphere(CORE.x, CORE.y, CORE.r);

      // labels last, so nothing is drawn over them
      NODES.forEach(({ branch, leaves }, i) => {
        const on = i === active;
        leaves.forEach((leaf) => leafLabel(leaf, on ? 0.82 : light ? 0.6 : 0.46));
        text(branch.label, branch.x, branch.y + 30, {
          size: 15,
          alpha: on ? 1 : light ? 0.88 : 0.82,
        });
      });
      text(CORE.label, CORE.x, CORE.y + 34, { size: 15, alpha: 0.95 });
    };

    /* ---------- the run ---------- */

    /* Two clocks, and they do different jobs. Which branch is lit is the
       scroll's: the figure's travel is divided between the five, so scrolling
       walks round the graph and scrolling back walks round it the other way.
       The dots running the edges inwards are the only thing here on a clock of
       its own, because a current that stops when you stop scrolling is not a
       current. */
    const SLICE = 1 / BRANCHES.length;

    let lit = -1;
    let frame = 0;
    const flowing = !reducedMotion();

    const paint = (now: number) => draw(lit, flowing ? now : 0);

    const tick = (now: number) => {
      paint(now);
      frame = requestAnimationFrame(tick);
    };

    const at = (p: number) => {
      lit =
        p <= 0 || p >= 1
          ? -1
          : Math.min(BRANCHES.length - 1, Math.floor(p / SLICE));
      // repaint now, so a scroll with the loop parked still updates
      if (!frame) paint(performance.now());
    };

    size();
    at(0);

    const stopScrub = scrub(host, at, { start: "top 85%", end: "bottom 15%" });

    /* The flow only runs while the figure is on screen — a canvas ticking
       behind the fold is work nobody is watching. */
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.some((e) => e.isIntersecting);
        if (seen && flowing && !frame) frame = requestAnimationFrame(tick);
        else if (!seen && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      size();
      paint(performance.now());
    });
    ro.observe(canvas);

    /* the page's light mode is an attribute on <html>, not a media query, so
       the palette is re-read when that attribute changes */
    const themes = new MutationObserver(() => {
      readTheme();
      paint(performance.now());
    });
    themes.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stopScrub();
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
