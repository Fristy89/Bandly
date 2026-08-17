import { cn } from "@/shared/lib/cn";
import { Waveform } from "./waveform";

type BrandMarkProps = {
  className?: string;
  withWaveform?: boolean;
};

export function BrandMark({ className, withWaveform = true }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-display text-xl italic text-ink">Bandly</span>
      {withWaveform ? <Waveform className="h-3.5" /> : null}
    </div>
  );
}
