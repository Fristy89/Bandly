import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Bio } from "@/components/Bio";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MusicSection } from "@/components/MusicSection";
import { Navbar } from "@/components/Navbar";
import { ShowsSection } from "@/components/ShowsSection";
import { resolveSite } from "@/lib/api";

export default async function SitePage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const host = (await headers()).get("host") ?? "";
  const { site: siteOverride } = await searchParams;

  const resolved = await resolveSite(host, siteOverride);
  if (!resolved) {
    notFound();
  }

  const { content } = resolved;

  // The band's DNA-derived palette (see LogoService on the backend) themes
  // more than just the wordmark: overriding --accent/--accent-strong here
  // reaches every bg-accent/text-accent-strong element below (the "Listen
  // now" button, link hovers, …) via normal CSS custom-property cascade —
  // including the fixed navbar, which inheritance doesn't care about.
  const paletteStyle = content.brandPalette
    ? ({
        "--accent": content.brandPalette.primaryColor,
        "--accent-strong": content.brandPalette.secondaryColor,
      } as React.CSSProperties)
    : undefined;

  return (
    <div style={paletteStyle}>
      <Navbar artistName={content.artist.name} logoMark={content.logoMark} logoImage={content.logoImage} />
      <main>
        <Hero artist={content.artist} images={content.images} logoMark={content.logoMark} logoImage={content.logoImage} />
        <MusicSection tracks={content.tracks} />
        <ShowsSection shows={content.shows} />
        <Bio artistName={content.artist.name} texts={content.texts} images={content.images} />
        <ContactSection artist={content.artist} />
      </main>
      <Footer artistName={content.artist.name} />
    </div>
  );
}
