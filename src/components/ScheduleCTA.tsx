import { site } from "@/content/site";

// "Schedule a call" button shared by the nav and the footer so they stay the
// same size. Two hover moves: the label slides up while a duplicate slides in
// from below, and the four corner brackets push out to the edges.
const corner =
  "pointer-events-none absolute h-2 w-2 border-current opacity-40 transition-all duration-300 ease-out group-hover:opacity-70";

export function ScheduleCTA() {
  return (
    <a
      href={`mailto:${site.email}`}
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
          Schedule a call
        </span>
        <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
          Schedule a call
        </span>
      </span>
    </a>
  );
}
