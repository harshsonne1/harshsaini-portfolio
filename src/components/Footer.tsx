"use client";

import { useEffect, useState } from "react";
import { site, socialLinks } from "@/content/site";
import { BracketLink } from "./BracketLink";
import DecryptedText from "./DecryptedText";
import { ScheduleCTA } from "./ScheduleCTA";

// characters the monogram flickers through mid-glitch (matches the hero letters)
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
// H / S monogram — fluid type: 80px floor on phones, 18vw through tablet,
// capped at the 200px desktop size (reached at a ~1111px viewport).
const MONOGRAM =
  "font-wordmark block leading-none text-fg text-[clamp(5rem,18vw,200px)]";

export function Footer() {
  const parts = site.name.trim().split(/\s+/);
  const firstInitial = site.name.charAt(0); // H
  const lastInitial =
    parts.length > 1 ? parts[parts.length - 1].charAt(0) : firstInitial; // S
  const year = new Date().getFullYear();

  // one shared timer so H, S and both binary strings glitch in lockstep
  const [glitchTick, setGlitchTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setGlitchTick((t) => t + 1), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      id="contact"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden p-4 pt-24"
    >
      {/* vertical binary on the outer edges — scrambles every 10s and on hover */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 rotate-180 font-mono text-xs tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
        <DecryptedText
          text="01010101"
          characters="01"
          animateOn="hover"
          glitchKey={glitchTick}
          speed={50}
          maxIterations={16}
        />
      </span>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
        <DecryptedText
          text="01010101"
          characters="01"
          animateOn="hover"
          glitchKey={glitchTick}
          speed={50}
          maxIterations={16}
        />
      </span>

      {/* top row — monogram left, social links right */}
      <div className="flex items-start justify-between">
        <span aria-hidden="true" className={MONOGRAM}>
          <DecryptedText
            text={firstInitial}
            animateOn="hover"
            glitchKey={glitchTick}
            speed={50}
            maxIterations={16}
            characters={GLITCH_CHARS}
          />
        </span>
        <ul className="-mr-3 flex flex-col items-start gap-1 text-sm">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <BracketLink
                label={link.label}
                href={link.href || undefined}
                arrow
                bracketsMode="none"
              />
            </li>
          ))}
          {/* resume — file to be uploaded to /public/resume.pdf */}
          <li>
            <BracketLink
              label="Resume"
              href={site.resumeUrl}
              arrow
              bracketsMode="none"
            />
          </li>
        </ul>
      </div>

      {/* center — closing CTA. mobile: compact nav-sized button;
          tablet / desktop: large display CTA */}
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-2xl uppercase leading-none text-muted sm:text-4xl md:text-5xl">
          Let&apos;s work together
        </p>
        {/* mobile only — same button as the nav */}
        <div className="sm:hidden">
          <ScheduleCTA />
        </div>
        {/* tablet & desktop — large display CTA */}
        <a
          href={`mailto:${site.email}`}
          className="group relative hidden items-center px-10 py-6 text-6xl uppercase leading-none text-fg sm:inline-flex md:text-7xl"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-left-1.5 group-hover:-top-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-right-1.5 group-hover:-top-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-bottom-1.5 group-hover:-left-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-bottom-1.5 group-hover:-right-1.5 group-hover:opacity-100"
          />
          <span className="relative block h-[1.1em] overflow-hidden leading-[1.1em]">
            <span className="block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Schedule a call
            </span>
            <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Schedule a call
            </span>
          </span>
        </a>
      </div>

      {/* bottom — mobile: monogram on its own row above © / all-rights;
          desktop: single band with © left · all-rights center · monogram right */}
      <div className="grid grid-cols-2 items-end gap-y-10 sm:grid-cols-3 sm:gap-y-0">
        {/* glitching monogram — same font + effect as the hero's D / E / P / D */}
        <span
          aria-hidden="true"
          className={`col-span-2 justify-self-end sm:col-span-1 sm:col-start-3 sm:row-start-1 ${MONOGRAM}`}
        >
          <DecryptedText
            text={lastInitial}
            animateOn="hover"
            glitchKey={glitchTick}
            speed={50}
            maxIterations={16}
            characters={GLITCH_CHARS}
          />
        </span>
        <p className="font-mono text-xs text-muted sm:col-start-1 sm:row-start-1">
          &copy; Copyright {year}
        </p>
        <p className="justify-self-end font-mono text-xs text-muted sm:col-start-2 sm:row-start-1 sm:justify-self-center">
          All rights reserved
        </p>
      </div>
    </footer>
  );
}
