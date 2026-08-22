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
  onContinue: (soundReferences: string[]) => void;
}) {
  const { accessToken } = useAuth();
  const [tracks, setTracks] = useState<TrackSlot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      <div className="mt-8 flex items-center gap-3">
        <Button type="button" variant="primary" disabled={analyzing} onClick={() => onContinue(doneDescriptions)}>
          {doneDescriptions.length > 0 ? "Continue to the conversation" : "Skip — start the conversation"}
        </Button>
      </div>
    </div>
  );
}
