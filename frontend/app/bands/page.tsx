"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import type { BandResponse } from "@/shared/api/types";
import { useAuth } from "@/shared/auth/auth-context";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

/**
 * Where login/register land before a bandId is known. Redirects straight
 * through if the user already has a band; otherwise this is the "create
 * your first band" step the auth screens never had to show before, because
 * they used to redirect to a hardcoded mock bandId.
 */
export default function BandsLandingPage() {
  const router = useRouter();
  const { status, accessToken } = useAuth();
  const [bands, setBands] = useState<BandResponse[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    apiFetch<BandResponse[]>("/api/v1/bands", { token: accessToken })
      .then((result) => {
        if (result.length > 0) {
          router.replace(`/bands/${result[0].id}/focus`);
        } else {
          setBands(result);
        }
      })
      .catch(() => setBands([]));
  }, [status, accessToken, router]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !accessToken) return;
    setError(null);
    setCreating(true);
    try {
      const band = await apiFetch<BandResponse>("/api/v1/bands", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ name: name.trim() }),
      });
      router.push(`/bands/${band.id}/focus`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the band — try again.");
      setCreating(false);
    }
  }

  if (status !== "authenticated" || bands === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <Card className="w-full max-w-sm p-8">
        <h1 className="font-display text-display-lg text-ink">One band to start</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          You can add more later — this is just who we&apos;re setting up for now.
        </p>
        <form className="mt-7 flex flex-col gap-5" onSubmit={handleCreate} noValidate>
          <Input
            label="Artist or band name"
            autoComplete="organization"
            placeholder="Marlow Bend"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {error ? (
            <p role="alert" className="text-sm text-attention">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="md" className="mt-1 w-full" loading={creating}>
            {creating ? "Creating" : "Create band"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
