import { cn } from "@/shared/lib/cn";
import { Waveform } from "./waveform";

type BrandMarkProps = {
  className?: string;
  withWaveform?: boolean;
  /** Settle the mark in on mount instead of showing it already in place. */
  animated?: boolean;
};

/**
 * The wordmark: "Bandly" set in Kaushan Script, a bold hand-lettered brush
 * face — the letterforms themselves carry the signature now, so there's no
 * separate underline flourish competing with them. Static by default
 * (persistent chrome like the sidebar shouldn't replay an entrance); pass
 * `animated` for one-time arrival moments like the auth screen.
 */
export function BrandMark({ className, withWaveform = true, animated = false }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "font-signature text-[1.75rem] leading-none text-ink",
          animated && "motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards]",
        )}
      >
        Bandly
      </span>
      {withWaveform ? <Waveform className="h-3.5" /> : null}
    </span>
  );
}
