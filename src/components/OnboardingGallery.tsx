"use client";

// OnboardingGallery — the setup flow, screen by screen.
//
// Eight screens in a grid rather than eight figures down the page: the point is
// the length of the flow, and you only see that when they are all in view at
// once. It is also the setup that the experiment later argues about, so the
// reader has already seen what was being asked of them by the time the funnel
// arrives.
//
// Set in the order the screens are met, not the order the files were numbered.

import Image from "next/image";

const BASE = "/case-studies/brand-memory/onboarding";

const SCREENS = [
  ["11", "The welcome screen: drop files, say what you want, get results."],
  ["12", "The prompt bar, with the brand and the vibe still typed by hand."],
  ["13", "The ask: add your brand's website, so it can be read once."],
  ["14", "Memory, empty: a field for the website and a drop zone for documents."],
  ["18", "The website accepted, still waiting on the branding documents."],
  ["17", "Two documents in, and the panels beginning to fill."],
  ["15", "Memory populated: colours, fonts, documents, characters, scenes, logos."],
  ["16", "The characters held in memory, filterable by gender, ethnicity and age."],
] as const;

export function OnboardingGallery() {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {SCREENS.map(([n, alt]) => (
          <div
            key={n}
            className="overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={`${BASE}/${n}.webp`}
              alt={alt}
              width={1400}
              height={910}
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
        The onboarding flow, screen by screen.
      </figcaption>
    </figure>
  );
}
