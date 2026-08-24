"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import { Card } from "@/shared/ui/card";

/**
 * Lands here after OAuth2LoginSuccessHandler redirects the browser back
 * from Google with a one-time ?code= — never the real session, see
 * OAuthExchangeCodeStore on the backend for why. This page's only job is
 * to redeem that code once (loginWithOAuthCode) and get out of the way.
 */
export function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuthCode } = useAuth();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    loginWithOAuthCode(code)
      .then(() => {
        if (!cancelled) router.replace("/bands");
      })
      .catch((err) => {
        if (cancelled) return;
        setExchangeError(
          err instanceof ApiError ? err.message : "Couldn't complete Google sign-in — try again.",
        );
      });
    return () => {
      cancelled = true;
    };
    // Redeeming the code is a one-time action tied to the code itself, not
    // something that should re-run if loginWithOAuthCode's identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const error = exchangeError ?? (code ? null : "No sign-in code was provided — try signing in again.");

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p role="alert" className="text-sm text-attention">
          {error}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-strong"
        >
          Back to login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <p className="text-sm text-ink-muted">Finishing sign-in…</p>
    </Card>
  );
}
