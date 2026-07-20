// Big hero wordmark, mirroring the reference markup: each word's first letter
// is rendered in font-pixel, the rest in font-hero-1. Each line lives in an
// overflow-clip box and reveals with a slide-up on load. mix-blend-difference
// keeps the type legible over both the portrait and either theme background.

type HeroTitleProps = {
  index: string;
  lines: [string, string];
  align?: "left" | "right";
  label: string;
  /* seconds — offsets the first-letter flicker so titles blink out of sync */
  flickerOffset?: number;
};

function HeroWord({
  text,
  delay,
  flickerDelay,
}: {
  text: string;
  delay: number;
  flickerDelay: number;
}) {
  return (
    <span className="block overflow-clip">
      <span className="hero-line block" style={{ animationDelay: `${delay}ms` }}>
        <span
          className="hero-pixel"
          style={{ animationDelay: `${flickerDelay}s` }}
        >
          {text.charAt(0)}
        </span>
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
  flickerOffset = 0,
}: HeroTitleProps) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className="mb-1 block text-xs tracking-[0.25em] text-muted">
        {index}
      </span>
      <h2
        aria-label={label}
        className="font-wordmark leading-tighter relative z-[5] uppercase text-fg text-[clamp(1.75rem,6vw,5.5rem)]"
      >
        <HeroWord text={lines[0]} delay={0} flickerDelay={flickerOffset} />
        <HeroWord text={lines[1]} delay={90} flickerDelay={flickerOffset + 2.3} />
      </h2>
    </div>
  );
}
