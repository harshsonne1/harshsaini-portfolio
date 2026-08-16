// Link with the "Schedule a call" hover effect: the label slides up while a
// duplicate slides in from below, and four corner brackets push outward.
// Used for the hero CTA and the about-section social links.

type BracketLinkProps = {
  label: string;
  href?: string;
  arrow?: boolean;
  /* a chevron ahead of the label, for a link that goes back rather than out.
     It slides toward the direction it points on hover. */
  back?: boolean;
  /* "always": brackets faint at rest, brighten on hover (CTA style).
     "hover": brackets hidden at rest, appear on hover.
     "none": no corner brackets — just the arrow + text-slide effect. */
  bracketsMode?: "always" | "hover" | "none";
  className?: string;
};

export function BracketLink({
  label,
  href,
  arrow = false,
  back = false,
  bracketsMode = "always",
  className = "",
}: BracketLinkProps) {
  const cornerBase =
    "pointer-events-none absolute h-2.5 w-2.5 border-current transition-all duration-300 ease-out";
  const cornerOpacity =
    bracketsMode === "always"
      ? "opacity-40 group-hover:opacity-70"
      : "opacity-0 group-hover:opacity-60";

  const inner = (
    <span
      className={`group relative inline-flex items-center gap-2 px-3 py-0 text-fg ${className}`}
    >
      {bracketsMode !== "none" && (
        <>
          <span
            aria-hidden="true"
            className={`${cornerBase} ${cornerOpacity} left-1.5 top-1.5 border-l border-t group-hover:left-0 group-hover:top-0`}
          />
          <span
            aria-hidden="true"
            className={`${cornerBase} ${cornerOpacity} right-1.5 top-1.5 border-r border-t group-hover:right-0 group-hover:top-0`}
          />
          <span
            aria-hidden="true"
            className={`${cornerBase} ${cornerOpacity} bottom-1.5 left-1.5 border-b border-l group-hover:bottom-0 group-hover:left-0`}
          />
          <span
            aria-hidden="true"
            className={`${cornerBase} ${cornerOpacity} bottom-1.5 right-1.5 border-b border-r group-hover:bottom-0 group-hover:right-0`}
          />
        </>
      )}
      {back && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[1em] w-[1em] shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-1"
        >
          <path d="M15 18 L9 12 L15 6" />
        </svg>
      )}
      {arrow && (
        <span aria-hidden="true" className="text-current">
          ↗
        </span>
      )}
      <span className="relative block h-[1.4em] overflow-hidden leading-[1.4em]">
        <span className="block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
          {label}
        </span>
        <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
          {label}
        </span>
      </span>
    </span>
  );

  if (!href) {
    // e.g. Dribbble — kept blank for now, so it's not a live link
    return <span className="inline-block cursor-default">{inner}</span>;
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-block"
    >
      {inner}
    </a>
  );
}
