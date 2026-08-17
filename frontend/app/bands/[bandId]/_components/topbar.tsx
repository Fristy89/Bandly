"use client";

import { usePathname } from "next/navigation";
import { IconMenu } from "@/shared/ui/icons";
import { Waveform } from "@/shared/ui/waveform";

const sectionLabels: Record<string, string> = {
  focus: "Focus",
  "artist-dna": "Artist DNA",
  releases: "Releases",
  content: "Content",
  relationships: "Relationships",
  "rights-admin": "Rights & Admin",
  finance: "Finance",
  grants: "Grants",
};

export function Topbar({
  bandName,
  onMenuClick,
}: {
  bandName: string;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() ?? "focus";
  const label = sectionLabels[segment] ?? "Focus";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          className="-ml-1.5 flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink md:hidden"
        >
          <IconMenu className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-ink-muted sm:inline">{bandName}</span>
          <span className="hidden text-ink-faint sm:inline">/</span>
          <span className="font-medium text-ink">{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-xs text-ink-faint sm:inline">
          Synced just now
        </span>
        <Waveform className="h-3" />
      </div>
    </header>
  );
}
