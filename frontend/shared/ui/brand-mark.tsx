import { cn } from "@/shared/lib/cn";
import { Waveform } from "./waveform";

type BrandMarkProps = {
  className?: string;
  withWaveform?: boolean;
  /** Draw the signature swash on mount instead of showing it already-signed. */
  animated?: boolean;
};

/**
 * The wordmark, signed: "Bandly" set in Fraunces, with a single confident
 * underline swash — a signature, not a decoration. Static by default (it
 * sits in persistent chrome like the sidebar); pass `animated` for one-time
 * arrival moments like the auth screen, where it draws itself on.
 */
export function BrandMark({ className, withWaveform = true, animated = false }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-end gap-3", className)}>
      <span className="inline-flex flex-col">
        <span className="font-display text-xl italic leading-none text-ink">Bandly</span>
        <svg
          viewBox="0 0 130 20"
          preserveAspectRatio="none"
          className="mt-1 h-[9px] w-[66px] text-accent"
          aria-hidden="true"
        >
          <path
            d="M3 13.5 C 24 24, 45 2, 66 12 C 84 20, 100 5, 118 11 C 122.5 12.5, 125.5 9.5, 127 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1}
            className={
              animated
                ? "[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[signature-draw_950ms_200ms_cubic-bezier(0.65,0,0.35,1)_forwards] motion-reduce:[stroke-dashoffset:0] motion-reduce:opacity-100"
                : undefined
            }
          />
        </svg>
      </span>
      {withWaveform ? <Waveform className="mb-0.5 h-3.5" /> : null}
    </span>
  );
}
