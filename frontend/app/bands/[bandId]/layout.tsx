import type { ReactNode } from "react";
import { bands, currentUser } from "@/shared/data/mock";
import { BandShell } from "./_components/band-shell";

export default async function BandLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ bandId: string }>;
}) {
  const { bandId } = await params;
  const band = bands.find((candidate) => candidate.id === bandId) ?? bands[0];

  return (
    <BandShell
      bandId={band.id}
      bandName={band.name}
      bands={bands}
      userName={currentUser.name}
      userRole={currentUser.role}
    >
      {children}
    </BandShell>
  );
}
