"use client";

import { useState } from "react";
import type { Track } from "@/lib/types";

/**
 * A plain HTML5 <audio> player — the reference site's MusicPlayer/
 * MusicVisualizer pairing (a persistent bottom player driving a WebGL
 * canvas via the Web Audio API) is real scope on its own and explicitly
 * deferred here, not attempted as a thin copy.
 */
export function MusicSection({ tracks }: { tracks: Track[] }) {
  const [activeId, setActiveId] = useState<string | null>(tracks[0]?.id ?? null);
  const active = tracks.find((track) => track.id === activeId) ?? tracks[0];

  if (tracks.length === 0) {
    return (
      <section id="music" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="font-display text-3xl italic text-ink">Music</h2>
        <p className="mt-3 text-ink-muted">Tracks will show up here once they&apos;re added.</p>
      </section>
    );
  }

  return (
    <section id="music" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-display text-3xl italic text-ink">Music</h2>

      <div className="mt-8 flex flex-col gap-1">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setActiveId(track.id)}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors ${
              track.id === active?.id ? "bg-surface text-ink" : "text-ink-muted hover:bg-surface/60"
            }`}
          >
            {track.artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.artwork} alt="" className="size-10 rounded object-cover" />
            ) : (
              <span className="size-10 shrink-0 rounded bg-border" aria-hidden="true" />
            )}
            <span className="font-medium">{track.title}</span>
          </button>
        ))}
      </div>

      {active ? (
        <audio key={active.id} controls className="mt-8 w-full" src={active.src}>
          Your browser doesn&apos;t support audio playback.
        </audio>
      ) : null}
    </section>
  );
}
