import type { ReactNode } from "react";
import { ConnectedBandShell } from "./_components/connected-band-shell";

export default async function BandLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ bandId: string }>;
}) {
  const { bandId } = await params;

  return <ConnectedBandShell bandId={bandId}>{children}</ConnectedBandShell>;
}
