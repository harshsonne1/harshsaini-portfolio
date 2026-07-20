"use client";

import { site } from "@/content/site";
import DecryptedText from "./DecryptedText";

type HeroNavProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

/* CTA with two hover moves:
   1. the label slides up and a duplicate slides in from below
   2. the four corner brackets push outward so the target area grows */
function ScheduleCTA() {
  const corner =
    "pointer-events-none absolute h-2.5 w-2.5 border-current opacity-40 transition-all duration-300 ease-out group-hover:opacity-70";
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

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title="Toggle light / dark"
      aria-label="Toggle light / dark"
      className="grid h-9 w-9 place-items-center rounded-full border border-border text-[15px] text-fg transition-colors hover:border-fg/40"
    >
      ◐
    </button>
  );
}

export function HeroNav({ onToggleTheme }: HeroNavProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-[1300] flex items-start justify-between gap-4 p-6 text-sm sm:p-8">
      <div className="leading-tight">
        <div className="text-fg">
          &gt;{" "}
          <DecryptedText
            text={site.name}
            animateOn="hover"
            speed={45}
            maxIterations={12}
            className="text-fg"
            encryptedClassName="text-muted"
          />
        </div>
        <div className="text-muted">{site.role}</div>
      </div>

      <div className="hidden leading-tight md:block">
        <div className="text-fg">{site.location} based</div>
        <div className="text-muted">Working globally</div>
      </div>

      <div className="hidden leading-tight md:block">
        <div className="text-fg">Currently</div>
        <div className="text-muted">Available for work</div>
      </div>

      <div className="flex flex-col items-end gap-4">
        <ScheduleCTA />
        <div className="hidden text-right text-xs leading-tight text-muted sm:block">
          V1.0
        </div>
        <ThemeToggle onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}
