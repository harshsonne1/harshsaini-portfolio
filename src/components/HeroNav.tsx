"use client";

import { site } from "@/content/site";
import DecryptedText from "./DecryptedText";
import { ScheduleCTA } from "./ScheduleCTA";

export function HeroNav() {
  return (
    <nav className="nav-intro fixed inset-x-0 top-0 z-[1300] flex items-start justify-between gap-4 p-4 text-sm">
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
        {/* same slide-up-reveal hover as the social links (BracketLink) */}
        <span className="group relative block h-[1.4em] overflow-hidden leading-[1.4em] text-muted">
          <span className="block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
            Available for work
          </span>
          <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
            Available for work
          </span>
        </span>
      </div>

      <div className="flex flex-col items-end gap-3">
        <ScheduleCTA />
      </div>
    </nav>
  );
}
