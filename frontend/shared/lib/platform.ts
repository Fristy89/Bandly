/**
 * Bandly's own workspace — a real, seeded band (see V7__platform_dna.sql /
 * PlatformBand on the backend) that the platform runs its own Artist DNA
 * intake into. Fixed id, so the admin DNA screen can point the normal
 * band-scoped flow at it without a lookup.
 */
export const PLATFORM_BAND_ID = "00000000-0000-0000-0000-00000000ba11";

/** The auth CTA / login nebula listens for this to recolor itself to the
 * platform's DNA palette once it's been generated. `null` payload resets
 * to the built-in violet/teal. */
export const DNA_PALETTE_EVENT = "bandly:dna-palette";

export type DnaPalette = { primary: string; secondary: string } | null;

export function signalDnaPalette(palette: DnaPalette) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DNA_PALETTE_EVENT, { detail: palette }));
}
