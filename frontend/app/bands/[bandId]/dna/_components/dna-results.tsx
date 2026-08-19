import Link from "next/link";
import type { ArtistDnaVersionResponse, AssetType, GeneratedAssetResponse } from "@/shared/api/types";
import { Card } from "@/shared/ui/card";
import { ButtonLink } from "@/shared/ui/button";

const ASSET_LABELS: Record<AssetType, string> = {
  SHORT_BIO: "Short bio",
  LONG_BIO: "Long bio",
  ELEVATOR_PITCH: "Elevator pitch",
  ABOUT_THE_ARTIST: "About the artist",
  TONE_OF_VOICE: "Tone of voice",
};

const ASSET_ORDER: AssetType[] = [
  "SHORT_BIO",
  "ELEVATOR_PITCH",
  "LONG_BIO",
  "ABOUT_THE_ARTIST",
  "TONE_OF_VOICE",
];

export function DnaResults({
  bandId,
  assets,
  version,
}: {
  bandId: string;
  assets: GeneratedAssetResponse[];
  version: ArtistDnaVersionResponse | null;
}) {
  const byType = new Map(assets.map((asset) => [asset.assetType, asset]));

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-good">Done</p>
        <h1 className="mt-1 font-display text-display-md text-ink">Your Artist DNA</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Compiled from your conversation with Bandly. Nothing here is published yet — read it over first.
        </p>
      </header>

      {version?.primaryColor ? (
        <Card className="mb-6 flex items-center gap-4 p-4">
          <div className="flex gap-2" role="img" aria-label={`Brand colors: primary ${version.primaryColor}, secondary ${version.secondaryColor}`}>
            <span className="size-8 rounded-full border border-border" style={{ background: version.primaryColor }} />
            {version.secondaryColor ? (
              <span
                className="size-8 rounded-full border border-border"
                style={{ background: version.secondaryColor }}
              />
            ) : null}
          </div>
          <div className="text-xs text-ink-muted">
            <p className="font-mono">{version.primaryColor}{version.secondaryColor ? ` · ${version.secondaryColor}` : ""}</p>
            <p>Now used for your signature logo and site accent color.</p>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        {ASSET_ORDER.map((type) => {
          const asset = byType.get(type);
          if (!asset) return null;
          return (
            <Card key={type} className="p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
                {ASSET_LABELS[type]}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{asset.content}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <ButtonLink href={`/bands/${bandId}/focus`} variant="primary">
          Back to Focus
        </ButtonLink>
        <ButtonLink href={`/bands/${bandId}/dna`} variant="secondary">
          Talk to Bandly again
        </ButtonLink>
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        <Link href={`/bands/${bandId}/dna`} className="underline decoration-border underline-offset-4">
          Starting a new conversation
        </Link>{" "}
        will compile a fresh DNA version when you finish it.
      </p>
    </div>
  );
}
