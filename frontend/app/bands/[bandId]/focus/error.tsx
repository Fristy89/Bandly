"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function FocusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col items-start gap-3 px-8 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
        Focus
      </p>
      <h1 className="font-display text-display-lg text-ink">
        This week didn&rsquo;t load.
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Something went wrong pulling this week&rsquo;s list together. It
        isn&rsquo;t gone — try again in a moment.
      </p>
      <Button variant="secondary" onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
