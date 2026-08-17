import { cn } from "@/shared/lib/cn";

type WaveformProps = {
  className?: string;
  tone?: "muted" | "accent";
};

// A quiet level-meter accent — structural, not decorative. Bars carry
// slightly different heights/timings so it reads as a live signal rather
// than a looping animation. In "accent" tone, one bar in six lights gold
// instead of blue — the two flag signal colors, never the whole set.
const bars = [
  { height: 7, delay: "0s", duration: "2.3s" },
  { height: 12, delay: "0.15s", duration: "2.7s" },
  { height: 16, delay: "0.05s", duration: "2.1s" },
  { height: 10, delay: "0.3s", duration: "2.9s" },
  { height: 14, delay: "0.2s", duration: "2.4s" },
  { height: 8, delay: "0.1s", duration: "2.6s" },
];

export function Waveform({ className, tone = "muted" }: WaveformProps) {
  return (
    <div
      className={cn("flex items-end gap-[3px]", className)}
      aria-hidden="true"
    >
      {bars.map((bar, i) => {
        const lit = tone === "accent" ? (i === 4 ? "bg-gold" : i % 3 === 1 ? "bg-accent" : "bg-ink-faint") : "bg-ink-faint";
        return (
          <span
            key={i}
            className={cn(
              "w-[3px] origin-bottom rounded-full motion-safe:animate-waveform motion-reduce:opacity-60",
              lit,
            )}
            style={{
              height: bar.height,
              animationDelay: bar.delay,
              animationDuration: bar.duration,
            }}
          />
        );
      })}
    </div>
  );
}
