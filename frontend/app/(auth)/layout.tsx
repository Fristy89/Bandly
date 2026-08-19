import type { ReactNode } from "react";
import { BrandMark } from "@/shared/ui/brand-mark";
import { DnaFieldCanvas } from "@/shared/ui/dna-field-canvas";
import { DnaSignatureShowcase } from "@/shared/ui/dna-signature-showcase";

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
    <div className="dark relative min-h-dvh overflow-hidden bg-paper">
      <DnaFieldCanvas className="pointer-events-none fixed inset-0 h-full w-full" />

      <div className="relative z-10 flex min-h-dvh flex-col lg:flex-row">
        <div className="flex shrink-0 flex-col justify-between px-8 py-10 sm:px-12 sm:py-14 lg:w-[42%] xl:w-[38%]">
          <BrandMark animated />

          <div className="hidden max-w-sm lg:block">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              One identity profile, one signature
            </p>
            <DnaSignatureShowcase className="mt-4" />
          </div>

          <div className="hidden max-w-sm lg:block">
            <p className="font-display text-display-lg italic leading-snug text-ink">
              Attention is the scarce resource.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Bandly ranks what actually needs you this week, caps it at five
              things, and stays quiet about everything else.
            </p>
          </div>
        </div>

        <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <p className="text-sm text-ink-muted">The Artist DNA Platform.</p>
          </div>
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
