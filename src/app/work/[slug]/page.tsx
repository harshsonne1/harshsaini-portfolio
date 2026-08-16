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
import { CaseStudyStory, storyRailItems } from "@/components/CaseStudyStory";
import { CoverVideo } from "@/components/CoverVideo";
import SectionRail from "@/components/SectionRail";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} by ${site.name}`,
    description: project.description,
  };
}

// one meta cell of the Year / Industry / Scope / Website row
function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm text-muted">{label}</div>
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

      {/* section rail — only the long-form stories have sections to page through */}
      {project.story && <SectionRail items={storyRailItems(project.story)} />}

      {/* main is unpadded: text blocks carry the 1400px container themselves so
          images can run the full viewport in the footer's gutters */}
      <main className="w-full pt-20 sm:pt-24">
        {/* header — wordmark left, opening statement right */}
        <div className="title-intro mx-auto grid w-full grid-cols-1 gap-y-10 page-gutter md:grid-cols-2 md:gap-x-12">
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
              {/* the opening statement, set to 48px on desktop so it carries
                  the header beside the wordmark rather than reading as a deck */}
              <p className="text-3xl leading-snug text-fg sm:text-4xl md:text-5xl">
                {project.statement}
              </p>
              {project.story && (
                // a newline in the subhead opens a new paragraph, so the lead
                // line can stand on its own above the copy
                <div className="mt-6 flex flex-col gap-y-4">
                  {project.story.subhead
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <p key={i} className="leading-relaxed text-muted">
                        {line}
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta row, on the header's own two-column split: Year under the
            wordmark, the other three under the statement. Four even columns
            spread them across the full width and broke that alignment. */}
        <div className="title-intro mx-auto mt-10 grid w-full grid-cols-1 gap-x-8 gap-y-8 page-gutter md:grid-cols-2 md:gap-x-12 lg:mt-14">
          <Meta label="Year">{project.year}</Meta>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3 md:gap-x-12">
            <Meta label="Industry">{project.industry}</Meta>
            <Meta label="Scope">{project.scope}</Meta>
            <Meta label="Website">
              {project.link ? (
                <span className="-ml-3 inline-block text-sm">
                  {/* literal brackets: the drawn corner ones need a padded
                      box, which this cell's line of text doesn't give them */}
                  <BracketLink
                    label="[ Visit ]"
                    href={project.link}
                    bracketsMode="none"
                  />
                </span>
              ) : (
                <span className="text-muted">Not public</span>
              )}
            </Meta>
          </div>
        </div>

        {/* cover — full viewport width, in the footer's gutters. When the
            project carries a video, it plays here as soon as the cover comes
            into view, over the still it uses as its poster. */}
        {(project.image || project.video) && (
          <div className="mt-10 w-full page-gutter lg:mt-12">
            <div
              className="hero-reveal relative aspect-video w-full overflow-hidden"
              style={
                project.image
                  ? {
                      backgroundImage: `url(${project.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {project.video && (
                <CoverVideo src={project.video} poster={project.image} />
              )}
            </div>
          </div>
        )}

        {/* body — the long-form story when there is one, else the short sections */}
        {project.story ? (
          <CaseStudyStory story={project.story} />
        ) : (
          <div className="mx-auto mt-20 max-w-3xl px-4 sm:mt-28">
            {project.body?.map((section) => (
              <section key={section.heading} className="mb-14 last:mb-0">
                <h2 className="font-label text-contrast">{section.heading}</h2>
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
          className={`mx-auto w-full page-gutter ${project.story ? "" : "mt-24 sm:mt-32"}`}
        >
          <Link href="/#projects" className="-ml-3 inline-block text-sm">
            <BracketLink label="Back to work" bracketsMode="none" />
          </Link>
        </div>
      </main>

      <div className="mt-24 page-gutter">
        <div data-reveal="line" className="hairline h-px w-full" />
      </div>
      <Footer />

      {/* same page-wide treatments as the home page */}
      <PageBlur />
      <HorizontalLineLoader />
    </>
  );
}
