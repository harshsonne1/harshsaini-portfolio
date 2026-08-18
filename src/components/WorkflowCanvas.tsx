"use client";

// The reveal workflow as the graph an operator actually builds, drawn live
// rather than screenshotted: product and logo in, through positioning and
// prompt, out to the generated reveal. Every card drags and the wires follow,
// so the shape of the pipeline is something the reader can pull apart instead
// of only read.
//
// The graph is data. Edit NODES and EDGES; card geometry, socket stacks and
// every bezier are derived from them.
//
// The canvas lays out at W x H design pixels and is scaled into whatever box
// the figure hands it — the same trick as FrameEmbed. Wire endpoints are read
// from layout offsets rather than getBoundingClientRect, so the scale sitting
// on the ancestor never enters the arithmetic.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import Draggable from "gsap/Draggable";
import { CoverVideo } from "@/components/CoverVideo";
import { Skeleton } from "@/components/ui/skeleton";

/* Design canvas. Every coordinate below is authored in these pixels, as the
   card's own left/top — the arrangement was set by hand on the canvas, so the
   numbers are the layout rather than an offset from one.

   The canvas is the cards' extent plus an even 56px margin: the leftmost card
   starts at x 56 and the topmost at y 56, and W/H are the far edges plus the
   same 56. Move a card past either edge and these two want refreshing with it —
   the figure's width/height in site.ts must keep this ratio, or the box
   letterboxes around the canvas. */
const W = 1534;
const H = 773;

/* Narrow screens get a second arrangement entirely — see `is-vertical` in
   globals.css. Scaling the wide canvas onto a phone put it at 22%, which made
   the figure a picture of a graph rather than a graph. Here the canvas is about
   one card wide, so the cards keep their own size and the type lands slightly
   larger than it does on desktop; what changes is the direction of flow, which
   runs top to bottom. The height is measured, not authored: the cards reflow at
   this width and their own heights decide how tall the column is. */
const GAP_M = 28;
/* Cards start clear of the left edge: the strip they leave behind is the gutter
   the long wires run down, so it has to stay empty at every height. */
const GUTTER_M = 56;
const PAD_M = 16;
/* The column is laid out at the width it is shown at, so nothing is scaled.
   MIN is only a fallback for the frame before the host has been measured; MAX
   stops a tablet from stretching two 240px cards across 940px of canvas, which
   left the two halves of the stagger with nothing between them. Past it the
   column keeps this width and centres. */
const W_M_MIN = 340;
const W_M_MAX = 400;
/* Below this the wide canvas would be scaled under ~0.6, which is where its
   7.5px type stops being type. Matches the width at which the case study's own
   grid stops being two columns. */
const NARROW = "(max-width: 1023px)";

/* Socket types. The colour is what tells you which input a wire is carrying,
   so it is a named type rather than a hex literal at the call site. */
type Sock = "green" | "blue" | "violet" | "orange" | "magenta";
const wire = (c: Sock) => `var(--ncv-${c})`;

/* ---------------------------------------------------------------- icons ---- */

/* Four-point spark: four concave quadrants, so all four colours survive at
   14px. Built once at module scope rather than per render. */
const SPARK_QUADS: [number, number, string][] = [
  [-90, 180, "#4285F4"],
  [180, 90, "#34A853"],
  [90, 0, "#F9AB00"],
  [0, -90, "#E75B8D"],
];

