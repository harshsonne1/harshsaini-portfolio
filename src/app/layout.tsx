import type { Metadata } from "next";
import { Space_Grotesk, Chakra_Petch } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/content/site";
import { PageBackground } from "@/components/PageBackground";
import "./globals.css";

// font-hero-1: geometric display for the big hero wordmark
const fontHero = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hero",
  display: "swap",
});
// font-pixel: techy accent used on each word's first letter
const fontPixel = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-pixel",
  display: "swap",
});
// font-monoska: the big wordmark (DESIGN ENGINEER / PRODUCT DESIGNER) + H / S
const fontMonoska = localFont({
  src: "./fonts/Monoska.ttf",
  variable: "--font-monoska",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
  // favicon swaps with the browser's color scheme
  icons: {
    icon: [
      {
        url: "/favicon-lightmode.webp",
        type: "image/webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-darkmode.webp",
        type: "image/webp",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    type: "website",
  },
};

// Blocking script: apply the persisted theme to <html> before first paint, so
// the page (and the page-load skeleton) come up in the selected mode with no
// flash. Defaults to dark. Kept tiny and inline so it runs before hydration.
// Also arms the scroll reveals (see ScrollReveal.tsx) — gating their hidden
// state on a scripted class keeps content visible if the script never runs,
// and setting it here rather than on mount avoids a flash of revealed content.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}document.documentElement.classList.add('js-reveal');})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontHero.variable} ${fontPixel.variable} ${fontMonoska.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <PageBackground />
        {children}
      </body>
    </html>
  );
}
