import { experience } from "@/content/site";
import GlitchInitial from "./GlitchInitial";
import LineReveal from "./LineReveal";

// row reveal sequence (each on top of the global --reveal-base lead-in):
// hairline draws → dates → +0.6s role/company → description, line by line
const DATES_DELAY = 300;
const ROLE_DELAY = DATES_DELAY + 600;
const DESC_DELAY = 1200;

// Timeline of roles, mirroring the reference: a wide three-column row per job —
// period (left), role + company (center), description (right). Each row reveals
// on scroll — see ScrollReveal.tsx for the shared observer.
export function Experience() {
  return (
    <section
      id="experience"
      className="relative scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <h2 className="mb-12 font-hero-1 text-4xl leading-none text-fg sm:mb-16 sm:text-5xl">
        <GlitchInitial letter="E" intervalMs={5900} />xperience
      </h2>

      <div>
        {experience.map((job, i) => (
          // one trigger per row: the hairline draws left-to-right while the
          // period, role/company and description rise in behind it
          <div key={job.company} className="relative" data-reveal-group>
            <div className="grid grid-cols-1 gap-3 py-10 md:grid-cols-12 md:gap-8 md:py-16">
              <div
                data-reveal-item="up"
                style={
                  { "--reveal-delay": `${DATES_DELAY}ms` } as React.CSSProperties
                }
                className="text-xs uppercase tracking-wider text-muted md:col-span-2"
              >
                {job.period}
              </div>
              <div
                data-reveal-item="up"
                style={
                  { "--reveal-delay": `${ROLE_DELAY}ms` } as React.CSSProperties
                }
                className="md:col-span-4 md:col-start-4"
              >
                <h3 className="text-xl leading-tight text-fg">{job.role}</h3>
                <p className="mt-2 text-base text-fg">{job.company}</p>
              </div>
              <LineReveal
                text={job.description}
                delay={DESC_DELAY}
                stagger={120}
                className="leading-relaxed text-muted md:col-span-5 md:col-start-8"
              />
            </div>
            {/* separator (skipped after the last entry) */}
            {i < experience.length - 1 && (
              <span
                data-reveal-item="line"
                className="hairline absolute bottom-0 left-0 h-px w-full"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