const SPARK_PATHS = (() => {
  const c = 12;
  const R = 10.7;
  const INSET = 5.2;
  const at = (deg: number, rad: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(c + rad * Math.cos(a)).toFixed(2)},${(c + rad * Math.sin(a)).toFixed(2)}`;
  };
  return SPARK_QUADS.map(([a, b, fill]) => ({
    fill,
    d: `M${c},${c} L${at(a, R)} C${at(a, R - INSET)} ${at(b, R - INSET)} ${at(b, R)} Z`,
  }));
})();

const Spark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    {SPARK_PATHS.map((p) => (
      <path key={p.fill} fill={p.fill} d={p.d} />
    ))}
  </svg>
);

const Seedance = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="8" width="4.6" height="12" rx="2.3" fill="#1E40AF" />
    <rect x="9.7" y="4" width="4.6" height="16" rx="2.3" fill="#22D3EE" />
    <rect x="16.4" y="11" width="4.6" height="9" rx="2.3" fill="#38BDF8" />
  </svg>
);

/* ------------------------------------------------------- aspect ratios ---- */

/* label, then the proportions of the little preview box that sits above it */
const RATIOS: [string, number, number][] = [
  ["1:1", 14, 14],
  ["16:9", 21, 12],
  ["9:16", 10, 17],
  ["4:3", 19, 14],
  ["3:4", 12, 17],
  ["3:2", 20, 13],
  ["2:3", 11, 17],
  ["21:9", 24, 11],
  ["4:5", 13, 16],
];

/* The workflow's own output is portrait 3:4 — the frame and the clip both are —
   so that is what the picker sits on. Looked up by label rather than index, so
   reordering RATIOS cannot quietly change the default. */
const DEFAULT_RATIO = "3:4";

function RatioGrid() {
  const [sel, setSel] = useState(() =>
    RATIOS.findIndex(([label]) => label === DEFAULT_RATIO),
  );
  return (
    <div className="ncv-ar">
      {RATIOS.map(([label, w, h], i) => (
        <button
          key={label}
          type="button"
          aria-pressed={i === sel}
          className={i === sel ? "is-sel" : undefined}
          onClick={() => setSel(i)}
        >
          <i style={{ width: w, height: h }} />
          <em>{label}</em>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------ generating ---- */
/* Lines of the skeleton that stands in for generated copy, as a fraction of the
   box — a ragged right edge, so it reads as prose rather than as a table. */
const SKEL_LINES = ["100%", "100%", "92%", "68%", "100%", "84%", "46%"];

/* The two layers of a step that generates: what it produced, hidden until it
   has, and the skeleton over the top. */
const Generating = ({
  children,
  block = false,
  lines = 4,
}: {
  children: ReactNode;
  /** a solid frame rather than lines of type, for a step that returns media */
  block?: boolean;
  lines?: number;
}) => (
  <>
    <div data-generated style={{ opacity: 1 }}>
      {children}
    </div>
    <div className={block ? "ncv-skel is-block" : "ncv-skel"} data-skeleton>
      {block ? (
        <Skeleton className="h-full w-full rounded-[6px]" />
      ) : (
        SKEL_LINES.slice(0, lines).map((w, i) => (
          <Skeleton key={i} className="h-[6px] rounded-[3px]" style={{ width: w }} />
        ))
      )}
    </div>
  </>
);

/* ----------------------------------------------------------- the graph ---- */

const BASE = "/case-studies/adaptive-intelligence";
/* what an operator hands the workflow */
const PRODUCT = `${BASE}/input-mokobara-bag.webp`;
const LOGO = `${BASE}/input-mokobara-logo.webp`;
/* and what comes back out of it */
const HERO = `${BASE}/workflow-hero.webp`;
const REVEAL = `${BASE}/workflow-reveal.webm`;
const REVEAL_POSTER = `${BASE}/workflow-reveal-poster.webp`;

type NodeSpec = {
  id: string;
  x: number;
  y: number;
  w: number;
  title: string;
  icon?: ReactNode;
  /** the single output socket, on the right edge */
  out?: Sock;
  /** input sockets down the left edge, top to bottom. Not all are wired — the
      graph shows the slots the step exposes, the same as the product does. */
  sockets?: Sock[];
  face: ReactNode;
  foot?: (string | [string, "off"])[];
};

const NODES: NodeSpec[] = [
  {
    id: "n1",
    x: 328,
    y: 436,
    w: 168,
    out: "green",
    title: "Aspect Ratio",
    face: <RatioGrid />,
  },
  {
    id: "n2",
    x: 56,
    y: 257,
    w: 250,
    out: "blue",
    title: "Upload Product Image and Brand Logo",
    face: (
      <div className="ncv-thumbs">
        <div className="ncv-thumb is-light">
          {/* plain img: these are 80px thumbnails already sized for the slot,
              and the optimizer would only re-encode them */}
          <img src={PRODUCT} alt="The product photograph an operator uploads" />
        </div>
        <div className="ncv-thumb is-alpha">
          <img src={LOGO} alt="The brand logo an operator uploads" />
        </div>
      </div>
    ),
    foot: ["+ Add variable"],
  },
  {
    id: "n3",
    x: 329,
    y: 71,
    w: 180,
    out: "green",
    title: "Brand Positioning",
    face: (
      <div className="ncv-field h1">
        <p>
          Input Image 1 is the luxury product photograph. Input Image 2 is the
          brand logo.
        </p>
        <p>
          Identify the product category, select the optimal scene, and output
          the complete prompt package during the event.
        </p>
      </div>
    ),
    foot: ["+ Add variable"],
  },
  {
    id: "n4",
    x: 564,
    y: 127,
    w: 196,
    out: "green",
    icon: <Spark />,
    title: "Product Mockup",
    sockets: ["green", "blue"],
    face: (
      <div className="ncv-field h2">
        <Generating lines={7}>
          <p>Category: premium travel backpack. Brand: Mokobara.</p>
          <p>
            Scene: a dark green mirrored set, one key light from above, the bag
            centred on a reflective floor. Palette taken from the product&rsquo;s
            own olive and pale sage.
          </p>
        </Generating>
      </div>
    ),
    foot: ["+ Add another image input"],
  },
  {
    id: "n5",
    x: 819,
    y: 56,
    w: 294,
    out: "green",
    title: "Prompt",
    face: (
      <div className="ncv-field h1">
        <p>
          Reference Image 1: The canonical hero scene — match the product,
          scene, lighting, atmosphere and palette exactly as shown throughout
          all shots. Reference Image 2: Brand logo. Reference Image 3: The
          product.
        </p>
        <p>Shot 1 (0:00–0:03)</p>
      </div>
    ),
    foot: ["+ Add variable"],
  },
  {
    id: "n6",
    x: 819,
    y: 286,
    w: 284,
    out: "blue",
    icon: <Spark />,
    title: "Nano Banana - Flash",
    sockets: ["green", "blue"],
    face: (
      <div className="ncv-out">
        <Generating block>
          <img
            src={HERO}
            alt="The frame the image model returned: the bag lit in a dark green set, reflected in the floor"
          />
        </Generating>
      </div>
    ),
    foot: ["+ Add another image input"],
  },
  {
    id: "n7",
    x: 1194,
    y: 103,
    w: 284,
    out: "magenta",
    icon: <Seedance />,
    title: "Seedance 2.0 Reference Image",
    sockets: [
      "green",
      "blue",
      "blue",
      "violet",
      "orange",
      "green",
      "green",
      "green",
    ],
    face: (
      <div className="ncv-out">
        <Generating block>
          {/* the shared cover: plays while it is on screen, holds the poster
              under reduced motion, and never decodes off-screen */}
          <CoverVideo src={REVEAL} poster={REVEAL_POSTER} />
        </Generating>
      </div>
    ),
    foot: [
      "+ Add another reference image input",
      "+ Add another reference video input",
      ["+ Add another reference audio input", "off"],
    ],
  },
];

/* from, to, which input socket on the target, colour */
const EDGES: [string, string, number, Sock][] = [
  ["n3", "n4", 0, "green"],
  ["n2", "n4", 1, "blue"],
  ["n4", "n6", 0, "green"],
  ["n2", "n6", 1, "blue"],
  ["n5", "n7", 0, "green"],
  ["n6", "n7", 1, "blue"],
  ["n2", "n7", 5, "green"],
  ["n1", "n7", 6, "green"],
];

/* The order the graph assembles itself in. Dataflow order, so a card never
   arrives before the ones that feed it and every wire has both ends to land on
   by the time it draws: the uploads and the two settings first, then each step
   that consumes them, and the video model last. */
const BUILD = ["n2", "n1", "n3", "n4", "n6", "n5", "n7"];

/* Seconds between one card arriving and the next. The whole build lands in
   roughly BEAT x 7 plus the last card's wires — keep it brisk: the figure has
   to be assembled and running before a reader scrolls past it. */
const BEAT = 0.1;

/* Once the graph is wired, the steps that produce something resolve in order:
   the mockup writes its brief, then the image model returns a frame, then the
   video model renders the reveal. Each waits on the one before it, which is the
   actual dependency — so the figure runs the pipeline rather than describing it.
   Until a step resolves it shows a skeleton. */
const GENERATES = ["n4", "n6", "n7"];
/* Seconds between one step resolving and the next starting to. Each cross-fade
   takes about half of this, so the gap is what is left to read the result
   before the next arrives — tighten it much further and the three stop landing
   as three. */
const GEN_GAP = 1;


const ORDER_INDEX = new Map(BUILD.map((id, i) => [id, i]));

/* In the column, a wire between neighbours can run straight down the gap. One
   that skips past a card cannot — it would cross whatever sits between, and a
   wire crossing behind an opaque card reads as two stray marks rather than one
   connection. Those bow out through the gutter instead, a lane apiece so they
   stay off each other. */
const LANES = (() => {
  const lanes = new Map<number, number>();
  EDGES.forEach(([from, to], i) => {
    const span = (ORDER_INDEX.get(to) ?? 0) - (ORDER_INDEX.get(from) ?? 0);
    if (span > 1) lanes.set(i, 12 + lanes.size * 7);
  });
  return lanes;
})();

/* How far along its edge an input socket sits: the stack spans 28%–72%, so it
   stays optically centred whatever the card's content settles at. Which edge
   that is belongs to CSS — down the left side normally, across the top once the
   graph is flowing vertically — so this feeds a custom property rather than a
   property. */
const sockAt = (i: number, count: number) =>
  count > 1 ? `${28 + i * (44 / (count - 1))}%` : "50%";

/* ------------------------------------------------------------ component --- */

export function WorkflowCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const outRefs = useRef(new Map<string, HTMLSpanElement>());
  const inRefs = useRef(new Map<string, HTMLSpanElement>());
  const pathRefs = useRef(new Map<number, SVGPathElement>());

  useEffect(() => {
    const host = hostRef.current;
    const stage = stageRef.current;
    if (!host || !stage) return;

    gsap.registerPlugin(Draggable);

    const mq = window.matchMedia(NARROW);
    /* which arrangement is live, and the canvas width that goes with it — both
       read by the helpers below, both refreshed when the breakpoint flips */
    let vertical = mq.matches;
    let canvasW = vertical ? W_M_MIN : W;
    /* the column's arrangement depends on its width, not just its scale, so a
       resize has to be told apart from a reflow */
    let lastW = 0;

    /* A socket's centre in design pixels. offsetLeft/offsetTop are immune to
       the scale on the host, and the drag offset is read off the transform. */
    const centre = (node: HTMLElement, sock: HTMLElement) => {
      const dx = Number(gsap.getProperty(node, "x")) || 0;
      const dy = Number(gsap.getProperty(node, "y")) || 0;
      return {
        x: node.offsetLeft + dx + sock.offsetLeft + sock.offsetWidth / 2,
        y: node.offsetTop + dy + sock.offsetTop + sock.offsetHeight / 2,
      };
    };

    const paint = () => {
      EDGES.forEach(([from, to, index], i) => {
        const path = pathRefs.current.get(i);
        const fromNode = nodeRefs.current.get(from);
        const toNode = nodeRefs.current.get(to);
        const out = outRefs.current.get(from);
        const into = inRefs.current.get(`${to}:${index}`);
        if (!path || !fromNode || !toNode || !out || !into) return;

        const a = centre(fromNode, out);
        const b = centre(toNode, into);

        if (vertical) {
          // flowing down the column: out of the source's underside, into the
          // target's top edge
          const lane = LANES.get(i);

          if (lane === undefined) {
            const k = Math.max(46, Math.min(Math.abs(b.y - a.y) * 0.42, 220));
            path.setAttribute(
              "d",
              `M${a.x},${a.y} C${a.x},${a.y + k} ${b.x},${b.y - k} ${b.x},${b.y}`,
            );
            return;
          }

          /* A lane wire turns into the gutter, runs it, and turns back out.
             One curve could not do this: the middle of a cubic is pulled by its
             own endpoints, so with both ends out at the cards it bulged back
             over them however far left the handles went. Three segments pin the
             middle to the lane instead — and because each turn starts and ends
             travelling straight down, the joins are invisible. */
          const r = 28;
          path.setAttribute(
            "d",
            `M${a.x},${a.y} C${a.x},${a.y + r} ${lane},${a.y + r} ${lane},${a.y + r * 2}` +
              ` L${lane},${b.y - r * 2}` +
              ` C${lane},${b.y - r} ${b.x},${b.y - r} ${b.x},${b.y}`,
          );
          return;
        }

        // the handle grows with the span, so short hops stay tight and long
        // ones still leave the socket horizontally
        const k = Math.max(
          46,
          Math.min(Math.hypot(b.x - a.x, b.y - a.y) * 0.46, 190),
        );
        path.setAttribute(
          "d",
          `M${a.x},${a.y} C${a.x + k},${a.y} ${b.x - k},${b.y} ${b.x},${b.y}`,
        );
      });
    };

    const fit = () => {
      const { width } = host.getBoundingClientRect();
      if (!width) return;

      if (vertical) {
        // drawn at 1:1 — the whole point of the column — and centred in
        // whatever room is left over
        stage.style.transform = "none";
        stage.style.left = `${Math.max(0, Math.round((width - canvasW) / 2))}px`;
        return;
      }

      // the host carries the canvas's own ratio, so fitting the width fits
      // the height with it
      stage.style.left = "0px";
      stage.style.transform = `scale(${width / canvasW})`;
    };

    /* The two arrangements. Wide: the canvas set by hand in NODES. Narrow: a
       staggered column, stacked in dataflow order so reading down the page is
       reading the pipeline, alternating sides so every wire has a curve to it.
       The column is measured rather than authored — the cards reflow narrower
       here, and their own heights decide where the next one starts and how tall
       the canvas ends up. */
    const layout = () => {
      stage.classList.toggle("is-vertical", vertical);

      if (!vertical) {
        canvasW = W;
        NODES.forEach(({ id, x, y }) => {
          const el = nodeRefs.current.get(id);
          if (!el) return;
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
        });
        stage.style.width = `${W}px`;
        stage.style.height = `${H}px`;
        host.style.height = "";
        host.style.aspectRatio = `${W} / ${H}`;
        return;
      }

      /* Laid out at the width it will be displayed at, so the scale comes out
         at 1 and the type is exactly the size it was drawn at — on a phone and
         on a tablet alike. Scaling a fixed column would have made the type
         either too small or, on a wide tablet, absurdly large. */
      const room = Math.round(host.getBoundingClientRect().width) || W_M_MIN;
      const width = Math.min(room, W_M_MAX);
      canvasW = width;
      stage.style.width = `${width}px`;

      const cards = BUILD.map((id) => nodeRefs.current.get(id)).filter(
        (el): el is HTMLDivElement => Boolean(el),
      );
      // measured in one pass after the width is set — the cards are capped
      // against it in CSS — and before anything moves, so placing a card cannot
      // invalidate the next card's measurement
      const box = cards.map((el) => ({
        w: el.offsetWidth,
        h: el.offsetHeight,
      }));

      let y = PAD_M;
      cards.forEach((el, i) => {
        el.style.left = `${
          i % 2 === 0 ? GUTTER_M : width - PAD_M - box[i].w
        }px`;
        el.style.top = `${y}px`;
        y += box[i].h + GAP_M;
      });

      const h = y - GAP_M + PAD_M;
      stage.style.height = `${h}px`;
      // an outright height rather than a ratio: at 1:1 the column's height is
      // its own, and has nothing to do with how wide the page lets it be
      host.style.aspectRatio = "auto";
      host.style.height = `${h}px`;
    };

    layout();
    lastW = Math.round(host.getBoundingClientRect().width);
    fit();
    paint();

    /* ---- the build-in ----------------------------------------------------
       The graph assembles itself: a card fades up, its contents rise a part at
       a time, then the wires that feed it draw out of the cards that feed it.
       Held until the figure is on screen, so the reader watches it happen
       rather than finding it already built. */

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /* a card's own children, minus the sockets — header, rule, field, footer */
    const partsOf = (card: HTMLElement) =>
      [...card.children].filter((c) => !c.classList.contains("ncv-sock"));
    const socksOf = (card: HTMLElement) => card.querySelectorAll(".ncv-sock");

    const paths = EDGES.map((_, i) => pathRefs.current.get(i)).filter(
      (p): p is SVGPathElement => Boolean(p),
    );
    /* the wires landing on each card, in the order they are declared */
    const wiresInto = (id: string) =>
      EDGES.reduce<number[]>(
        (acc, [, to], edge) => (to === id ? [...acc, edge] : acc),
        [],
      );

    const allSocks = [...stage.querySelectorAll(".ncv-sock")];

    /* With the build done, the stylesheet takes the resting look back. Both
       halves matter: a solid wire has to survive the next repaint, and a
       connector's :hover can only beat its resting opacity once the inline one
       GSAP left behind is gone. `is-built` then arms the hover transition,
       which would otherwise have been fighting the tween frame by frame. */
    const handBack = () => {
      gsap.set(paths, { clearProps: "strokeDasharray,strokeDashoffset" });
      gsap.set(allSocks, { clearProps: "opacity" });
      stage.classList.add("is-built");
    };

    /* The stylesheet owns both resting opacities — the card's and its connector
       nodes' — and these read them back, so neither number is written twice. */
    const rest = new Map<string, number>();
    let sockRest = 1;

    if (!reduced) {
      // hidden synchronously, before the canvas is shown, so nothing is ever
      // glimpsed in its finished state first
      NODES.forEach(({ id }) => {
        const card = nodeRefs.current.get(id);
        if (!card) return;
        const socks = socksOf(card);
        rest.set(id, Number(getComputedStyle(card).opacity) || 1);
        if (socks[0]) sockRest = Number(getComputedStyle(socks[0]).opacity) || 1;
        gsap.set(card, { opacity: 0, y: 14 });
        gsap.set(partsOf(card), { opacity: 0, y: 8 });
        gsap.set(socks, { opacity: 0 });
      });
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      // the stylesheet holds the resolved state, so the pending one is set here
      // and only here — with no JS the outputs are simply present
      GENERATES.forEach((id) => {
        const card = nodeRefs.current.get(id);
        if (!card) return;
        gsap.set(card.querySelectorAll("[data-generated]"), { opacity: 0 });
        gsap.set(card.querySelectorAll("[data-skeleton]"), { opacity: 1 });
      });
    }

    // the cards are placed and the wires measured: show the canvas
    stage.classList.add("is-ready");

    let tl: gsap.core.Timeline | null = null;
    let gl: gsap.core.Timeline | null = null;

    /* Phase two, once every card is up and every wire drawn: each step that
       produces something swaps its skeleton for the thing it produced, in
       pipeline order and GEN_GAP apart. Nothing here is geometry, so a card
       being dragged mid-sequence cannot disturb it — which is why this is its
       own timeline rather than the tail of the build's. */
    const generate = () => {
      const g = gsap.timeline();

      GENERATES.forEach((id, i) => {
        const card = nodeRefs.current.get(id);
        if (!card) return;
        const skel = card.querySelectorAll("[data-skeleton]");
        const out = card.querySelectorAll("[data-generated]");
        if (!skel.length || !out.length) return;

        const at = i * GEN_GAP;
        g.to(skel, { opacity: 0, duration: 0.45, ease: "power2.out" }, at).to(
          out,
          { opacity: 1, duration: 0.55, ease: "power2.out" },
          at + 0.1,
        );
      });

      return g;
    };

    const build = () => {
      const t = gsap.timeline({
        // the cards lift as they arrive, so the wires have to follow them up
        onUpdate: paint,
        onComplete: () => {
          handBack();
          // the graph is connected; now let it run
          if (!gl) gl = generate();
        },
      });

      BUILD.forEach((id, i) => {
        const card = nodeRefs.current.get(id);
        if (!card) return;
        const at = i * BEAT;

        t.to(
          card,
          {
            opacity: rest.get(id) ?? 1,
            y: 0,
            duration: 0.38,
            ease: "power2.out",
          },
          at,
        )
          .to(
            partsOf(card),
            {
              opacity: 1,
              y: 0,
              duration: 0.26,
              stagger: 0.045,
              ease: "power2.out",
            },
            at + 0.07,
          )
          .to(socksOf(card), { opacity: sockRest, duration: 0.24 }, at + 0.14);

        wiresInto(id).forEach((edge, k) => {
          const p = pathRefs.current.get(edge);
          if (!p) return;
          t.to(
            p,
            { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" },
            at + 0.15 + k * 0.06,
          );
        });
      });

      tl = t;
    };

    /* Reaching for a card mid-build means the reader wants the graph, not the
       show: land it all at once and hand over. */
    const settle = () => {
      if (!tl || tl.progress() === 1) return;
      tl.progress(1);
      handBack();
    };

    let io: IntersectionObserver | null = null;
    if (!reduced) {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          build();
        },
        // A column taller than the viewport would never reach a quarter of
        // itself, so the narrow arrangement triggers as soon as it shows. The
        // wide one waits for less than it used to: the build reads as late if
        // it only starts once the figure is well up the screen.
        { threshold: vertical ? 0.05 : 0.15 },
      );
      io.observe(host);
    }

    const ro = new ResizeObserver(() => {
      const w = Math.round(host.getBoundingClientRect().width);
      // width drives where the cards sit in the column, so that needs a full
      // re-lay-out; height alone is this observer being woken by its own work
      if (vertical && w !== lastW) layout();
      lastW = w;
      fit();
      paint();
    });
    ro.observe(host);

    const drags = [...nodeRefs.current.values()].flatMap((el) =>
      Draggable.create(el, {
        type: "x,y",
        bounds: stage,
        // a press that lands on the ratio buttons is a click, not a drag
        dragClickables: false,
        onPress: () => {
          settle();
          el.classList.add("is-dragging");
          el.style.zIndex = "999";
        },
        onDrag: paint,
        onRelease: () => {
          el.classList.remove("is-dragging");
          el.style.zIndex = "";
        },
      }),
    );

    /* Keyboard parity with the drag: a focused card moves on the arrows, and
       a coarser step on shift. */
    const onKeyDown = (event: KeyboardEvent) => {
      const el = event.currentTarget as HTMLDivElement;
      const step = event.shiftKey ? 24 : 5;
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = delta[event.key];
      if (!move) return;
      event.preventDefault();
      settle();
      gsap.set(el, {
        x: (Number(gsap.getProperty(el, "x")) || 0) + move[0],
        y: (Number(gsap.getProperty(el, "y")) || 0) + move[1],
      });
      paint();
    };

    const cards = [...nodeRefs.current.values()];
    cards.forEach((el) => el.addEventListener("keydown", onKeyDown));

    /* Crossing the breakpoint swaps the arrangement under everything: land any
       build in flight first, because its wire lengths were measured against the
       old routing, then re-measure and let the drags pick up the new bounds. */
    const onMode = () => {
      settle();
      vertical = mq.matches;
      // a card dragged in one arrangement has no business keeping that offset
      // in the other
      gsap.set(cards, { x: 0, y: 0 });
      layout();
      fit();
      paint();
      drags.forEach((d) => d.update());
    };
    mq.addEventListener("change", onMode);

    return () => {
      mq.removeEventListener("change", onMode);
      io?.disconnect();
      ro.disconnect();
      tl?.kill();
      gl?.kill();
      drags.forEach((d) => d.kill());
      cards.forEach((el) => el.removeEventListener("keydown", onKeyDown));
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="ncv relative w-full overflow-hidden"
      // the canvas owns the figure's shape, and it changes with the
      // arrangement, so the ratio is set here rather than by the caller
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <p className="sr-only">
        The reveal workflow as a node graph. An aspect ratio and an upload step
        holding the product photograph and the brand logo feed a brand
        positioning step; positioning and the uploads feed a product mockup,
        the mockup and the uploads feed an image model, and the prompt, the
        model&rsquo;s frame and the original uploads feed the video model that
        renders the reveal.
      </p>

      <div
        ref={stageRef}
        className="ncv-stage"
        style={{ width: W, height: H }}
      >
        {/* No viewBox: the svg fills a stage that is already sized in design
            pixels, so its user units are those pixels and the wire coordinates
            need no mapping. A viewBox would have to be rewritten every time the
            arrangement changes the canvas, and a stale one silently squashes
            every wire into the wrong box. */}
        <svg className="ncv-wires">
          {EDGES.map(([from, to, index, colour], i) => (
            <path
              key={`${from}-${to}-${index}`}
              ref={(el) => {
                if (el) pathRefs.current.set(i, el);
                else pathRefs.current.delete(i);
              }}
              stroke={wire(colour)}
            />
          ))}
        </svg>

        {NODES.map((node) => (
          <div
            key={node.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
              else nodeRefs.current.delete(node.id);
            }}
            className="ncv-node"
            style={{ left: node.x, top: node.y, width: node.w }}
            tabIndex={0}
            role="group"
            aria-label={`${node.title}. Drag, or move with the arrow keys.`}
          >
            <div className="ncv-hd">
              {node.icon}
              <span className="ncv-t">{node.title}</span>
            </div>
            <div className="ncv-rule" />
            {node.face}
            {node.foot && (
              <div className="ncv-foot">
                {node.foot.map((item) => {
                  const [label, state] = Array.isArray(item)
                    ? item
                    : [item, undefined];
                  return (
                    <span key={label} className={state === "off" ? "is-off" : undefined}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            {node.sockets?.map((colour, i, all) => (
              <span
                key={i}
                ref={(el) => {
                  const key = `${node.id}:${i}`;
                  if (el) inRefs.current.set(key, el);
                  else inRefs.current.delete(key);
                }}
                className="ncv-sock is-in"
                style={
                  {
                    borderColor: wire(colour),
                    "--ncv-at": sockAt(i, all.length),
                  } as CSSProperties
                }
              />
            ))}
            {node.out && (
              <span
                ref={(el) => {
                  if (el) outRefs.current.set(node.id, el);
                  else outRefs.current.delete(node.id);
                }}
                className="ncv-sock is-out"
                style={{ borderColor: wire(node.out) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
