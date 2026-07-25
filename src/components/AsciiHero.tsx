"use client";

import { useEffect, useRef, useState } from "react";
import { HeroNav } from "./HeroNav";
import { HeroTitle } from "./HeroTitle";
import DecryptedText from "./DecryptedText";

/* =====================================================================
   ShopOS ASCII portrait engine (v16) ported to React.
   A WebGL2 "mis-registered print engine": the portrait is rendered as
   three offset ink plates of live ASCII glyphs. Pointer movement pushes
   a flow field that smears the glyphs. Runs in dark mode here (additive
   RGB glyphs on transparent black) so it blends into the page background.
   ===================================================================== */
type AsciiHeroHandle = {
  setImage: (src: string) => void;
  setTheme: (mode: "light" | "dark") => void;
  destroy: () => void;
};

function asciiHero(
  canvas: HTMLCanvasElement,
  opts: Record<string, number> = {},
  glowCanvas?: HTMLCanvasElement | null,
): AsciiHeroHandle | null {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: false,
    /* keep the drawing buffer so we can copy it into the bloom canvas */
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  /* downscaled 2D copy of the render, CSS-blurred into a CMYK bloom halo */
  const glowCtx = glowCanvas ? glowCanvas.getContext("2d") : null;

  const CFG = Object.assign(
    {
      cellDark: 5,
      cellLight: 5,
      distort: 0.042,
      chroma: 1.0,
      decay: 0.86,
      radius: 0.05,
      light: 1,
      idle: 0,
      flicker: 0.45 /* 0 = static, 1 = full shimmer */,
      zoom: 0.9,
      shiftY: 0.02 /* crop: <1 zooms in; shiftY>0 lifts the head */,
      misreg: 0.9 /* static plate offset, in cells */,
      inkStrength: 1.15,
      saturation: 1.9 /* light-mode chroma boost; 1 = off, higher = more vivid CMY */,
    },
    opts,
  );

  const VERT = `#version 300 es
void main(){
  vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position = vec4(p*2.0-1.0, 0.0, 1.0);
}`;
  const NOISE = `
float hash21(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p,p+34.23); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), u.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<4;i++){ v += a*vnoise(p); p = p*2.03 + 11.7; a *= 0.5; }
  return v;
}`;

  /* source pass -> .r lit field (dark mode), .g ink field (light mode) */
  const SRC_FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime, uUseImage, uImgAspect, uZoom, uShiftY;
uniform sampler2D uImage;
out vec4 o;
${NOISE}
float subj(vec2 iuv){ return texture(uImage, iuv).r; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;
  float sA = uRes.x / uRes.y;
  p.x *= sA;
  if(uUseImage > 0.5){
    vec2 iuv = uv - 0.5;
    if(sA > uImgAspect) iuv.x *= sA / uImgAspect;
    else                iuv.y *= uImgAspect / sA;
    iuv = iuv * uZoom + vec2(0.0, uShiftY);
    iuv += 0.5;
    float rawY = iuv.y;
    if(iuv.x<0.0||iuv.x>1.0||iuv.y>1.0){ o = vec4(0.0); return; }
    iuv.y = clamp(iuv.y, 0.0015, 1.0);       /* below image: repeat shirt row */
    float ext = smoothstep(-0.60, 0.02, rawY); /* extension fades toward bottom */
    vec4 c = texture(uImage, iuv);
    float L = c.r, A = c.a;

    /* 4-tap gradient: feature edges (brows, eyes, lips) */
    float d = 1.6/800.0;
    float ex = subj(iuv+vec2(d,0.0)) - subj(iuv-vec2(d,0.0));
    float ey = subj(iuv+vec2(0.0,d)) - subj(iuv-vec2(0.0,d));
    float edge = clamp((abs(ex)+abs(ey)) * 2.2, 0.0, 1.0);

    /* lit field: bright skin glows, shadow lift keeps hair alive */
    /* chiaroscuro: deepen shadows, expand highlights, radial face glow */
    float lit = pow(L, 1.42) * 1.35;
    lit += edge * 0.15;                        /* whisper of edge, shadows stay shadows */
    /* hair/beard band: dark-but-not-black tones lift into dim glyph texture
       instead of a void — the hair halo the reference has */
    float hairMask = smoothstep(0.64, 0.76, iuv.y);   /* top of head only */
    float band = smoothstep(0.015, 0.09, L) * (1.0 - smoothstep(0.09, 0.30, L));
    lit += band * 0.34 * hairMask;
    vec2 fc = iuv - vec2(0.5, 0.56);           /* face center in image space */
    float vig = smoothstep(0.66, 0.16, length(fc * vec2(1.0, 0.82)));
    lit *= (0.18 + 0.82 * vig);                /* light falls off the face into black */
    lit = max(lit, 0.07 * hairMask * A);       /* faint floor, hair region only */
    lit = clamp(lit, 0.0, 1.0) * A;

    /* ink field: lifted curve + edge boost, then a contrast expansion that
       fades bright skin toward empty and deepens hair/beard/brows/clothing */
    float ink = pow(clamp(1.0 - L, 0.0, 1.0), 0.80);
    ink = clamp(ink + edge*0.68, 0.0, 1.0);        /* features carry dense glyphs */
    ink = clamp((ink - 0.46) * 1.42 + 0.46, 0.0, 1.0); /* S-curve: skin fades, darks deepen */
    ink = max(ink, 0.012);                          /* whisper floor so skin nearly vanishes */
    ink *= A;

    o = vec4(lit * ext, ink * ext, edge * ext, 1.0);
    return;
  }
  /* procedural fallback */
  float n  = fbm(p*2.4 + uTime*0.07);
  float r  = length(p * vec2(1.0, 0.78));
  float shape = smoothstep(0.60 + n*0.16, 0.16, r);
  float tex = fbm(p*4.5 + vec2(0.0, -uTime*0.22));
  float ci = clamp(shape * (0.18 + 0.75*tex), 0.0, 1.0);
  o = vec4(ci, ci, 0.0, 1.0);
}`;

  const FLOW_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uRes, uMouse, uVel;
uniform float uDecay, uRadius;
out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 v = (texture(uPrev, uv).xy - 0.5) * 2.0;
  v *= uDecay;
  v -= sign(v) * min(abs(v), 0.0015);
  vec2 d = uv - uMouse;
  d.x *= uRes.x / uRes.y;
  float fall = exp(-dot(d,d) / (uRadius*uRadius));
  fall *= fall;
  v += uVel * fall;
  v = clamp(v, -0.98, 0.98);
  o = vec4(v*0.5 + 0.5, 0.0, 1.0);
}`;

  const OUT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSource, uFlow, uAtlas;
uniform vec2 uRes;
uniform float uCell, uGlyphs, uDistort, uChroma, uTime, uLight, uMisreg, uInk, uAnimT, uFlicker, uSat;
out vec4 o;
float hash21(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p,p+34.23); return fract(p.x*p.y); }

