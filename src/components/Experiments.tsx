"use client";

// Experiments — a bento of work and things this site is built from, each tile
// running live or holding a still rather than being a screenshot of one.
//
// The wall is full-bleed — no horizontal padding, so it runs to both edges of
// the viewport like the reference bento.
//
// Layout is justified rows, not a grid of fixed cells (see .exp-gallery). Each
// tile declares ASPECT — the real width ÷ height of the thing inside it — and
// takes width in proportion, so every tile in a row shares one height and the
// media fills its tile exactly. Nothing is cropped to fit a cell.
//
// A row's height is (row width) ÷ (sum of its aspects), so rows are composed by
// that sum rather than by tile count: a row summing to ~3.7 runs tall, one
// summing to ~5.5 runs short. The four rows below sum to 4.06 / 4.11 / 5.46 /
// 3.76 — at 1600px that is 394 / 389 / 293 / 426px, so the first two sit level
// with each other and the gradient band stays the flat one.
//
// Below 640px each tile takes a line to itself, full width, still uncropped.

import Image from "next/image";

import { pingPongFrames } from "@/lib/dot-frames";
import AsciiArt from "./AsciiArt";
import { CoverVideo } from "./CoverVideo";
import { DotLoader } from "./DotLoader";
import GlitchInitial from "./GlitchInitial";
import { ShaderBackground } from "./ShaderBackground";
import { ExperimentCard } from "./ExperimentCard";

// measured from the files themselves — if you swap an asset, remeasure
const ASPECT = {
  asciiArt: 1024 / 585,
  avatar: 236 / 214,
  sunset: 1184 / 1184,
  // 82 columns x 34 rows of glyphs, each cell 1.995x as tall as it is wide.
  // The field fits its box rather than stretching, so the tile carries the
  // lattice's own ratio or it sits in dead ground.
  asciiCortex: 82 / (34 * 1.995),
  // the board fits its own 1600x900 stage to the frame it is given, so the
  // tile has to be exactly 16:9 or it sits letterboxed inside its own tile
  agents: 1600 / 900,
  luxury: 1112 / 834,
  // The shader fills whatever box it is given, so it is free to be the wide
  // one. Raising its share also raises the row's sum, which pulls the whole
  // row shorter — the planet beside it stops towering.
  shader: 2.2,
  golden: 960 / 594,
  acdc: 214 / 299,
  bobMarley: 1468 / 1028,
  space: 553 / 438,
  weather: 1584 / 1586,
  pingPong: 1, // the dot matrix is square
} as const;

// A full-bleed picture tile: the stage's own padding is bypassed by absolute
// positioning, so the image runs corner to corner. Because the tile carries the
// image's own aspect ratio, object-cover has nothing left to crop.
function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        // These are hand-sized webp files, none over 190KB. Left to the
        // optimizer, the browser picks a srcset entry before the flex row has
        // resolved the tile's width and lands on w=3840 for a 960px source —
        // a huge upscale that then takes seconds to arrive.
        unoptimized
        className="object-cover"
      />
    </div>
  );
}

