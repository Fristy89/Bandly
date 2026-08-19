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

  return (
    <>
      <Navbar artistName={content.artist.name} logoMark={content.logoMark} />
      <main>
        <Hero artist={content.artist} images={content.images} logoMark={content.logoMark} />
        <MusicSection tracks={content.tracks} />
        <ShowsSection shows={content.shows} />
        <Bio texts={content.texts} images={content.images} />
        <ContactSection artist={content.artist} />
      </main>
      <Footer artistName={content.artist.name} />
    </>
  );
}
