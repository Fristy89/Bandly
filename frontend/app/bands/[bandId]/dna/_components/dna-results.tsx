import Link from "next/link";
import type { CSSProperties } from "react";
import type { ArtistDnaVersionResponse, AssetType, GeneratedAssetResponse, LogoMark } from "@/shared/api/types";
import { Card } from "@/shared/ui/card";
import { ButtonLink } from "@/shared/ui/button";
import { SignatureMark } from "@/shared/ui/signature-mark";

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

/** Each rise-in step lands ~110ms after the last — the hero signature
 * first, then the palette, then the asset cards one by one — so the
 * whole DNA arrives as a single unveiling instead of a wall of text
 * appearing all at once. motion-safe only: motion-reduce users get every
 * element visible immediately via the same rule waveform/brand-mark use. */
function riseInDelay(step: number): CSSProperties {
  return { animationDelay: `${step * 110}ms`, animationFillMode: "backwards" };
}

export function DnaResults({
  bandId,
  bandName,
  assets,
  version,
  logoMark,
}: {
  bandId: string;
  bandName: string;
  assets: GeneratedAssetResponse[];
  version: ArtistDnaVersionResponse | null;
  logoMark: LogoMark | null;
}) {
  const byType = new Map(assets.map((asset) => [asset.assetType, asset]));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header
        className="mb-8 motion-safe:animate-[rise-in_0.6s_cubic-bezier(0.2,0.8,0.2,1)]"
        style={riseInDelay(0)}
      >
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-good">Your Artist DNA is ready</p>
        {bandName ? (
          <SignatureMark
            name={bandName}
            logoMark={logoMark}
            className="mt-2 block text-5xl leading-tight sm:text-6xl"
          />
        ) : (
          <h1 className="mt-2 font-display text-display-md text-ink">Your Artist DNA</h1>
        )}
        <p className="mt-3 text-sm text-ink-muted">
          Compiled from your conversation with Bandly. Nothing here is published yet — read it over first.
        </p>
      </header>

      {version?.primaryColor ? (
        <Card
          className="mb-6 flex items-center gap-4 p-4 motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)]"
          style={riseInDelay(1)}
        >
          <div
            className="flex gap-2"
            role="img"
            aria-label={`Brand colors: primary ${version.primaryColor}, secondary ${version.secondaryColor}`}
          >
            <span
              className="size-10 rounded-full border border-border shadow-sm"
              style={{ background: version.primaryColor }}
            />
            {version.secondaryColor ? (
              <span
                className="size-10 rounded-full border border-border shadow-sm"
                style={{ background: version.secondaryColor }}
              />
            ) : null}
          </div>
          <div className="text-xs text-ink-muted">
            <p className="font-mono">
              {version.primaryColor}
              {version.secondaryColor ? ` · ${version.secondaryColor}` : ""}
            </p>
            <p>Now used for your signature and site accent color.</p>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        {ASSET_ORDER.map((type, index) => {
          const asset = byType.get(type);
          if (!asset) return null;
          return (
            <Card
              key={type}
              className="p-5 motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)]"
              style={riseInDelay(2 + index)}
            >
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
