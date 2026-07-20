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
