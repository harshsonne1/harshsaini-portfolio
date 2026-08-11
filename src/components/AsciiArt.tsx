"use client";

// AsciiArt — real-time canvas ASCII renderer with a travelling glow band.
//
// Ported from the original Solid.js component. The render loop is unchanged;
// only the framework wrapper differs:
//   onMount/onCleanup  -> useEffect + its cleanup
//   mergeProps         -> default parameter values
//   let ref / ref={}   -> useRef
//   class              -> className
//   reactive props     -> a ref the loop reads, so live prop changes still
//                         apply without tearing down the canvas
//
// Two additions, both about not burning a CPU core on a portfolio page: the
// loop pauses whenever the canvas is off-screen, and reduced-motion draws a
// single static frame instead of animating the scan band.

import { useEffect, useRef } from "react";

type AsciiArtProps = {
  /** image URL — must be same-origin, the renderer reads pixels back */
  src: string;
  /** character cell height in px */
  fontSize?: number;
  /** 0–1, how much of the photo shows through */
  imageOpacity?: number;
  /** 0–1, base character brightness */
  charOpacity?: number;
  /** 0–1, scan-band glow strength */
  glow?: number;
  /** 0–1, glow band height as a fraction of height */
  glowSpread?: number;
  /** px per frame; 0 disables the scan */
  scanSpeed?: number;
  /** RGB lift on characters (0–140) */
  charLift?: number;
  /** sparse -> dense */
  charset?: string;
  className?: string;
};

export default function AsciiArt({
  src,
  fontSize = 8,
  imageOpacity = 0.55,
  charOpacity = 0.5,
  glow = 0.55,
  glowSpread = 0.14,
  scanSpeed = 1.2,
  charLift = 70,
  charset = " ..::++xX$&#8@",
  className = "",
}: AsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // the loop reads settings through a ref so changing a prop doesn't restart
  // the effect (and re-decode the image) mid-animation
  const cfg = useRef({
    fontSize,
    imageOpacity,
    charOpacity,
    glow,
    glowSpread,
    scanSpeed,
    charLift,
    charset,
  });
  cfg.current = {
    fontSize,
    imageOpacity,
    charOpacity,
    glow,
    glowSpread,
    scanSpeed,
    charLift,
    charset,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId = 0;
    let scanY = 0;
    let running = false;
    let srcCanvas: HTMLCanvasElement | null = null;
    let pixelData: Uint8ClampedArray | null = null;

    const img = new Image();
    img.crossOrigin = "anonymous";

    function buildSource() {
      if (!canvas || !img.naturalWidth) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width < 2 || canvas.height < 2) return;

      srcCanvas = document.createElement("canvas");
      srcCanvas.width = canvas.width;
      srcCanvas.height = canvas.height;
      const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
      if (!srcCtx) return;
      srcCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // cached once — reading pixels per character would be far too slow
      pixelData = srcCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const p = cfg.current;

      ctx.clearRect(0, 0, W, H);

      if (p.imageOpacity > 0 && srcCanvas) {
        ctx.globalAlpha = p.imageOpacity;
        ctx.drawImage(srcCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }
      if (!pixelData) return;

      const fs = p.fontSize * dpr;
      const cw = fs * 0.6;
      const ch = fs;
      const cols = Math.floor(W / cw);
      const rows = Math.floor(H / ch);
      const chars = p.charset;

      ctx.font = `${fs}px ui-monospace, monospace`;
      ctx.textBaseline = "top";

      for (let r = 0; r < rows; r++) {
        const dist = Math.abs(r * ch - scanY);
        const g = Math.max(0, 1 - dist / (H * p.glowSpread)) * p.glow;

        for (let c = 0; c < cols; c++) {
          const px = Math.min(Math.floor(c * cw + cw / 2), W - 1);
          const py = Math.min(Math.floor(r * ch + ch / 2), H - 1);
          const i = (py * W + px) * 4;

          const R = pixelData[i];
          const G = pixelData[i + 1];
          const B = pixelData[i + 2];

          const lum = 0.299 * R + 0.587 * G + 0.114 * B;
          const ci = Math.floor((lum / 255) * (chars.length - 1));
          const char = chars[ci];
          if (char === " ") continue;

          const alpha = Math.min(1, p.charOpacity * (lum / 255) + g);
          const lift = p.charLift;

          ctx.fillStyle =
            `rgba(${Math.min(255, R + lift)},${Math.min(255, G + lift)},` +
            `${Math.min(255, B + lift)},${alpha.toFixed(2)})`;

          ctx.fillText(char, Math.floor(c * cw), Math.floor(r * ch));
        }
      }

      scanY = (scanY + p.scanSpeed * dpr) % H;
    }

    function frame() {
      draw();
      animId = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !pixelData) return;
      running = true;
      if (reduced) {
        draw(); /* one static pass, no loop */
        return;
      }
      animId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animId);
    }

    img.onload = () => {
      buildSource();
      stop();
      start();
    };
    img.src = src;

    const ro = new ResizeObserver(() => {
      if (!img.complete || !img.naturalWidth) return;
      buildSource();
      if (reduced) draw();
    });
    ro.observe(canvas);

    // thousands of fillText calls per frame is not something to run while the
    // card is parked off-screen
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0.01 },
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      img.onload = null;
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="ASCII art"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
