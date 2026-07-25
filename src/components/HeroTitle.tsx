// Big hero wordmark. Each word's first letter is the bolder font-pixel glyph
// and periodically does a quick DecryptedText scramble — a ~1s "glitch in the
// matrix" — instead of the old opacity flicker. Each line lives in an
// overflow-clip box and reveals with a slide-up on load.

import DecryptedText from "./DecryptedText";

type HeroTitleProps = {
  index: string;
  lines: [string, string];
  align?: "left" | "right";
  label: string;
  /* base ms between glitches; the two words are offset so they don't sync */
  glitchBase?: number;
};

// characters the first letter flickers through mid-glitch (upper + digits + symbols)
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

function HeroWord({
  text,
  delay,
  glitchInterval,
}: {
  text: string;
  delay: number;
  glitchInterval: number;
}) {
  return (
    <span className="block overflow-clip">
      <span className="hero-line block" style={{ animationDelay: `${delay}ms` }}>
        {/* first letter: Monoska (font-wordmark); scrambles for ~1s on a loose
            interval. The rest of the word inherits the UI sans-serif body font */}
        <DecryptedText
          text={text.charAt(0)}
          animateOn="hover"
          intervalMs={glitchInterval}
          speed={50}
          maxIterations={20}
          characters={GLITCH_CHARS}
          parentClassName="font-wordmark"
          className="font-wordmark"
          encryptedClassName="font-wordmark"
        />
        {text.slice(1)}
      </span>
    </span>
  );
}

export function HeroTitle({
  index,
  lines,
  align = "left",
  label,
  glitchBase = 4500,
}: HeroTitleProps) {
  return (
    <div
      className={`title-intro ${align === "right" ? "text-right" : "text-left"}`}
    >
      <span className="mb-1 block text-xs tracking-[0.25em] text-muted">
        {index}
      </span>
      <h2
        aria-label={label}
        className="leading-tighter relative z-[5] uppercase text-fg text-[clamp(1.75rem,6vw,5.5rem)]"
      >
        {/* INTRO_DELAY: words slide up in phase 2, after the loader + hero fade */}
        <HeroWord text={lines[0]} delay={2200} glitchInterval={glitchBase} />
        <HeroWord text={lines[1]} delay={2290} glitchInterval={glitchBase + 700} />
      </h2>
    </div>
  );
}
