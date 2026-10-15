"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/api/client";
import type { PlatformDnaResponse } from "@/shared/api/types";
import { signalDnaPalette } from "@/shared/lib/platform";

/**
 * Bandly's own Artist DNA, echoed onto the login screen — the platform's
 * philosophy stated by the same pipeline every artist's identity runs
 * through (see PlatformDnaController / the admin at /admin/dna). Renders
 * nothing until it's been generated, so an empty platform DNA just leaves
 * the slogan standing on its own.
 */
export function PlatformEcho({ className }: { className?: string }) {
  const [dna, setDna] = useState<PlatformDnaResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PlatformDnaResponse>("/api/v1/public/platform-dna")
      .then((data) => {
        if (cancelled || !data.generated) return;
        setDna(data);
        if (data.primaryColor && data.secondaryColor) {
          signalDnaPalette({ primary: data.primaryColor, secondary: data.secondaryColor });
        }
      })
      .catch(() => {
        // The login screen stands fine without it — never block on this.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!dna) return null;

  return (
    <div className={className}>
      {dna.brandMantra ? (
        <p className="font-display text-display-md italic leading-snug text-ink">
          &ldquo;{dna.brandMantra}&rdquo;
        </p>
      ) : null}
      {dna.components.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {dna.components.map((component) => (
            <li
              key={component}
              className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted"
            >
              {component}
            </li>
          ))}
        </ul>
      ) : null}
      {dna.primaryArchetype ? (
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          Archetype — {dna.primaryArchetype}
        </p>
      ) : null}
    </div>
  );
}
