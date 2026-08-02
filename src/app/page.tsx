import { AsciiHero } from "@/components/AsciiHero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import HorizontalLineLoader from "@/components/HorizontalLineLoader";
import LayoutSkeleton from "@/components/LayoutSkeleton";
import { PageBlur } from "@/components/PageBlur";
import ScrollReveal from "@/components/ScrollReveal";

// inset hairline between sections — padding matches the content padding so the
// line aligns with everything else instead of bleeding edge-to-edge. Draws in
// from the left when it scrolls into view.
function SectionDivider() {
  return (
    <div className="px-4">
      <div data-reveal="line" className="hairline h-px w-full" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* page-load shimmer — one gaussian sweep across graduated strokes, then
          it fades out. Stroke color follows the theme (#000 dark / #56565E light) */}
      <LayoutSkeleton color="var(--loader-stroke)" />

      {/* one observer for every [data-reveal] / [data-reveal-group] on the page */}
      <ScrollReveal />

      <main>
        <AsciiHero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Experience />
      </main>
      <SectionDivider />
      <Footer />

      {/* page-wide bottom blur; hides itself once the footer is in view */}
      <PageBlur />

      {/* faint sweeping line — dark mode only (hidden via .hll in light theme) */}
      <HorizontalLineLoader />
    </>
  );
}
