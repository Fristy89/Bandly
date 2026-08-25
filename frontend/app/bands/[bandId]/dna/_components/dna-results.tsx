"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import type {
  ArtistDnaVersionResponse,
  AssetType,
  GeneratedAssetResponse,
  GeneratedLogoOptions,
  LogoImage,
  LogoMark,
} from "@/shared/api/types";
import { Button, ButtonLink } from "@/shared/ui/button";
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
  logoMismatchNote,
  logoCandidates,
  bioPhoto,
}: {
  bandId: string;
  bandName: string;
  assets: GeneratedAssetResponse[];
  version: ArtistDnaVersionResponse | null;
  logoMark: LogoMark | null;
  logoImage?: LogoImage | null;
  /** Bandly's own read on whether the artist's uploaded logo actually fits
   * the DNA that just got compiled (LogoService.checkLogoMatch) — null/
   * undefined when there's nothing to flag (no upload, or a good fit). */
  logoMismatchNote?: string | null;
  /** Every candidate from the /logo/generate call that produced logoMark,
   * not just the applied one — lets "try another" below cycle through
   * already-generated options with zero AI wait (POST .../logo/apply). */
  logoCandidates?: LogoMark[];
  /** A real photo of the artist/band, if one's already been uploaded
   * (SiteContentData.images.bioPhoto) — shown on the public site's bio
   * section, unlike the signature this is never AI-reasoned. */
  bioPhoto?: string | null;
}) {
  const { accessToken } = useAuth();
  const [assets, setAssets] = useState(initialAssets);
  const [signature, setSignature] = useState({ logoMark, logoImage });
  const [mismatchNote, setMismatchNote] = useState(logoMismatchNote ?? null);
  const [generatingAlternative, setGeneratingAlternative] = useState(false);
  const [candidates, setCandidates] = useState(logoCandidates ?? []);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [photo, setPhoto] = useState(bioPhoto ?? null);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const byType = new Map(assets.map((asset) => [asset.assetType, asset]));

  function handleUpdated(updated: GeneratedAssetResponse) {
    setAssets((current) => current.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function generateAlternativeSignature() {
    if (!accessToken) return;
    setGeneratingAlternative(true);
    try {
      const generated = await apiFetch<GeneratedLogoOptions>(`/api/v1/bands/${bandId}/site/logo/generate`, {
        method: "POST",
        token: accessToken,
      });
      // The backend clears logoImage the moment a logoMark is (re)generated
      // (SiteService.updateLogoMark) — mirroring that here keeps this view
      // in sync without a full refetch.
      setSignature({ logoMark: generated.content.logoMark, logoImage: null });
      setCandidates(generated.candidates);
      setCandidateIndex(0);
      setMismatchNote(null);
    } catch (err) {
      // Non-critical — the offer just stays up so they can try again.
      console.error(err instanceof ApiError ? err.message : err);
    } finally {
      setGeneratingAlternative(false);
    }
  }

  /** The actual fix for "not satisfied, want another one, fast": every
   * candidate here already came back from the one AI call generateLogo (or
   * generateAlternativeSignature) made — cycling through them is a plain
   * persist, no generation, so there's nothing to wait on. */
  async function tryAnotherSignature() {
    if (!accessToken || candidates.length < 2) return;
    const nextIndex = (candidateIndex + 1) % candidates.length;
    const next = candidates[nextIndex];
    setCandidateIndex(nextIndex);
    setSignature({ logoMark: next, logoImage: null });
    try {
      await apiFetch(`/api/v1/bands/${bandId}/site/logo/apply`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(next),
      });
    } catch (err) {
      // The UI already shows it — worth persisting, not worth blocking on.
      console.error(err instanceof ApiError ? err.message : err);
    }
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !accessToken) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPhotoStatus("error");
      setPhotoError("That file type isn't supported — try a PNG, JPEG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoStatus("error");
      setPhotoError("That photo is too large — please use one under 5 MB.");
      return;
    }

    setPhotoStatus("uploading");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      await apiFetch(`/api/v1/bands/${bandId}/site/photo/upload`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      setPhoto(dataUrl);
      setPhotoStatus("idle");
    } catch (err) {
      setPhotoStatus("error");
      setPhotoError(err instanceof ApiError ? err.message : "Couldn't upload that photo.");
    }
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
            logoMark={signature.logoMark}
            logoImage={signature.logoImage}
            className="mt-4 block h-20 text-6xl leading-tight sm:h-28 sm:text-7xl"
          />
        ) : (
          <h1 className="mt-4 font-display text-display-lg text-ink">Your Artist DNA</h1>
        )}
        {!signature.logoImage && candidates.length > 1 ? (
          <button
            type="button"
            onClick={tryAnotherSignature}
            className="mt-2 text-xs text-ink-faint underline decoration-border underline-offset-4 hover:text-ink"
          >
            Not this one? Try another style
          </button>
        ) : null}
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
          Compiled from your conversation with Bandly. Nothing here is published yet — read it over, rewrite
          anything that isn&apos;t quite you.
        </p>

        {mismatchNote ? (
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-attention/30 bg-attention-soft p-4 text-left">
            <p className="text-sm text-ink">{mismatchNote}</p>
            <div className="mt-3 flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                loading={generatingAlternative}
                onClick={generateAlternativeSignature}
              >
                Generate a matching signature instead
              </Button>
              <button
                type="button"
                onClick={() => setMismatchNote(null)}
                className="text-xs text-ink-faint underline decoration-border underline-offset-4 hover:text-ink"
              >
                Keep my own logo
              </button>
            </div>
          </div>
        ) : null}
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

      <div
        className="mb-6 flex items-center gap-4 rounded-[28px] bg-surface/70 p-6 shadow-[0_1px_2px_rgba(36,32,26,0.04),0_16px_40px_-24px_rgba(36,32,26,0.18)] backdrop-blur-xl motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)]"
        style={riseInDelay(1.5)}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={bandName || "Your photo"} className="size-14 rounded-full object-cover" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-5">
              <path
                d="M4.5 8.5A1.5 1.5 0 0 1 6 7h2l1-2h6l1 2h2a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18Z"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3.25" />
            </svg>
          </span>
        )}
        <div className="text-xs text-ink-muted">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoStatus === "uploading"}
            className="font-medium text-ink underline decoration-border underline-offset-4 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {photoStatus === "uploading" ? "Uploading…" : photo ? "Replace photo" : "Add a photo of yourself or the band"}
          </button>
          <p className="mt-0.5">
            {photoError ?? "Shown on your public site's bio section, so fans know who they're looking at."}
          </p>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          onChange={handlePhotoSelected}
          className="hidden"
        />
      </div>

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
