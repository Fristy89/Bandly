"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import { readAudioFile } from "@/shared/lib/audio";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { IconMusicNote } from "@/shared/ui/icons";

const MAX_TRACKS = 3;

type TrackSlot = {
  id: string;
  fileName: string;
  status: "analyzing" | "done" | "error";
  description?: string;
  error?: string;
};

type LogoUploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "done"; dataUrl: string }
  | { status: "error"; message: string };

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

/**
 * A step before the Identity Chat, not a turn inside it — Gemini (not
 * Claude, which has no audio input at all) actually listens to each track
 * and the resulting descriptions travel into every chat/summarize call as
 * ChatRequest.soundReferences, so Bandly already has real signal for the
 * Sound and Differentiation dimensions on its very first question instead
 * of asking "what does your music sound like" from a blank slate.
 */
export function ReferenceTracksStep({
  bandId,
  onContinue,
}: {
  bandId: string;
  onContinue: (soundReferences: string[], preferredColor: string | null, hasOwnLogo: boolean) => void;
}) {
  const { accessToken } = useAuth();
  const [tracks, setTracks] = useState<TrackSlot[]>([]);
  const [hasOwnColor, setHasOwnColor] = useState(false);
  const [color, setColor] = useState("#1c4fa8");
  const [hasOwnLogo, setHasOwnLogo] = useState(false);
  const [logoUpload, setLogoUpload] = useState<LogoUploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const doneDescriptions = tracks
    .filter((t): t is TrackSlot & { description: string } => t.status === "done" && !!t.description)
    .map((t) => t.description);
  const analyzing = tracks.some((t) => t.status === "analyzing");
  const canAddMore = tracks.length < MAX_TRACKS;

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be picked again later
    if (!file || !accessToken) return;

    const id = crypto.randomUUID();
    setTracks((current) => [...current, { id, fileName: file.name, status: "analyzing" }]);

    try {
      const encoded = await readAudioFile(file);
      const response = await apiFetch<{ description: string }>(`/api/v1/bands/${bandId}/dna/chat/analyze-track`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ audioBase64: encoded.base64, mimeType: encoded.mimeType }),
      });
      setTracks((current) =>
        current.map((t) => (t.id === id ? { ...t, status: "done", description: response.description } : t)),
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Couldn't analyze that track.";
      setTracks((current) => current.map((t) => (t.id === id ? { ...t, status: "error", error: message } : t)));
    }
  }

  function removeTrack(id: string) {
    setTracks((current) => current.filter((t) => t.id !== id));
  }

  async function handleLogoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !accessToken) return;

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setLogoUpload({ status: "error", message: "That file type isn't supported — try a PNG, JPEG, WEBP, or SVG." });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoUpload({ status: "error", message: "That logo is too large — please use one under 2 MB." });
      return;
    }

    setLogoUpload({ status: "uploading" });
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      await apiFetch(`/api/v1/bands/${bandId}/site/logo/upload`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      setLogoUpload({ status: "done", dataUrl });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Couldn't upload that logo.";
      setLogoUpload({ status: "error", message });
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-display-md text-ink">Show Bandly your sound</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Upload up to three reference tracks — your own music, or anything that captures the sound you&apos;re
          going for. Bandly actually listens, so it already understands your sound before the conversation starts.
          Totally optional — skip this if you&apos;d rather just talk.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {tracks.map((track) => (
          <Card key={track.id} className="flex items-start gap-3 p-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              <IconMusicNote className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{track.fileName}</p>
              {track.status === "analyzing" ? (
                <p className="mt-1 text-sm text-ink-faint">Bandly is listening…</p>
              ) : track.status === "done" ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{track.description}</p>
              ) : (
                <p role="alert" className="mt-1 text-sm text-attention">
                  {track.error}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeTrack(track.id)}
              className="shrink-0 text-xs text-ink-faint underline decoration-border underline-offset-4 hover:text-ink"
            >
              Remove
            </button>
          </Card>
        ))}

        {canAddMore ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-4 text-sm text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
          >
            <IconMusicNote className="size-4" />
            {tracks.length === 0 ? "Add a reference track" : "Add another track"}
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={hasOwnColor}
            onChange={(event) => setHasOwnColor(event.target.checked)}
            className="size-4 rounded border-border"
          />
          I already have a brand color
        </label>
        {hasOwnColor ? (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Your brand color"
              className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <span className="font-mono text-sm text-ink-muted">{color}</span>
            <p className="text-xs text-ink-faint">Bandly keeps this exact color and picks a second one that fits.</p>
          </div>
        ) : (
          <p className="mt-1 text-xs text-ink-faint">
            No color yet? Bandly will choose a palette that fits your sound and identity.
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={hasOwnLogo}
            onChange={(event) => {
              setHasOwnLogo(event.target.checked);
              if (!event.target.checked) setLogoUpload({ status: "idle" });
            }}
            className="size-4 rounded border-border"
          />
          I already have a logo design — it tells a story too
        </label>
        {hasOwnLogo ? (
          <div className="mt-3 flex items-center gap-3">
            {logoUpload.status === "done" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUpload.dataUrl} alt="Your uploaded logo" className="h-12 w-12 rounded object-contain" />
            ) : null}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUpload.status === "uploading"}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-colors hover:border-border-strong hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
            >
              {logoUpload.status === "uploading"
                ? "Uploading…"
                : logoUpload.status === "done"
                  ? "Replace logo"
                  : "Upload your logo"}
            </button>
            {logoUpload.status === "error" ? (
              <p role="alert" className="text-xs text-attention">
                {logoUpload.message}
              </p>
            ) : logoUpload.status === "done" ? (
              <p className="text-xs text-ink-faint">Bandly will use this instead of generating a wordmark.</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 text-xs text-ink-faint">
            No logo yet? Bandly will design a signature wordmark that fits your sound.
          </p>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
          onChange={handleLogoSelected}
          className="hidden"
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          disabled={analyzing || logoUpload.status === "uploading"}
          onClick={() => onContinue(doneDescriptions, hasOwnColor ? color : null, logoUpload.status === "done")}
        >
          {doneDescriptions.length > 0 || hasOwnColor || logoUpload.status === "done"
            ? "Continue to the conversation"
            : "Skip — start the conversation"}
        </Button>
      </div>
    </div>
  );
}
