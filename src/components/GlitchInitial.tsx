"use client";

// The Monoska first letter of a section heading ("W"ork, "E"xperience), doing
// the same periodic scramble as the hero wordmark — a ~1s "glitch in the matrix"
// on a loose interval, plus on hover.
import DecryptedText from "./DecryptedText";

// upper + digits + symbols, matching HeroTitle's glitch alphabet
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

type GlitchInitialProps = {
  letter: string;
  /* ms between auto-glitches; stagger callers so headings don't sync */
  intervalMs?: number;
};

export default function GlitchInitial({
  letter,
  intervalMs = 5200,
}: GlitchInitialProps) {
  return (
    <DecryptedText
      text={letter}
      animateOn="hover"
      intervalMs={intervalMs}
      speed={50}
      maxIterations={20}
      characters={GLITCH_CHARS}
      parentClassName="font-wordmark"
      className="font-wordmark"
      encryptedClassName="font-wordmark"
    />
  );
}
