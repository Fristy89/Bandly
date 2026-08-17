"use client";

import { useState, type ReactNode } from "react";
import type { Band } from "@/shared/data/mock";
import { cn } from "@/shared/lib/cn";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function BandShell({
  bandId,
  bandName,
  bands,
  userName,
  userRole,
  children,
}: {
  bandId: string;
  bandName: string;
  bands: Band[];
  userName: string;
  userRole: string;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex h-dvh">
      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out md:static md:translate-x-0",
          navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <Sidebar
          bandId={bandId}
          bands={bands}
          userName={userName}
          userRole={userRole}
          onNavigate={() => setNavOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar bandName={bandName} onMenuClick={() => setNavOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
