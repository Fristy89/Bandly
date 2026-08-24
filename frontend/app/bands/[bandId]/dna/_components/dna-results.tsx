"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { ArtistDnaVersionResponse, AssetType, GeneratedAssetResponse, LogoImage, LogoMark } from "@/shared/api/types";
import { ButtonLink } from "@/shared/ui/button";
import { SignatureMark } from "@/shared/ui/signature-mark";
import { AssetCard } from "./asset-card";

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
  assets: initialAssets,
  version,
  logoMark,
  logoImage,
}: {
  bandId: string;
  bandName: string;
  assets: GeneratedAssetResponse[];
  version: ArtistDnaVersionResponse | null;
  logoMark: LogoMark | null;
  logoImage?: LogoImage | null;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const byType = new Map(assets.map((asset) => [asset.assetType, asset]));

  function handleUpdated(updated: GeneratedAssetResponse) {
    setAssets((current) => current.map((a) => (a.id === updated.id ? updated : a)));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header
        className="mb-12 text-center motion-safe:animate-[rise-in_0.6s_cubic-bezier(0.2,0.8,0.2,1)]"
        style={riseInDelay(0)}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-good">Your Artist DNA is ready</p>
        {bandName ? (
          <SignatureMark
            name={bandName}
            logoMark={logoMark}
            logoImage={logoImage}
            className="mt-4 block h-20 text-6xl leading-tight sm:h-28 sm:text-7xl"
          />
        ) : (
          <h1 className="mt-4 font-display text-display-lg text-ink">Your Artist DNA</h1>
        )}
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
          Compiled from your conversation with Bandly. Nothing here is published yet — read it over, rewrite
          anything that isn&apos;t quite you.
        </p>
      </header>

      {version?.primaryColor ? (
        <div
          className="mb-6 flex items-center gap-4 rounded-[28px] bg-surface/70 p-6 shadow-[0_1px_2px_rgba(36,32,26,0.04),0_16px_40px_-24px_rgba(36,32,26,0.18)] backdrop-blur-xl motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)]"
          style={riseInDelay(1)}
        >
          <div
            className="flex gap-2"
            role="img"
            aria-label={`Brand colors: primary ${version.primaryColor}, secondary ${version.secondaryColor}`}
          >
            <span
              className="size-11 rounded-full shadow-[0_2px_8px_-2px_rgba(36,32,26,0.3)]"
              style={{ background: version.primaryColor }}
            />
            {version.secondaryColor ? (
              <span
                className="size-11 rounded-full shadow-[0_2px_8px_-2px_rgba(36,32,26,0.3)]"
                style={{ background: version.secondaryColor }}
              />
            ) : null}
          </div>
          <div className="text-xs text-ink-muted">
            <p className="font-mono">
              {version.primaryColor}
              {version.secondaryColor ? ` · ${version.secondaryColor}` : ""}
            </p>
            <p className="mt-0.5">Now used for your signature and site accent color.</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        {ASSET_ORDER.map((type, index) => {
          const asset = byType.get(type);
          if (!asset) return null;
          return (
            <AssetCard
              key={asset.id}
              bandId={bandId}
              label={ASSET_LABELS[type]}
              asset={asset}
              style={riseInDelay(2 + index)}
              onUpdated={handleUpdated}
            />
          );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <ButtonLink href={`/bands/${bandId}/focus`} variant="primary">
            Back to Focus
          </ButtonLink>
          <ButtonLink href={`/bands/${bandId}/dna`} variant="secondary">
            Talk to Bandly again
          </ButtonLink>
        </div>
        <p className="text-xs text-ink-faint">
          <Link href={`/bands/${bandId}/dna`} className="underline decoration-border underline-offset-4">
            Starting a new conversation
          </Link>{" "}
          will compile a fresh DNA version when you finish it.
        </p>
      </div>
    </div>
  );
}
