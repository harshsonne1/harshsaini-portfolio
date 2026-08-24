import { site } from "@/content/site";

// The bracketed button shared by the nav and the footer so they stay the same
// size. Two hover moves: the label slides up while a duplicate slides in from
// below, and the four corner brackets push out to the edges. Defaults to the
// "Schedule a call" mailto; the nav passes the resume instead.
const corner =
  "pointer-events-none absolute h-2 w-2 border-current opacity-40 transition-all duration-300 ease-out group-hover:opacity-70";

type ScheduleCTAProps = {
  label?: string;
  href?: string;
  /* opens in a new tab — for the resume PDF, so the page isn't left behind */
  newTab?: boolean;
};

export function ScheduleCTA({
  label = "Schedule a call",
  href,
  newTab = false,
}: ScheduleCTAProps = {}) {
  return (
    <a
      href={href ?? `mailto:${site.email}`}
      {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm text-fg"
    >
      <span
        aria-hidden="true"
        className={`${corner} left-1.5 top-1.5 border-l border-t group-hover:left-0 group-hover:top-0`}
      />
      <span
        aria-hidden="true"
        className={`${corner} right-1.5 top-1.5 border-r border-t group-hover:right-0 group-hover:top-0`}
      />
      <span
        aria-hidden="true"
        className={`${corner} bottom-1.5 left-1.5 border-b border-l group-hover:bottom-0 group-hover:left-0`}
      />
      <span
        aria-hidden="true"
        className={`${corner} bottom-1.5 right-1.5 border-b border-r group-hover:bottom-0 group-hover:right-0`}
      />
      <span className="relative block h-[1.4em] overflow-hidden leading-[1.4em]">
        <span className="block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
          {label}
        </span>
        <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
          {label}
        </span>
      </span>
    </a>
  );
}
