"use client";

// The scan flow counted twice: April, when it was broken, and August, once it
// was fixed. One figure each, so the two are read one after the other down the
// column rather than crammed into one frame side by side.
//
// Drawn in the same hand as the pipeline and context diagrams: the .pipe token
// block, mono caps, hairline frames on square corners, and a run that plays
// rather than a picture that sits there. A step lights as the cohort reaches
// it, a meter draws across its top edge while it is being counted, its pip
// stays lit once it is done, and a packet carries the count along the wire to
// the next step. The run loops, and only while the figure is on screen.
//
// The skip is the one card no packet ever reaches. Nothing led to it — those
// people never entered the flow — so it is framed in the fail red, set further
// out than a step is from the next, and marked only once the chain beside it
// has finished.
//
// The diagram is data: edit SETS and every card, wire and label position is
// derived from the geometry in it.
//
// With no JS the figure still renders whole — every count, label and share is
// in the markup, and only the run's lit states are missing. Under reduced
// motion nothing plays: it is marked done once and left there.

import { useEffect, useRef } from "react";

export type EraSet = "april" | "august";

type Card = {
  count: string;
  /* `|` breaks a line — a label has to clear the card it is set in */
  label: string;
  pct?: string;
  /* the skip: reached by nothing, so no wire and no packet arrive at it */
  apart?: boolean;
};

type Era = {
  label: string;
  note: string;
  /* the era's own type size, which the title block's height follows */
  era: number;
  cardH: number;
  gap: number;
  cards: Card[];
};

/* One pad, used on all four sides and by both figures. Both viewBoxes are the
   same width and both render at the same width on the page, so a unit here is
   the same number of pixels in either — the two stack with the same margin
   round each of them. Everything else is measured off it: the card width is
   what is left of the row once the pads, the gaps and the skip's extra step
   away have been taken out. */
const PAD = 40;
const W = 1200;

/* how far the skip is set beyond the gap a step takes */
const APART = 36;

const SETS: Record<EraSet, Era> = {
  april: {
    label: "APRIL",
    note: "SCAN FLOW WAS BROKEN",
    era: 32,
    cardH: 280,
    gap: 60,
    cards: [
      { count: "86", label: "ONBOARDING COMPLETERS" },
      { count: "20", label: "CLICKED SCAN", pct: "(54%)" },
      { count: "1", label: "SUBMITTED URL", pct: "(5%)" },
    ],
  },
  august: {
    label: "AUGUST",
    note: "SCAN FLOW WAS FIXED",
    era: 28,
    cardH: 250,
    gap: 40,
    cards: [
      { count: "86", label: "ONBOARDING|COMPLETERS" },
      { count: "33", label: "CLICKED SCAN", pct: "(38%)" },
      { count: "32", label: "SUBMITTED URL", pct: "(97%)" },
      { count: "32", label: "COMPLETED SCAN", pct: "(37%)" },
      {
        count: "54",
        label: "SKIPPED BRAND|MEMORY",
        pct: "(63%)",
        apart: true,
      },
    ],
  },
};

/* The title sits a pad below the top edge — measured to the cap, not the
   baseline, so the ink starts where the cards' ink starts. */
const layout = (e: Era) => {
  const n = e.cards.length;
  const apartAt = e.cards.findIndex((c) => c.apart);
  const extra = (i: number) => (apartAt >= 0 && i >= apartAt ? APART : 0);
  const spare = extra(n - 1);
  const cardW = (W - PAD * 2 - (n - 1) * e.gap - spare) / n;

  const titleY = PAD + e.era * 0.72;
  const noteY = titleY + 40;
  const top = noteY + 44;

  return {
    cardW,
    extra,
    titleY,
    noteY,
    top,
    height: top + e.cardH + PAD,
    cardX: (i: number) => PAD + i * (cardW + e.gap) + extra(i),
    mid: top + e.cardH / 2,
  };
};

/* how long a step is counted for, and how long the packet takes to reach the
   next one. Short: five of these run end to end. */
const COUNT_MS = 460;
const CARRY_MS = 240;
const HOLD_MS = 2200;

