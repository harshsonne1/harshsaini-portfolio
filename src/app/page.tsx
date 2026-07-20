import { AsciiHero } from "@/components/AsciiHero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Footer } from "@/components/Footer";
import { PageBlur } from "@/components/PageBlur";

// inset hairline between sections — padding matches the content padding so the
// line aligns with everything else instead of bleeding edge-to-edge
function SectionDivider() {
  return (
    <div className="px-6 sm:px-8">
      <div className="hairline h-px w-full" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <main>
        <AsciiHero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Projects />
      </main>
      <SectionDivider />
      <Footer />

      {/* page-wide bottom blur — auto-hides when the footer is in view */}
      <PageBlur />
    </>
  );
}
