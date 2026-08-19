import type { Show } from "@/lib/types";

/** A plain list — the reference site's LimburgMap (a 3D WebGL scene with a
 * marker per show) is deferred; this covers the same data without it. */
export function ShowsSection({ shows }: { shows: Show[] }) {
  if (shows.length === 0) return null;

  return (
    <section id="shows" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-display text-3xl italic text-ink">Shows</h2>
      <div className="mt-8 flex flex-col divide-y divide-border">
        {shows.map((show) => (
          <div key={show.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-ink">
                {show.city} — {show.venue}
              </p>
              {show.description ? <p className="text-sm text-ink-muted">{show.description}</p> : null}
            </div>
            <span className="shrink-0 font-mono text-sm text-ink-muted">{show.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