/* one ink plate: field value + its own glyph mask at this cell */
float plate(sampler2D src, sampler2D atlas, vec2 suv, vec2 ic, float glyphs, float fieldSel, float idxJit){
  vec2 f = texture(src, suv).rg;
  float v = mix(f.x, f.y, fieldSel);
  float idx = floor(pow(clamp(v,0.0,1.0), 0.82) * (glyphs - 1.0) + 0.5);
  idx = clamp(idx + idxJit, 0.0, glyphs - 1.0);
  float m = texture(atlas, vec2((idx + ic.x) / glyphs, ic.y)).r;
  return v * m;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 grid = uRes / uCell;
  vec2 cell = floor(uv * grid);
  vec2 cc = (cell + 0.5) / grid;
  vec2 ic = fract(uv * grid);
  vec2 cellUV = uCell / uRes;              /* one cell in uv units */

  vec2 flow = (texture(uFlow, cc).xy - 0.5) * 2.0;
  vec2 disp = flow * uDistort;
  float fl = length(flow);

  /* feature strength at this cell: brows, lashes, lips, beard, borders */
  float eF = texture(uSource, cc - disp).b;

  /* plate offsets: static misregistration + flow widens the split;
     feature edges split harder in light mode -> colored halos around
     hair, brows, lips, beard, neck line and the silhouette */
  float mr = uMisreg * mix(1.0, 1.9 + eF * 1.6, uLight) * (1.0 + fl * 7.0 * uChroma);
  vec2 offA = vec2(-0.62,  0.40) * cellUV * mr;
  vec2 offB = vec2( 0.0 ,  0.0 );
  vec2 offC = vec2( 0.58, -0.44) * cellUV * mr;

  float sel = step(0.5, uLight);           /* 0 = lit field, 1 = ink field */

  /* per-cell clock: every cell ticks at its own rate & phase, so the
     flicker is organic shimmer, never a synchronized strobe */
  float stp = floor(uAnimT * (0.8 + 3.0 * hash21(cell + 4.2)) + hash21(cell + 0.77) * 7.0);

  /* glyph swap: character changes on each tick (the "live signal" motion) */
  float idxJit = floor(hash21(cell + 31.7 + stp * 0.013) * 3.0) - 1.0;
  float pA = plate(uSource, uAtlas, cc - disp + offA, ic, uGlyphs, sel, idxJit);
  float pB = plate(uSource, uAtlas, cc - disp + offB, ic, uGlyphs, sel, idxJit);
  float pC = plate(uSource, uAtlas, cc - disp + offC, ic, uGlyphs, sel, idxJit);

  /* brightness shimmer, uFlicker scales depth; 0 = perfectly still */
  float jit = mix(1.0, 0.82 + 0.26 * hash21(cell + stp * 0.071 + 9.3), uFlicker);

  /* per-plate random gain per cell — imbalanced plates = rainbow confetti */
  /* dark keeps calm gains; light gets wide imbalance = electric CMY cells */
  float spread = mix(0.60, 0.48 + eF * 0.78, uLight);   /* flat skin calm, feature edges vivid */
  float base   = mix(0.70, 0.55, uLight);
  /* color twinkle: plate balance re-rolls each tick, so cells shimmer between
     cyan / magenta / violet / yellow instead of holding one sampled hue */
  float gA = base + spread * hash21(cell + 13.71 + stp * 0.37);
  float gB = base + spread * hash21(cell + 47.13 + stp * 0.43);
  float gC = base + spread * hash21(cell + 88.19 + stp * 0.31);

  /* dark mode: slow spatial hue drift — patches of the head lean red /
     green / blue as smooth gradients, not just per-cell noise */
  /* dark: hair band only · light: whole frame, gentler sweep */
  float ampG = (1.0 - uLight) * smoothstep(0.58, 0.74, cc.y) * 0.42
             + uLight * 0.30;
  gA *= 1.0 + ampG * sin(cc.x * 9.0 + cc.y * 4.0);
  gB *= 1.0 + ampG * sin(cc.x * 7.0 - cc.y * 6.0 + 2.1);
  gC *= 1.0 + ampG * sin(-cc.x * 5.0 + cc.y * 8.0 + 4.4);

  /* per-column brightness streaks — the CRT column structure */
  float colStreak = 0.90 + 0.10 * hash21(vec2(cell.x, 3.7));

  if(uLight > 0.5){
    /* CMY ink glyphs, transparent everywhere there is no ink */
    vec3 ink = clamp(vec3(pA * gA, pB * gB, pC * gC) * uInk * jit, 0.0, 1.0);
    ink = pow(ink, vec3(0.68));                 /* lift: denser ink, less washed-out */
    /* saturation boost around luminance: kills the pastel wash while keeping
       hue, so plate combinations stay a vivid CMY / RGB rainbow */
    float lum = dot(ink, vec3(0.299, 0.587, 0.114));
    ink = clamp(lum + (ink - lum) * uSat, 0.0, 1.0);
    /* high-key cap: densest cells go to near-pure saturated color */
    ink = min(ink, vec3(0.95));
    vec3 col = clamp(vec3(1.0) - ink, 0.0, 1.0);
    /* alpha gate on structural tonal density (pre-color), so faint skin and
       loose beard cells drop to transparent instead of scattering speckle */
    float dens = max(pA, max(pB, pC));
    float aOut = smoothstep(0.09, 0.36, dens);
    o = vec4(col, aOut);
  }else{
    /* additive R/G/B glyphs, transparent black elsewhere */
    vec3 col = vec3(pA * gA, pB * gB, pC * gC) * (1.42 * jit * colStreak);
    col.b *= 1.05;
    col = clamp(col, 0.0, 1.0);
    float aOut = clamp(max(col.r, max(col.g, col.b)) * 1.5, 0.0, 1.0);
    o = vec4(col, aOut);
  }
}`;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(s) || "shader compile error");
    return s;
  }
  function program(fs: string) {
    const p = gl!.createProgram()!;
    gl!.attachShader(p, compile(gl!.VERTEX_SHADER, VERT));
    gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fs));
    gl!.linkProgram(p);
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS))
      throw new Error(gl!.getProgramInfoLog(p) || "program link error");
    return p;
  }
  function texParams() {
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
  }
  function makeFBO(w: number, h: number) {
    const tex = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      w,
      h,
      0,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      null,
    );
    texParams();
    const fb = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
    gl!.framebufferTexture2D(
      gl!.FRAMEBUFFER,
      gl!.COLOR_ATTACHMENT0,
      gl!.TEXTURE_2D,
      tex,
      0,
    );
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  }

  function makeAtlas(chars: string, weight: number, scale: number) {
    const S = 64,
      n = chars.length,
      c = document.createElement("canvas");
    c.width = S * n;
    c.height = S;
    const x = c.getContext("2d")!;
    x.fillStyle = "#000";
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#fff";
    x.font = `${weight} ${S * scale}px ui-monospace, Menlo, Consolas, monospace`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (let i = 0; i < n; i++) x.fillText(chars[i], i * S + S / 2, S * 0.56);
    const t = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      c,
    );
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
    texParams();
    return { tex: t, count: chars.length };
  }
  /* dark: fine live-text weave · light: chunky print blocks (the reference look) */
  const atlasFine = makeAtlas(" .,:;i~=+*txcaoe1nsXAH2%#@", 400, 0.88);
  const atlasBold = makeAtlas(" .,:;-~=+*xoU08%#@", 700, 0.92);

  const progSrc = program(SRC_FRAG),
    progFlow = program(FLOW_FRAG),
    progOut = program(OUT_FRAG);
  const FLOW_RES = 256;
  let flowA = makeFBO(FLOW_RES, FLOW_RES),
    flowB = makeFBO(FLOW_RES, FLOW_RES),
    srcFBO: ReturnType<typeof makeFBO> | null = null;

  const state = {
    useImage: false,
    imgTex: null as WebGLTexture | null,
    imgAspect: 1,
    effZoom: 0.9,
    effShift: 0.02,
  };
  let mouse = { x: 0.5, y: 0.5 },
    vel = { x: 0, y: 0 },
    lastReal = 0;
  let dpr = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    const r = canvas.getBoundingClientRect();
    /* phones: cap dpr a step lower — 3 full-res passes at dpr 2 is GPU tax */
    dpr = Math.min(devicePixelRatio || 1, r.width < 520 ? 1.75 : 2);
    canvas.width = Math.max(2, Math.round(r.width * dpr));
    canvas.height = Math.max(2, Math.round(r.height * dpr));
    srcFBO = makeFBO(canvas.width, canvas.height);
    /* bloom copy runs at ~45% res — it's blurred anyway, so this stays cheap */
    if (glowCanvas) {
      glowCanvas.width = Math.max(2, Math.round(r.width * 0.45));
      glowCanvas.height = Math.max(2, Math.round(r.height * 0.45));
    }
    /* aspect-aware crop: portrait viewports zoom the head in and lift it,
       so mobile fills the width like the reference instead of floating small */
    const sA = r.width / r.height;
    if (sA < 0.62) {
      /* phones (≤ ~9:16): head ~88% of width, hair near top */
      state.effZoom = 0.6;
      state.effShift = -0.15;
    } else if (sA < 1.05) {
      /* tablets portrait (iPad 3:4 = 0.75): edge-to-edge fill */
      state.effZoom = 0.92;
      state.effShift = 0.03;
    } else {
      /* landscape / desktop */
      state.effZoom = CFG.zoom;
      state.effShift = CFG.shiftY;
    }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function onMove(cx: number, cy: number) {
    const r = canvas.getBoundingClientRect();
    const nx = (cx - r.left) / r.width;
    const ny = 1.0 - (cy - r.top) / r.height;
    if (nx < -0.1 || nx > 1.1 || ny < -0.1 || ny > 1.1) return;
    vel.x += (nx - mouse.x) * 5.5;
    vel.y += (ny - mouse.y) * 5.5;
    mouse.x = nx;
    mouse.y = ny;
    lastReal = performance.now();
  }
  const onPointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY);
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  };
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    mouse.x = (t.clientX - r.left) / r.width; /* jump, don't smear from old pos */
    mouse.y = 1.0 - (t.clientY - r.top) / r.height;
    vel.x += 0.35;
    vel.y += 0.25; /* small pulse so a tap is felt */
    lastReal = performance.now();
  };
  addEventListener("pointermove", onPointerMove);
  addEventListener("touchmove", onTouchMove, { passive: true });
  addEventListener("touchstart", onTouchStart, { passive: true });

  function setImage(src: string) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const t = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, t);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        img,
      );
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
      texParams();
      state.imgTex = t;
      state.imgAspect = img.width / img.height;
      state.useImage = true;
    };
    img.src = src;
  }

  let visible = true;
  const io = new IntersectionObserver(
    ([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) requestAnimationFrame(frame);
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  const t0 = performance.now();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let killed = false;

  function frame(now: number) {
    if (killed || !visible) return;
    const t = (now - t0) / 1000;

    if (!reduced && CFG.idle && now - lastReal > 2500) {
      const ix = 0.5 + 0.3 * Math.sin(t * 0.55) * Math.cos(t * 0.21);
      const iy = 0.5 + 0.26 * Math.sin(t * 0.34 + 1.7);
      vel.x += (ix - mouse.x) * 0.8;
      vel.y += (iy - mouse.y) * 0.8;
      mouse.x = ix;
      mouse.y = iy;
    }

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, srcFBO!.fb);
    gl!.viewport(0, 0, srcFBO!.w, srcFBO!.h);
    gl!.useProgram(progSrc);
    gl!.uniform2f(gl!.getUniformLocation(progSrc, "uRes"), srcFBO!.w, srcFBO!.h);
    gl!.uniform1f(gl!.getUniformLocation(progSrc, "uTime"), t);
    gl!.uniform1f(
      gl!.getUniformLocation(progSrc, "uUseImage"),
      state.useImage ? 1 : 0,
    );
    gl!.uniform1f(
      gl!.getUniformLocation(progSrc, "uImgAspect"),
      state.imgAspect,
    );
    gl!.uniform1f(gl!.getUniformLocation(progSrc, "uZoom"), state.effZoom);
    gl!.uniform1f(gl!.getUniformLocation(progSrc, "uShiftY"), state.effShift);
    if (state.useImage && state.imgTex) {
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, state.imgTex);
      gl!.uniform1i(gl!.getUniformLocation(progSrc, "uImage"), 0);
    }
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, flowB.fb);
    gl!.viewport(0, 0, FLOW_RES, FLOW_RES);
    gl!.useProgram(progFlow);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, flowA.tex);
    gl!.uniform1i(gl!.getUniformLocation(progFlow, "uPrev"), 0);
    gl!.uniform2f(gl!.getUniformLocation(progFlow, "uRes"), FLOW_RES, FLOW_RES);
    gl!.uniform2f(gl!.getUniformLocation(progFlow, "uMouse"), mouse.x, mouse.y);
    gl!.uniform2f(gl!.getUniformLocation(progFlow, "uVel"), vel.x, vel.y);
    gl!.uniform1f(gl!.getUniformLocation(progFlow, "uDecay"), CFG.decay);
    gl!.uniform1f(gl!.getUniformLocation(progFlow, "uRadius"), CFG.radius);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    [flowA, flowB] = [flowB, flowA];

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.useProgram(progOut);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, srcFBO!.tex);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, flowA.tex);
    const A = CFG.light ? atlasBold : atlasFine;
    gl!.activeTexture(gl!.TEXTURE2);
    gl!.bindTexture(gl!.TEXTURE_2D, A.tex);
    gl!.uniform1i(gl!.getUniformLocation(progOut, "uSource"), 0);
    gl!.uniform1i(gl!.getUniformLocation(progOut, "uFlow"), 1);
    gl!.uniform1i(gl!.getUniformLocation(progOut, "uAtlas"), 2);
    gl!.uniform2f(
      gl!.getUniformLocation(progOut, "uRes"),
      canvas.width,
      canvas.height,
    );
    gl!.uniform1f(
      gl!.getUniformLocation(progOut, "uCell"),
      (CFG.light ? CFG.cellLight : CFG.cellDark) * dpr,
    );
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uGlyphs"), A.count);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uDistort"), CFG.distort);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uChroma"), CFG.chroma);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uTime"), t);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uLight"), CFG.light);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uMisreg"), CFG.misreg);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uInk"), CFG.inkStrength);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uSat"), CFG.saturation);
    gl!.uniform1f(gl!.getUniformLocation(progOut, "uAnimT"), reduced ? 0.0 : t);
    gl!.uniform1f(
      gl!.getUniformLocation(progOut, "uFlicker"),
      reduced ? 0.0 : CFG.flicker,
    );
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    /* copy the freshly drawn frame into the bloom canvas (same tick, so the
       preserved drawing buffer is still valid); CSS blurs it into a halo */
    if (glowCtx && glowCanvas) {
      glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
      glowCtx.drawImage(canvas, 0, 0, glowCanvas.width, glowCanvas.height);
    }

    vel.x *= 0.62;
    vel.y *= 0.62;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setImage,
    setTheme(mode: "light" | "dark") {
      CFG.light = mode === "light" ? 1 : 0;
    },
    destroy() {
      killed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchstart", onTouchStart);
    },
  };
}

// read the theme already applied to <html> by the blocking init script in the
// layout; falls back to dark (also the SSR value, so hydration stays stable)
function getInitialTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function AsciiHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<AsciiHeroHandle | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const mode = getInitialTheme();
      handleRef.current = asciiHero(
        canvas,
        { light: mode === "light" ? 1 : 0 },
        glowRef.current,
      );
      handleRef.current?.setImage("/portrait.png");
    } catch {
      /* WebGL2 unavailable — hero shows a bare background */
    }
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  // the hero toggle is the single source of truth for the whole page theme;
  // persist the choice so a refresh comes up in the same mode
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage unavailable (private mode) — theme just won't persist */
    }
  }, [theme]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    handleRef.current?.setTheme(next);
  }

  return (
    <>
      {/* fixed, page-wide nav — kept outside the hero's overflow-hidden section */}
      <HeroNav />
      <section
        id="top"
        className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
      >
        {/* version + theme toggle — inside the hero (NOT the fixed nav), so they
            scroll away with the hero. V1.0 auto-runs the decrypt every 5s. */}
        <div className="nav-intro pointer-events-none absolute right-4 top-20 z-[1250] flex flex-col items-end gap-3 sm:top-24">
          <div className="pointer-events-auto hidden text-right text-xs leading-tight text-muted sm:block">
            <DecryptedText
              text="V1.0"
              animateOn="hover"
              intervalMs={5000}
              speed={45}
            />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle light / dark"
            aria-label="Toggle light / dark"
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-border text-[15px] text-fg transition-colors hover:border-fg/40"
          >
            ◐
          </button>
        </div>
        {/* transparent — the uniform page background (PageBackground) shows through */}
        {/* intro step 1: portrait + vertical lines fade in together after the
            loader has revealed the background (see .hero-reveal in globals.css) */}
        <div className="hero-reveal absolute inset-0">
          {/* two faint vertical guide lines flanking the portrait; sit behind the
              canvases so the glyphs render over them like the reference */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
          >
            <span className="hero-guide absolute inset-y-0 left-[calc(18%-25px)] w-px" />
            <span className="hero-guide absolute inset-y-0 right-[calc(18%-25px)] w-px" />
          </div>
          {/* CMYK bloom — downscaled copy of the render, blurred + blended */}
          <canvas
            ref={glowRef}
            aria-hidden="true"
            className="hero-glow pointer-events-none absolute inset-0 z-[1] block h-full w-full"
            style={{ filter: "blur(8px)" }}
          />
          {/* sharp render — a hair of blur removes the pixel-perfect digital edge */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 z-[2] block h-full w-full"
            style={{ filter: "blur(0.35px)" }}
          />
        </div>
        {/* bottom-corner wordmark — z above the page GradualBlur (z-index 1100)
            so the type stays crisp on top while the blur fades everything else */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1200] flex items-end justify-between gap-4 p-4">
          <HeroTitle
            index="01"
            lines={["Design", "Engineer"]}
            align="left"
            label="Design Engineer"
            glitchBase={4300}
          />
          <HeroTitle
            index="02"
            lines={["Product", "Designer"]}
            align="right"
            label="Product Designer"
            glitchBase={5100}
          />
        </div>
      </section>
    </>
  );
}
