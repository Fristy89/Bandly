import { cn } from "@/shared/lib/cn";

// A large-scale, low-contrast level-meter — the same motif as `Waveform`,
// scaled up and bled off the edge of the auth identity panel. Structural
// texture, not an illustration: it reads as an instrument at rest, with a
// handful of bars "lit" in accent to suggest the meter is live.
const bars = Array.from({ length: 26 }, (_, i) => {
  const cycle = [22, 58, 34, 71, 44, 88, 30, 62, 40, 76, 26, 54];
  const height = cycle[i % cycle.length];
  const lit = i % 7 === 3 || i % 11 === 8;
  return {
    height,
    lit,
    delay: `${(i % 6) * 0.22}s`,
    duration: `${2.2 + (i % 5) * 0.35}s`,
  };
});

export function MeterBleed({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-end gap-[6px]", className)}
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] shrink-0 origin-bottom rounded-full motion-safe:animate-waveform motion-reduce:opacity-70",
            bar.lit ? "bg-accent/80" : "bg-ink-faint/25",
          )}
          style={{
            height: `${bar.height}%`,
            animationDelay: bar.delay,
            animationDuration: bar.duration,
            boxShadow: bar.lit ? "0 0 10px var(--accent)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
