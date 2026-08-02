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
import GlitchInitial from "@/components/GlitchInitial";

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
      <HeroNav compact />

      <main className="px-4 pt-28 sm:pt-36">
        {/* header — wordmark left, opening statement right */}
        <div className="title-intro grid grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-12">
          <h1 className="font-hero-1 leading-none text-fg text-[clamp(2.5rem,8vw,5.5rem)]">
            <GlitchInitial letter={project.title.charAt(0)} intervalMs={4800} />
            {project.title.slice(1)}
          </h1>
          {project.statement && (
            <p className="text-xl leading-snug text-fg sm:text-2xl md:text-3xl">
              {project.statement}
            </p>
          )}
        </div>

        {/* meta row — 4 cols with the same gap as the 2-col header above, which
            lands Scope exactly on the statement's left edge (both at W/2 + 24) */}
        <div className="title-intro mt-16 grid grid-cols-2 gap-x-8 gap-y-8 sm:mt-24 md:grid-cols-4 md:gap-x-12">
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

        {/* cover — full width of the content column */}
        {project.image && (
          <div
            className="hero-reveal mt-14 aspect-video w-full overflow-hidden sm:mt-20"
            style={{
              backgroundImage: `url(${project.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* body — placeholder copy for now */}
        <div className="mx-auto mt-20 max-w-3xl sm:mt-28">
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

        {/* back to the work grid */}
        <div className="mt-24 sm:mt-32">
          <Link href="/#projects" className="-ml-3 inline-block text-sm">
            <BracketLink label="Back to work" bracketsMode="none" />
          </Link>
        </div>
      </main>

      <div className="mt-24 px-4">
        <div className="hairline h-px w-full" />
      </div>
      <Footer />

      {/* same page-wide treatments as the home page */}
      <PageBlur />
      <HorizontalLineLoader />
    </>
  );
}
