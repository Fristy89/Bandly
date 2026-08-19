"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/auth-context";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

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
    <Card className="p-8">
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
              className="text-xs text-ink-muted underline decoration-border underline-offset-4 hover:text-accent"
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

        <Button type="submit" size="md" className="mt-1 w-full" loading={loading}>
          {loading ? "Logging in" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Bandly?{" "}
        <Link
          href="/register"
          className="font-medium text-accent hover:text-accent-strong"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
