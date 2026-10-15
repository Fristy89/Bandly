"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import { PLATFORM_BAND_ID } from "@/shared/lib/platform";
import { IdentityChat } from "@/app/bands/[bandId]/dna/_components/identity-chat";

/**
 * The admin runs Bandly's own Artist DNA here — the same 20-question intake
 * every artist gets, pointed at the seeded platform band. The DNA it
 * produces is what the login screen shows new visitors (PlatformEcho).
 * Gated by GET /api/v1/admin/me (the bandly.admin.emails allowlist); the
 * OWNER membership that makes the band-scoped endpoints work is granted at
 * sign-in by AuthService.
 */
export default function AdminDnaPage() {
  const router = useRouter();
  const { accessToken, status } = useAuth();
  const [state, setState] = useState<"checking" | "ok">("checking");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "anonymous") {
      router.replace("/login");
      return;
    }
    if (!accessToken) return;
    let cancelled = false;
    apiFetch("/api/v1/admin/me", { token: accessToken })
      .then(() => {
        if (!cancelled) setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        // 403 (not an admin) or anything else — this screen isn't for them.
        if (!(err instanceof ApiError)) console.error(err);
        router.replace("/bands");
      });
    return () => {
      cancelled = true;
    };
  }, [status, accessToken, router]);

  if (state !== "ok") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-ink-muted">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <IdentityChat bandId={PLATFORM_BAND_ID} initialPhase="intro" />
    </div>
  );
}
