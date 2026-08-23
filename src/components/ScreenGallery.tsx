"use client";

// ScreenGallery — a flow, screen by screen, in a grid.
//
// Used twice: the setup flow between the problem and the idea, and the memory
// surface just before the agents arrive. A grid rather than a run of figures
// down the page, because the point in both cases is the extent of it — how much
// was being asked of someone, and how much memory ended up holding — and you
// only see that with every screen in view at once.
//
// Set in the order the screens are met, not the order the files were numbered.

import Image from "next/image";

const BASE = "/case-studies/brand-memory";

type Screen = { src: string; alt: string; w: number; h: number };
export type GallerySet = "onboarding" | "memory";

const ONBOARDING: Screen[] = [
  ["11", "The welcome screen: drop files, say what you want, get results."],
  ["12", "The prompt bar, with the brand and the vibe still typed by hand."],
  ["13", "The ask: add your brand's website, so it can be read once."],
  ["14", "Memory, empty: a field for the website and a drop zone for documents."],
  ["18", "The website accepted, still waiting on the branding documents."],
  ["17", "Two documents in, and the panels beginning to fill."],
  ["15", "Memory populated: colours, fonts, documents, characters, scenes, logos."],
  ["16", "The characters held in memory, filterable by gender, ethnicity and age."],
].map(([n, alt]) => ({ src: `${BASE}/onboarding/${n}.webp`, alt, w: 1400, h: 910 }));

/* What memory came to hold, worked through one brand: the moodboards, then the
   assets, the voice, the personas, and the two panels where any of it can be
   edited by hand. */
const MEMORY: Screen[] = [
  ["23", "Moodboards held for the brand: urban chic, rustic charm, coastal breeze, minimalist haven."],
  ["24", "Brand assets, with the characters the brand casts with."],
  ["25", "Voice and tone, down to an archetype: the visionary creator."],
  ["26", "Customer personas, written out as people rather than segments."],
  ["31", "Editing the visual DNA by hand: logos, colours, fonts."],
  ["27", "Editing voice by hand: formality, humour, empathy, and the terms to avoid."],
  ["29", "The moodboards again, as the brand page settles."],
  ["30", "The composer, with the brand already attached to the request."],
  ["28", "The upgrade prompt, met at the edge of what a free brand can hold."],
].map(([n, alt]) => ({ src: `${BASE}/memory-screens/${n}.webp`, alt, w: 1280, h: 832 }));

const SETS: Record<GallerySet, Screen[]> = {
  onboarding: ONBOARDING,
  memory: MEMORY,
};

const CAPTIONS: Record<GallerySet, string> = {
  onboarding: "The v1 design: onboarding.",
  memory: "The v2 redesign.",
};

export function ScreenGallery({ set }: { set: GallerySet }) {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {SETS[set].map((screen) => (
          <div
            key={screen.src}
            className="overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={screen.src}
              alt={screen.alt}
              width={screen.w}
              height={screen.h}
              sizes="(max-width: 767px) 46vw, 31vw"
              // the screens are their own ratio, so nothing is cropped
              className="block w-full"
              // cut and encoded at the size the grid shows them
              unoptimized
            />
          </div>
        ))}
      </div>
      {/* on the story's body size, the way the notes under the other figures are */}
      <figcaption className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
        {CAPTIONS[set]}
      </figcaption>
    </figure>
  );
}
