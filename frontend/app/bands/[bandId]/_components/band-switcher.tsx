"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { BandResponse } from "@/shared/api/types";
import { IconChevronUpDown } from "@/shared/ui/icons";

function roleLabel(role: BandResponse["myRole"]) {
  return role === "OWNER" ? "Owner" : role === "ADMIN" ? "Admin" : "Member";
}

export function BandSwitcher({
  bands,
  currentBandId,
}: {
  bands: BandResponse[];
  currentBandId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = bands.find((band) => band.id === currentBandId) ?? bands[0];

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-left transition-colors hover:border-border-strong"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft font-display text-sm italic text-accent-strong">
          {current.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {current.name}
          </span>
          <span className="block truncate text-xs text-ink-muted">
            {roleLabel(current.myRole)}
          </span>
        </span>
        <IconChevronUpDown className="size-4 shrink-0 text-ink-faint" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg"
        >
          {bands.map((band) => (
            <button
              key={band.id}
              type="button"
              role="option"
              aria-selected={band.id === current.id}
              onClick={() => setOpen(false)}
              className={cn(
                "flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm transition-colors hover:bg-surface",
                band.id === current.id
                  ? "font-medium text-ink"
                  : "text-ink-muted",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft font-display text-xs italic text-accent-strong">
                {band.name.charAt(0)}
              </span>
              <span className="truncate">{band.name}</span>
            </button>
          ))}
          <p className="border-t border-border px-2.5 py-2 text-xs text-ink-faint">
            More bands coming later.
          </p>
        </div>
      ) : null}
    </div>
  );
}
