"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { IconChevronDown } from "./icons";

type DisclosureProps = {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function Disclosure({
  label,
  count,
  defaultOpen = false,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg py-2 text-left text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <span className="flex items-center gap-2">
          {label}
          {typeof count === "number" ? (
            <span className="font-mono text-xs text-ink-muted">{count}</span>
          ) : null}
        </span>
        <IconChevronDown
          className={cn(
            "size-4 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="animate-[rise-in_0.2s_ease-out] pb-1 pt-1">
          {children}
        </div>
      ) : null}
    </div>
  );
}
