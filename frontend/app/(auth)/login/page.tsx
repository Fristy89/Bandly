"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, API_BASE } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import { Button } from "@/shared/ui/button";
import { AuthPanel } from "@/shared/ui/auth-panel";
import { Input } from "@/shared/ui/input";
import { ctaEnergyHandlers } from "@/shared/lib/cta-energy";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/bands");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach Bandly — try again.");
      setLoading(false);
    }
  }

  return (
    <AuthPanel>
      <h1 className="font-display text-display-lg text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Log in to see what actually needs you this week.
      </p>

      <form
        className="mt-7 flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourband.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </label>
            <Link
              href="#"
              className="text-xs text-ink-muted underline decoration-border underline-offset-4 hover:text-dna-violet"
            >
              Forgot it?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-attention">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="md"
          className="mt-1 w-full"
          loading={loading}
          {...ctaEnergyHandlers}
        >
          {loading ? "Entering…" : "Enter your universe"}
        </Button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* A plain redirect, not a fetch — the browser needs to actually
          navigate here so the backend can set the OAuth2 state cookie and
          hand off to Google's own login page (see SecurityConfig.oauth2Login
          / CookieAuthorizationRequestRepository on the backend). */}
      <a
        href={`${API_BASE}/oauth2/authorization/google`}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-sm font-medium text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]"
      >
        Continue with Google
      </a>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Bandly?{" "}
        <Link
          href="/register"
          className="font-medium text-dna-violet hover:text-dna-violet-strong"
        >
          Create an account
        </Link>
      </p>
    </AuthPanel>
  );
}