export function Experiments() {
  return (
    // no horizontal padding: the wall runs the full viewport width, edge to
    // edge, and only the heading keeps the page's gutter
    <section id="experiments" className="relative scroll-mt-20 py-20 sm:py-28">
      <h2 className="mb-6 px-4 font-hero-1 text-4xl leading-none text-fg sm:mb-8 sm:text-5xl">
        <GlitchInitial letter="E" intervalMs={6400} />
        xperiments
      </h2>

      {/* keeps the page's gutter like the heading — only the wall below is
          full-bleed */}
      <div className="mb-12 max-w-2xl space-y-5 px-4 text-xl leading-snug tracking-tight text-fg sm:mb-16 sm:text-2xl">
        <p>
          Not everything I make needs to become a product.
          {/* the second sentence gets its own line */}
          <br />
          Sometimes I just want to see if an idea works.
        </p>
        <p>
          I experiment with code, interactions, graphics, AI, WebGL, and
          whatever else catches my attention.
        </p>
      </div>

      <div className="exp-gallery">
        {/* Σ 4.06 */}
        <div className="exp-row">
          {/* opens full size like the playground — the preview is sandboxed,
              and the field is worth more than a tile's worth of it */}
          <ExperimentCard
            title="ASCII Cortex"
            description="A glyph field breathing on one quantised clock. Rings lag by radius, then converge into unison."
            aspect={ASPECT.asciiCortex}
            href="/experiments/ascii-cortex.html"
            // the glow is additive over its own near-black ground, in either
            // theme — inverted it would be light on light
            className="exp-on-dark"
            component={
              <iframe
                src="/experiments/ascii-cortex.html"
                title="ASCII Cortex"
                loading="lazy"
                sandbox="allow-scripts"
                scrolling="no"
                className="absolute inset-0 block h-full w-full border-0"
              />
            }
          />

          {/* the renderer's own output, filling the tile — the playground's
              chrome lives behind the corner arrow, not in the preview */}
          <ExperimentCard
            title="ASCII Art Playground"
            description="Drop an image, dial the renderer in live, and read back the props. Click to open."
            aspect={ASPECT.asciiArt}
            href="/experiments/ascii-playground.html"
            // the render needs its dark ground in either theme
            className="exp-on-dark"
            component={
              <div className="absolute inset-0">
                <AsciiArt src="/experiments/ascii-art.webp" />
              </div>
            }
          />

          <ExperimentCard
            title="8bitavatar"
            description="A sprite self-portrait, four colours and a haircut."
            aspect={ASPECT.avatar}
            component={
              <PhotoTile
                src="/bento/8bit-avatar.webp"
                alt="Pixel-art avatar in a red shirt"
              />
            }
          />
        </div>

        {/* Σ 4.11 — level with the row above it */}
        <div className="exp-row">
          <ExperimentCard
            title="Ping Pong"
            description="A rally on a 7×7 matrix. Every frame is just the list of dots lit in it."
            aspect={ASPECT.pingPong}
            component={
              // zoomed in .exp-pong so the matrix reads at the scale of the
              // stills around it, without touching the component's own sizing
              <div className="exp-pong">
                <DotLoader
                  frames={pingPongFrames}
                  duration={110}
                  // colour lives in .exp-dot so it follows the theme; fixed
                  // neutrals inverted in light mode
                  dotClassName="exp-dot"
                />
              </div>
            }
          />

          {/* opens full size like the playground — the preview is sandboxed
              and covered by the tile's own hit area, so the board can only
              really be worked with in the viewer */}
          <ExperimentCard
            title="Agents Mode"
            description="A live agent board. Tasks move between columns on their own, with a notification ticker."
            aspect={ASPECT.agents}
            href="/experiments/shopos-kanban.html"
            // the board is a dark UI in either theme
            className="exp-on-dark"
            component={
              <iframe
                src="/experiments/shopos-kanban.html"
                title="ShopOS agent board"
                loading="lazy"
                sandbox="allow-scripts"
                scrolling="no"
                className="absolute inset-0 block h-full w-full border-0"
              />
            }
          />

          <ExperimentCard
            title="Luxury Reveal Shades"
            description="One of the reveal pipelines from Adaptive Intelligence, running its output."
            aspect={ASPECT.luxury}
            component={<CoverVideo src="/bento/luxury-reveal-shades.webm" />}
          />
        </div>

        {/* Σ 5.46 — the flattest row: a wide gradient band */}
        <div className="exp-row">
          <ExperimentCard
            title="Shader Waves"
            description="A WebGL wave field: one canvas, one fragment shader, no dependencies."
            aspect={ASPECT.shader}
            component={
              <div className="absolute inset-0">
                <ShaderBackground />
              </div>
            }
          />

          <ExperimentCard
            title="Space"
            description="A planet mark, held still between the moving tiles."
            aspect={ASPECT.space}
            component={
              <PhotoTile src="/bento/space.webp" alt="Line-drawn planet mark" />
            }
          />

          {/* opens as a video, with controls, rather than a frame */}
          <ExperimentCard
            title="Weather Whiz"
            description="A weather app, playing through its own forecast."
            aspect={ASPECT.weather}
            href="/bento/weather-whiz.webm"
            component={<CoverVideo src="/bento/weather-whiz.webm" />}
          />

          <ExperimentCard
            title="Sunset"
            description="A sky running its full fade, on a loop."
            aspect={ASPECT.sunset}
            component={<CoverVideo src="/bento/sunset.webm" />}
          />
        </div>

        {/* Σ 3.76 — the drawings close the wall */}
        <div className="exp-row">
          <ExperimentCard
            title="Golden Ratio"
            description="The School of Athens with the spiral laid over it."
            aspect={ASPECT.golden}
            component={
              <PhotoTile
                src="/bento/golden-ratio.webp"
                alt="Raphael's School of Athens with a golden spiral overlaid"
              />
            }
          />

          <ExperimentCard
            title="AC DC"
            description="Ballpoint on paper, drawn in one sitting."
            aspect={ASPECT.acdc}
            component={
              <PhotoTile
                src="/bento/acdc.webp"
                alt="Pen drawing of Angus Young playing guitar"
              />
            }
          />

          <ExperimentCard
            title="Bob Marley"
            description="A graphite study, dropped in as a still frame among the live tiles."
            aspect={ASPECT.bobMarley}
            component={
              <PhotoTile
                src="/bento/bob-marley.webp"
                alt="Graphite drawing of Bob Marley singing"
              />
            }
          />
        </div>
      </div>
    </section>
  );
}
