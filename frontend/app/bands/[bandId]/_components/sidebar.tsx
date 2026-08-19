"use client";

import { usePathname } from "next/navigation";
import type { BandResponse } from "@/shared/api/types";
import { Badge } from "@/shared/ui/badge";
import { BrandMark } from "@/shared/ui/brand-mark";
import {
  IconContent,
  IconFinance,
  IconFocus,
  IconGrants,
  IconRelationships,
  IconReleases,
  IconRights,
  IconSpark,
} from "@/shared/ui/icons";
import { NavItem } from "@/shared/ui/nav-item";
import { BandSwitcher } from "./band-switcher";
import { UserMenu } from "./user-menu";

const modules = [
  { key: "releases", label: "Releases", icon: IconReleases },
  { key: "content", label: "Content", icon: IconContent },
  { key: "relationships", label: "Relationships", icon: IconRelationships },
  { key: "rights-admin", label: "Rights & Admin", icon: IconRights },
  { key: "finance", label: "Finance", icon: IconFinance },
  { key: "grants", label: "Grants", icon: IconGrants },
];

export function Sidebar({
  bandId,
  bands,
  userName,
  userRole,
  onNavigate,
}: {
  bandId: string;
  bands: BandResponse[];
  userName: string;
  userRole: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const focusHref = `/bands/${bandId}/focus`;
  const focusActive =
    pathname === focusHref || pathname.startsWith(`${focusHref}/`);
  const dnaHref = `/bands/${bandId}/dna`;
  const dnaActive = pathname === dnaHref || pathname.startsWith(`${dnaHref}/`);

  return (
    <aside className="flex h-dvh w-[264px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-3 pb-4 pt-6">
        <BrandMark withWaveform={false} className="mb-5" />
        <BandSwitcher bands={bands} currentBandId={bandId} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <NavItem
          href={focusHref}
          icon={<IconFocus />}
          active={focusActive}
          onClick={onNavigate}
        >
          Focus
        </NavItem>
        <NavItem
          href={dnaHref}
          icon={<IconSpark />}
          active={dnaActive}
          onClick={onNavigate}
        >
          Artist DNA
        </NavItem>

        <div className="mb-1 mt-5 flex items-center gap-2 px-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Modules
          </p>
          <Badge tone="neutral">Soon</Badge>
        </div>
        <div className="flex flex-col gap-0.5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <NavItem key={mod.key} icon={<Icon />} disabled>
                {mod.label}
              </NavItem>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu name={userName} role={userRole} />
      </div>
    </aside>
  );
}
