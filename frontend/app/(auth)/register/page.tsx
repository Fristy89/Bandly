"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [bandName, setBandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; bandName?: string }>({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!bandName.trim()) {
      nextErrors.bandName = "Tell us who you are — an artist or band name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "That doesn't look like a full email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    // Visual-design pass only — no account is actually created yet.
    window.setTimeout(() => {
      router.push("/bands/marlow-bend/focus");
    }, 650);
  }

  return (
    <Card className="p-8">
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
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          hint={errors.password ? undefined : "This is just for you — no one else logs in as you."}
        />

        <Button type="submit" size="md" className="mt-1 w-full" loading={loading}>
          {loading ? "Setting up" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already on Bandly?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-strong"
        >
          Log in
        </Link>
      </p>
    </Card>
  );
}
