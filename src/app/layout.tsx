import type { Metadata } from "next";
import { Space_Grotesk, Chakra_Petch } from "next/font/google";
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

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontHero.variable} ${fontPixel.variable}`}>
      <body>
        <PageBackground />
        {children}
      </body>
    </html>
  );
}
