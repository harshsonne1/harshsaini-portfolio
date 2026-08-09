import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, site } from "@/content/site";
import { HeroNav } from "@/components/HeroNav";
import { Footer } from "@/components/Footer";
import LayoutSkeleton from "@/components/LayoutSkeleton";
import HorizontalLineLoader from "@/components/HorizontalLineLoader";
import { BracketLink } from "@/components/BracketLink";
import { PageBlur } from "@/components/PageBlur";
import ScrollReveal from "@/components/ScrollReveal";
import GlitchInitial from "@/components/GlitchInitial";
import { CaseStudyStory } from "@/components/CaseStudyStory";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${site.name}`,
    description: project.description,
  };
}

// one meta cell of the Year / Industry / Scope / Website row
function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-sm text-fg">{children}</div>
    </div>
  );
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      {/* same page-load shimmer as the home page */}
      <LayoutSkeleton color="var(--loader-stroke)" />
      <ScrollReveal />
      <HeroNav compact />

      {/* main is unpadded: text blocks carry the 1400px container themselves so
          images can run the full viewport in the footer's gutters */}
      <main className="w-full pt-28 sm:pt-36">
        {/* header — wordmark left, opening statement right */}
        <div className="title-intro mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-y-10 px-4 md:grid-cols-2 md:gap-x-12">
          {/* every word's initial takes the Monoska glitch, offset per word so
              they don't scramble in sync. Each word is one inline-block so the
              line can only break at the spaces between words — the glitch
              letter and the rest of its word would otherwise be split. */}
          <h1 className="font-hero-1 leading-none text-fg text-[clamp(2.5rem,8vw,5.5rem)]">
            {project.title.split(" ").map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {i > 0 && " "}
                <span className="inline-block whitespace-nowrap">
                  <GlitchInitial
                    letter={word.charAt(0)}
                    intervalMs={4800 + i * 700}
                  />
                  {word.slice(1)}
                </span>
              </Fragment>
            ))}
          </h1>
          {project.statement && (
            <div>
              <p className="text-xl leading-snug text-fg sm:text-2xl md:text-3xl">
                {project.statement}
              </p>
              {project.story && (
                <p className="mt-6 leading-relaxed text-muted">
                  {project.story.subhead}
                </p>
              )}
            </div>
          )}
        </div>

        {/* meta row — 4 cols with the same gap as the 2-col header above, which
            lands Scope exactly on the statement's left edge (both at W/2 + 24) */}
        <div className="title-intro mx-auto mt-16 grid w-full max-w-[1400px] grid-cols-2 gap-x-8 gap-y-8 px-4 sm:mt-24 md:grid-cols-4 md:gap-x-12">
          <Meta label="Year">{project.year}</Meta>
          <Meta label="Industry">{project.industry}</Meta>
          <Meta label="Scope">{project.scope}</Meta>
          <Meta label="Website">
            {project.link ? (
              <span className="-ml-3 inline-block text-sm">
                <BracketLink
                  label="Visit"
                  href={project.link}
                  bracketsMode="none"
                />
              </span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </Meta>
        </div>

        {/* cover — full viewport width, in the footer's gutters */}
        {project.image && (
          <div className="mt-14 w-full px-4 sm:mt-20">
            <div
              className="hero-reveal aspect-video w-full overflow-hidden"
              style={{
                backgroundImage: `url(${project.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        {/* body — the long-form story when there is one, else the short sections */}
        {project.story ? (
          <CaseStudyStory story={project.story} />
        ) : (
          <div className="mx-auto mt-20 max-w-3xl px-4 sm:mt-28">
            {project.body?.map((section) => (
              <section key={section.heading} className="mb-14 last:mb-0">
                <h2 className="text-xs uppercase tracking-wider text-muted">
                  {section.heading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-fg sm:text-xl">
                  {section.text}
                </p>
              </section>
            ))}
          </div>
        )}

        {/* back to the work grid — the story's last section already carries a
            deep bottom pad, so it only needs the extra lead-in without one */}
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 ${project.story ? "" : "mt-24 sm:mt-32"}`}
        >
          <Link href="/#projects" className="-ml-3 inline-block text-sm">
            <BracketLink label="Back to work" bracketsMode="none" />
          </Link>
        </div>
      </main>

      <div className="mt-24 px-4">
        <div data-reveal="line" className="hairline h-px w-full" />
      </div>
      <Footer />

      {/* same page-wide treatments as the home page */}
      <PageBlur />
      <HorizontalLineLoader />
    </>
  );
}
