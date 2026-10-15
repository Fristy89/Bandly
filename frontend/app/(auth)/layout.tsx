import type { ReactNode } from "react";
import { BrandMark } from "@/shared/ui/brand-mark";
import { DnaFieldCanvas } from "@/shared/ui/dna-field-canvas";
import { PlatformEcho } from "./_components/platform-echo";

/**
 * "You're not just logging into a platform — you're stepping into an
 * artist's DNA." The whole page is the field now, not just a side panel:
 * DnaFieldCanvas runs full-bleed behind everything, locked to dark
 * regardless of the active theme (an instrument's faceplate, not a themed
 * surface), with content overlaid rather than boxed into a flat aside.
 *
 * The canvas keeps its own calm zone dimmer toward where the form sits
 * (see distanceFromCalmZone in dna-field-canvas.tsx) — the "keep the
 * center readable" requirement is handled there, not by a static scrim
 * layered on top, so it stays correct if the form's position ever moves.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark relative min-h-dvh overflow-hidden bg-[#07060d]">
      <DnaFieldCanvas className="pointer-events-none fixed inset-0 h-full w-full" />

      <div className="relative z-10 flex min-h-dvh flex-col lg:flex-row">
        <div className="flex shrink-0 flex-col justify-between px-8 py-10 sm:px-12 sm:py-14 lg:w-[42%] xl:w-[38%]">
          <div className="flex flex-col gap-8">
            <BrandMark animated />
            <p className="hidden max-w-sm font-display text-display-lg italic leading-snug text-ink lg:block">
              What if an artist&apos;s DNA wasn&apos;t a profile, but a world?
            </p>
          </div>

          <PlatformEcho className="hidden max-w-sm lg:block" />
        </div>

        <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <p className="max-w-xs font-display text-display-md italic leading-snug text-ink">
              What if an artist&apos;s DNA wasn&apos;t a profile, but a world?
            </p>
            <p className="text-sm text-ink-muted">The Artist DNA Platform.</p>
          </div>
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
