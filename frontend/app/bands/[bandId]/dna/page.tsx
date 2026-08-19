import type { Metadata } from "next";
import { IdentityChat } from "./_components/identity-chat";

export const metadata: Metadata = {
  title: "Artist DNA",
};

export default async function ArtistDnaPage({
  params,
}: {
  params: Promise<{ bandId: string }>;
}) {
  const { bandId } = await params;
  return <IdentityChat bandId={bandId} />;
}