export function ScanEras({ set }: { set: EraSet }) {
  const ref = useRef<SVGSVGElement>(null);
  const era = SETS[set];

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const cards = Array.from(svg.querySelectorAll<SVGGElement>(".sef-card"));
    const meters = cards.map((c) => c.querySelector<SVGRectElement>(".sef-meter"));
    const wires = Array.from(svg.querySelectorAll<SVGPathElement>(".sef-wire"));
    const packet = svg.querySelector<SVGCircleElement>(".sef-packet");
    if (!cards.length || !packet) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* everything the run schedules, so leaving the screen can stop all of it */
    let generation = 0;
    const frames = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const clear = () => {
      frames.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      frames.clear();
      timers.clear();
    };

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

    const settle = () => {
      cards.forEach((c) => {
        c.classList.remove("is-live");
        c.classList.add("is-done");
      });
      wires.forEach((w) => w.classList.add("is-lit"));
    };

    const reset = () => {
      cards.forEach((c) => c.classList.remove("is-live", "is-done"));
      meters.forEach((m) => m?.setAttribute("width", "0"));
      wires.forEach((w) => w.classList.remove("is-lit"));
      packet.style.opacity = "0";
    };

    /* the meter draws across the card's top edge while the step is counted */
    const count = (i: number, gen: number) =>
      new Promise<void>((resolve) => {
        const meter = meters[i];
        const width = Number(cards[i].dataset.w ?? 0);
        if (!meter) return resolve();
        const start = performance.now();
        const step = (now: number) => {
          if (gen !== generation) return resolve();
          const k = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
          meter.setAttribute("width", String(width * k));
          k < 1 ? raf(step) : resolve();
        };
        step(start);
      });

    /* and a packet carries it along the wire to the next card */
    const carry = (wire: SVGPathElement, gen: number) =>
      new Promise<void>((resolve) => {
        const len = wire.getTotalLength();
        const start = performance.now();
        packet.style.opacity = "1";
        const step = (now: number) => {
          if (gen !== generation) {
            packet.style.opacity = "0";
            return resolve();
          }
          const k = Math.min(1, Math.max(0, (now - start) / CARRY_MS));
          const at = wire.getPointAtLength(len * k);
          packet.setAttribute("cx", String(at.x));
          packet.setAttribute("cy", String(at.y));
          if (k < 1) raf(step);
          else {
            packet.style.opacity = "0";
            resolve();
          }
        };
        step(start);
      });

    const run = async (gen: number): Promise<void> => {
      if (gen !== generation) return;
      reset();
      await wait(500);

      // the chain: every card a wire reaches, in order
      let wire = 0;
      for (let i = 0; i < cards.length; i++) {
        if (gen !== generation) return;
        const card = cards[i];
        const apart = card.dataset.apart === "";

        // the skip is not part of the chain; it is marked after it
        if (apart) continue;

        card.classList.add("is-live");
        await count(i, gen);
        if (gen !== generation) return;
        card.classList.remove("is-live");
        // the bar clears; the pip is what marks the step as counted. A row of
        // filled bars left standing is the whole figure shouting at once
        meters[i]?.setAttribute("width", "0");
        card.classList.add("is-done");

        const next = cards[i + 1];
        if (next && next.dataset.apart !== "" && wires[wire]) {
          wires[wire].classList.add("is-lit");
          await carry(wires[wire], gen);
          wire += 1;
        }
      }

      // and then what never entered it
      const skipped = cards.find((c) => c.dataset.apart === "");
      if (skipped) {
        await wait(420);
        if (gen !== generation) return;
        skipped.classList.add("is-done");
      }

      await wait(HOLD_MS);
      return run(gen);
    };

    if (reduced) {
      settle();
      return () => clear();
    }

    /* off screen it holds still: five cards ramping behind the fold is frames
       spent on something nobody is looking at */
    const io = new IntersectionObserver(
      ([entry]) => {
        generation += 1;
        clear();
        if (entry.isIntersecting) run(generation);
        else reset();
      },
      { threshold: 0.25 },
    );
    io.observe(svg);

    return () => {
      generation += 1;
      io.disconnect();
      clear();
    };
  }, [set]);

  const { cardH } = era;
  const { cardW, titleY, noteY, top, height: H, cardX, mid } = layout(era);

  const spoken = era.cards
    .map(
      (c) =>
        `${c.count} ${c.label.replace("|", " ").toLowerCase()}` +
        (c.pct ? `, ${c.pct.replace(/[()]/g, "")}` : ""),
    )
    .join("; ");

  return (
    <svg
      ref={ref}
      className={`pipe sef is-${set}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${era.label}: ${era.note.toLowerCase()}. ${spoken}.`}
    >
      <text className="sef-era" x={W / 2} y={titleY} textAnchor="middle">
        {era.label}
      </text>
      <text className="sef-eran" x={W / 2} y={noteY} textAnchor="middle">
        {era.note}
      </text>

      {/* the wires first, so a card always sits over the line that reaches it */}
      {era.cards.map((card, i) => {
        const next = era.cards[i + 1];
        if (!next || next.apart) return null;
        const from = cardX(i) + cardW;
        return (
          <path
            key={`wire-${i}`}
            className="sef-wire"
            d={`M${from + 8} ${mid} L${cardX(i + 1) - 8} ${mid}`}
          />
        );
      })}

      {era.cards.map((card, i) => {
        const x = cardX(i);
        const cx = x + cardW / 2;
        const lines = card.label.split("|");
        const countY = top + cardH * 0.5;
        const labelY = countY + 54;
        const pctY = labelY + lines.length * 26 + 8;

        return (
          <g
            key={`${card.label}-${i}`}
            className={`sef-card${card.apart ? " is-apart" : ""}`}
            data-w={cardW}
            {...(card.apart ? { "data-apart": "" } : {})}
          >
            <rect
              className="sef-frame"
              x={x}
              y={top}
              width={cardW}
              height={cardH}
              rx="3"
            />
            {/* draws across the top edge while the step is being counted */}
            <rect className="sef-meter" x={x} y={top} width="0" height="2" />
            <circle className="sef-pip" cx={x + 16} cy={top + 20} r="3.5" />

            <text className="sef-n" x={cx} y={countY} textAnchor="middle">
              {card.count}
            </text>
            {lines.map((line, j) => (
              <text
                key={line}
                className="sef-lb"
                x={cx}
                y={labelY + j * 26}
                textAnchor="middle"
              >
                {line}
              </text>
            ))}
            {card.pct && (
              <text className="sef-p" x={cx} y={pctY} textAnchor="middle">
                {card.pct}
              </text>
            )}
          </g>
        );
      })}

      <circle className="sef-packet" r="4" />
    </svg>
  );
}
