"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import type { BandResponse } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { AuthPanel } from "@/shared/ui/auth-panel";
import { Input } from "@/shared/ui/input";
import { ctaEnergyHandlers } from "@/shared/lib/cta-energy";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [bandName, setBandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; bandName?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!bandName.trim()) {
      nextErrors.bandName = "Tell us who you are — an artist or band name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "That doesn't look like a full email address.";
    }
    if (password.length < 10) {
      nextErrors.password = "Use at least 10 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError(null);
    setLoading(true);
    try {
      // Two calls, on purpose: an account and a band are different things
      // (blueprint §04) — registering doesn't imply a band yet, so this is
      // the frontend's own "first band" convenience, not a combined endpoint.
      const session = await register(email.trim(), password);
      const band = await apiFetch<BandResponse>("/api/v1/bands", {
        method: "POST",
        token: session.accessToken,
        body: JSON.stringify({ name: bandName.trim() }),
      });
      router.push(`/bands/${band.id}/focus`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't reach Bandly — try again.");
      setLoading(false);
    }
  }

  return (
    <AuthPanel>
      <h1 className="font-display text-display-lg text-ink">Set up Bandly</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        A few details, then straight to what&rsquo;s actually due.
      </p>

      <form
        className="mt-7 flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="Artist or band name"
          type="text"
          name="bandName"
          autoComplete="organization"
          placeholder="Marlow Bend"
          value={bandName}
          onChange={(event) => setBandName(event.target.value)}
          error={errors.bandName}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourband.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 10 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          hint={errors.password ? undefined : "This is just for you — no one else logs in as you."}
        />

        {formError ? (
          <p role="alert" className="text-sm text-attention">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="md"
          className="mt-1 w-full"
          loading={loading}
          {...ctaEnergyHandlers}
        >
          {loading ? "Opening…" : "Begin your universe"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already on Bandly?{" "}
        <Link
          href="/login"
          className="font-medium text-dna-violet hover:text-dna-violet-strong"
        >
          Log in
        </Link>
      </p>
    </AuthPanel>
  );
}
