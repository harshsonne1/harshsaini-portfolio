import { site, socialLinks } from "@/content/site";
import { BracketLink } from "./BracketLink";
import { Barcode } from "./Barcode";
import { LiveDateTime } from "./LiveDateTime";

export function About() {
  return (
    <section
      id="about"
      className="relative scroll-mt-20 px-4 py-24 sm:py-32"
    >
      <div className="flex flex-col gap-16 lg:flex-row lg:justify-between lg:gap-12">
        {/* left — bio */}
        <div className="max-w-2xl">
          <p className="mb-10 text-sm text-muted">A little about me</p>
          <div className="space-y-7 text-2xl leading-snug tracking-tight sm:text-[28px]">
            <p>
              Design Engineer &amp; Product Designer crafting cutting-edge and
              innovative interactive experiences using modern web technologies.
            </p>
            <p>
              2+ years of experience in design and development, specializing in
              crafting intuitive, user-focused interfaces for websites, apps,
              and digital products.
            </p>
            <p>
              Currently working as a Product Designer at{" "}
              <a
                href="https://shopos.ai"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
              >
                ShopOS
              </a>
              . Looking for a new challenge. Have been a multidisciplinary
              designer, and much more.
            </p>
          </div>
        </div>

        {/* right — links + meta + barcode (all left-aligned) */}
        <div className="flex flex-col gap-12 text-sm">
          <ul className="-ml-3 flex flex-col gap-1">
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

          <div className="leading-relaxed text-fg">
            <div>{site.birth.date}</div>
            <div>{site.birth.city}</div>
            <div>{site.birth.country}</div>
          </div>

          <div className="leading-relaxed text-fg">
            <div>{site.coordinates.lat}</div>
            <div>{site.coordinates.lng}</div>
          </div>

          <div>
            {/* live current day / date / time, ticking every second */}
            <LiveDateTime className="mb-2 block text-xs text-muted" />
            <Barcode value={site.barcode} className="text-fg opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
