import type { SiteImages, SiteTexts } from "@/lib/types";

export function Bio({ artistName, texts, images }: { artistName: string; texts: SiteTexts; images: SiteImages }) {
  if (!texts.bio) return null;

  return (
    <section id="bio" className="mx-auto max-w-3xl px-6 py-24">
      <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
        <div>
          <h2 className="font-display text-3xl italic text-ink">Bio</h2>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-muted">{texts.bio}</p>
        </div>
        {images.bioPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images.bioPhoto} alt={artistName} className="w-full rounded-lg object-cover" />
        ) : null}
      </div>
    </section>
  );
}
