"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/auth/auth-context";
import { Avatar } from "@/shared/ui/avatar";
import { IconChevronUpDown, IconLogOut } from "@/shared/ui/icons";
import { ThemePicker } from "@/shared/ui/theme-picker";

export function UserMenu({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

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
      {open ? (
        <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-20 w-72 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg">
          <ThemePicker />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <IconLogOut className="size-4" />
            Log out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-raised"
      >
        <Avatar name={name} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {name}
          </span>
          <span className="block truncate text-xs text-ink-muted">{role}</span>
        </span>
        <IconChevronUpDown className="size-4 shrink-0 text-ink-faint" />
      </button>
    </div>
  );
}
