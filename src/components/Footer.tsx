import { site, socialLinks } from "@/content/site";
import { BracketLink } from "./BracketLink";
import DecryptedText from "./DecryptedText";

export function Footer() {
  const monogram = site.name.charAt(0);
  return (
    <footer
      id="contact"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 py-20 sm:px-8"
    >
      {/* vertical binary on the outer edges — scrambles every 10s and on hover */}
      <span className="absolute left-6 top-1/2 -translate-y-1/2 rotate-180 font-mono text-xs tracking-[0.3em] text-muted [writing-mode:vertical-rl] sm:left-8">
        <DecryptedText
          text="01010101"
          characters="01"
          animateOn="hover"
          intervalMs={10000}
          speed={45}
        />
      </span>
      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-xs tracking-[0.3em] text-muted [writing-mode:vertical-rl] sm:right-8">
        <DecryptedText
          text="01010101"
          characters="01"
          animateOn="hover"
          intervalMs={10000}
          speed={45}
        />
      </span>

      {/* top row — social links, right aligned */}
      <div className="flex justify-end">
        <ul className="-mr-3 flex flex-col items-start gap-1">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <BracketLink
                label={link.label}
                href={link.href || undefined}
                arrow
                bracketsMode="none"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* center — the closing call to action */}
      <div className="flex flex-col items-center text-center">
        <p className="font-hero-1 text-2xl uppercase leading-none text-muted sm:text-4xl md:text-5xl">
          Let&apos;s work together
        </p>
        <a
          href={`mailto:${site.email}`}
          className="group relative mt-6 inline-flex items-center px-10 py-6 font-hero-1 text-4xl uppercase leading-none text-fg sm:text-6xl md:text-7xl"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-left-1.5 group-hover:-top-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-right-1.5 group-hover:-top-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-bottom-1.5 group-hover:-left-1.5 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-current opacity-60 transition-all duration-300 ease-out group-hover:-bottom-1.5 group-hover:-right-1.5 group-hover:opacity-100"
          />
          {/* same text-slide-up as the nav CTA */}
          <span className="relative block h-[1.1em] overflow-hidden leading-[1.1em]">
            <span className="block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Schedule a call
            </span>
            <span className="absolute inset-x-0 top-full block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Schedule a call
            </span>
          </span>
        </a>
      </div>

      {/* bottom row — big monogram + copyright */}
      <div className="flex items-end justify-between">
        <p className="font-mono text-xs text-muted">
          &copy; {site.name}
        </p>
        <span
          aria-hidden="true"
          className="font-pixel text-7xl leading-none text-fg sm:text-8xl md:text-9xl"
        >
          {monogram}
        </span>
      </div>
    </footer>
  );
}
