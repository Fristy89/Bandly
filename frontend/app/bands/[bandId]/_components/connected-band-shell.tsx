"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/shared/api/client";
import type { BandResponse } from "@/shared/api/types";
import { useAuth } from "@/shared/auth/auth-context";
import { BandShell } from "./band-shell";

/**
 * The real data-fetching layer BandLayout used to skip (it read a static
 * mock array). Deliberately a Client Component, not a Server Component
 * doing an authenticated fetch: the access token only ever lives in
 * AuthProvider's memory (see shared/auth/auth-context.tsx), and keeping it
 * that way — never in a cookie the Next.js server itself could read —
 * is the point of that design, not an accident to work around here.
 */
export function ConnectedBandShell({ bandId, children }: { bandId: string; children: ReactNode }) {
  const router = useRouter();
  const { status, accessToken, user } = useAuth();
  const [bands, setBands] = useState<BandResponse[] | null>(null);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    apiFetch<BandResponse[]>("/api/v1/bands", { token: accessToken })
      .then(setBands)
      .catch(() => setBands([]));
  }, [status, accessToken]);

  useEffect(() => {
    if (bands && bands.length === 0) {
      router.replace("/bands");
    }
  }, [bands, router]);

  if (status !== "authenticated" || bands === null) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  const currentBand = bands.find((band) => band.id === bandId) ?? bands[0];
  if (!currentBand) {
    return null; // redirecting to /bands
  }

  return (
    <BandShell
      bandId={currentBand.id}
      bandName={currentBand.name}
      bands={bands}
      userName={user?.email ?? ""}
      userRole={currentBand.myRole === "OWNER" ? "Owner" : currentBand.myRole === "ADMIN" ? "Admin" : "Member"}
    >
      {children}
    </BandShell>
  );
}
