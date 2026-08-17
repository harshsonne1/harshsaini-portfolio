import DecryptedText from "./DecryptedText";

// Decorative barcode. Bars are derived deterministically from `value` (via a
// small LCG seeded by the string) so server and client render identically —
// no Math.random, no hydration mismatch. Bars use currentColor (theme-aware).

type BarcodeProps = {
  value: string;
  bars?: number;
  height?: number;
  className?: string;
};

export function Barcode({
  value,
  bars = 64,
  height = 44,
  className = "",
}: BarcodeProps) {
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };

  const strokes = Array.from({ length: bars }, () => ({
    w: 1 + (next() % 3), // bar width 1–3px
    gap: 1 + (next() % 3), // trailing gap 1–3px
  }));

  return (
    <div
      aria-hidden="true"
      className={`flex items-stretch overflow-hidden ${className}`}
      style={{ height }}
    >
      {strokes.map((s, i) => (
        <span
          key={i}
          className="bg-current"
          style={{ width: s.w, marginRight: s.gap, flex: "0 0 auto" }}
        />
      ))}
    </div>
  );
}

// The drawn barcode — a fixed set of bars rather than the generated ones above,
// for the places the mark is a printed artefact in the margin rather than a
// decoration sized to its slot. Bars are one path in currentColor, so it takes
// the theme and the surrounding opacity like type does.
const BARS =
  "M1 30H0V0H1V30ZM8 30H3V0H8V30ZM11 30H10V0H11V30ZM20 30H13V0H20V30ZM23 30H22V0H23V30ZM28 30H25V0H28V30ZM35 30H30V0H35V30ZM38 30H37V0H38V30ZM44 30H40V0H44V30ZM51 30H46V0H51V30ZM54 30H53V0H54V30ZM61 30H60V0H61V30ZM67 30H63V0H67V30ZM74 30H69V0H74V30ZM77 30H76V0H77V30ZM82 30H79V0H82V30ZM91 30H84V0H91V30ZM98 30H93V0H98V30ZM101 30H100V0H101V30ZM104 30H103V0H104V30ZM111 30H106V0H111V30ZM114 30H113V0H114V30ZM125 30H118V0H125V30ZM128 30H127V0H128V30ZM135 30H130V0H135V30ZM138 30H137V0H138V30ZM141 30H140V0H141V30ZM146 30H143V0H146V30ZM153 30H148V0H153V30ZM156 30H155V0H156V30ZM163 30H158V0H163V30ZM166 30H165V0H166V30ZM172 30H168V0H172V30ZM177 30H176V0H177V30ZM184 30H179V0H184V30ZM190 30H186V0H190V30ZM193 30H192V0H193V30ZM200 30H195V0H200V30ZM205 30H202V0H205V30ZM214 30H207V0H214V30ZM217 30H216V0H217V30ZM220 30H219V0H220V30ZM227 30H222V0H227V30ZM230 30H229V0H230V30Z";

// The code is set above the bars, both left-aligned, the way it is printed on a
// label. `code` is real text, not part of the drawing, so it stays selectable
// and takes the page's own type. It re-scrambles on a 4s beat — the same glitch
// the hero and footer use, on the slowest interval of the three, because this
// one sits in the margin and shouldn't pull the eye off the copy.
const CODE_GLITCH_MS = 4000;
// hex: a numeric serial reads as encrypted while it churns, and every character
// keeps its width in the mono face so the line never reflows mid-scramble
const CODE_CHARS = "0123456789ABCDEF";

export function BarcodeMark({
  code,
  className = "",
  height = 20,
}: {
  code?: string;
  className?: string;
  /** bar height in px; the drawing keeps its 231:30 ratio around it */
  height?: number;
}) {
  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      {code && (
        <span className="cs-barcode-code text-[0.6875rem] leading-none tracking-[0.08em]">
          <DecryptedText
            text={code}
            characters={CODE_CHARS}
            animateOn="view"
            intervalMs={CODE_GLITCH_MS}
            speed={45}
            maxIterations={12}
          />
        </span>
      )}
      <svg
        aria-hidden="true"
        viewBox="0 0 231 30"
        width={(height / 30) * 231}
        height={height}
        fill="none"
        className="block"
      >
        <path d={BARS} fill="currentColor" fillOpacity={0.95} />
      </svg>
    </div>
  );
}
