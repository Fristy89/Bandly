import type { ReactNode } from "react";
import { BrandMark } from "@/shared/ui/brand-mark";
import { MeterBleed } from "@/shared/ui/meter-bleed";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      {/* Identity panel — deliberately locked to the dark palette regardless
          of the active theme, like an instrument's faceplate. Carries the
          meter motif and the app's one line of positioning copy, which is
          otherwise invisible until after login. */}
      <aside className="dark relative hidden shrink-0 flex-col justify-between overflow-hidden bg-paper px-12 py-14 lg:flex lg:w-[42%] xl:w-[38%]">
        <div
          className="pointer-events-none absolute inset-y-0 -right-10 w-48 opacity-70"
          aria-hidden="true"
        >
          <MeterBleed className="h-full w-full" />
        </div>

        <div className="relative z-10">
          <BrandMark animated />
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-display text-display-lg italic leading-snug text-ink">
            Attention is the scarce resource.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Bandly ranks what actually needs you this week, caps it at five
            things, and stays quiet about everything else.
          </p>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10">
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <BrandMark animated />
          <p className="text-sm text-ink-muted">The artist operating system.</p>
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
