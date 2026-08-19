import {
  Anton,
  Bebas_Neue,
  Caveat,
  Cinzel,
  Dancing_Script,
  Fraunces,
  Kaushan_Script,
  Pacifico,
  Permanent_Marker,
  Playfair_Display,
  Sacramento,
  Yellowtail,
} from "next/font/google";

// One next/font/google import per SignatureFonts.CURATED entry on the
// backend (sites/domain/SiteContentData.kt) — the two lists must stay in
// sync by hand, since a name LogoService picks that isn't loaded here would
// silently fall back to the browser's default serif. Weight pinned to 400
// for all of them: it's a valid static instantiation whether the family is
// a single-weight font (Kaushan Script, Pacifico, …) or a variable one
// (Fraunces, Playfair Display, …), so one convention covers every case
// without checking each font's own supported styles individually.
const kaushanScript = Kaushan_Script({ variable: "--font-kaushan-script", subsets: ["latin"], weight: "400" });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: "400" });
const permanentMarker = Permanent_Marker({ variable: "--font-permanent-marker", subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ variable: "--font-pacifico", subsets: ["latin"], weight: "400" });
const yellowtail = Yellowtail({ variable: "--font-yellowtail", subsets: ["latin"], weight: "400" });
const dancingScript = Dancing_Script({ variable: "--font-dancing-script", subsets: ["latin"], weight: "400" });
const sacramento = Sacramento({ variable: "--font-sacramento", subsets: ["latin"], weight: "400" });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair-display", subsets: ["latin"], weight: "400" });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: "400" });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: "400" });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const fraunces = Fraunces({ variable: "--font-fraunces-mark", subsets: ["latin"], weight: "400" });

export const SIGNATURE_FONTS = [
  kaushanScript,
  caveat,
  permanentMarker,
  pacifico,
  yellowtail,
  dancingScript,
  sacramento,
  playfairDisplay,
  cinzel,
  bebasNeue,
  anton,
  fraunces,
];

/** className string with every signature font's CSS variable — apply once
 * on <html> (see app/layout.tsx) so any of them can be picked at the leaf. */
export const signatureFontVariables = SIGNATURE_FONTS.map((f) => f.variable).join(" ");

// The literal --font-* names passed to `variable` above — applying
// f.variable as a className (done once, on <html>) is what makes each of
// these resolvable via var(--font-...) anywhere in the tree; this map is
// just "which CSS variable does this font's display name correspond to."
const FONT_CSS_VARIABLE_BY_NAME: Record<string, string> = {
  "Kaushan Script": "--font-kaushan-script",
  Caveat: "--font-caveat",
  "Permanent Marker": "--font-permanent-marker",
  Pacifico: "--font-pacifico",
  Yellowtail: "--font-yellowtail",
  "Dancing Script": "--font-dancing-script",
  Sacramento: "--font-sacramento",
  "Playfair Display": "--font-playfair-display",
  Cinzel: "--font-cinzel",
  "Bebas Neue": "--font-bebas-neue",
  Anton: "--font-anton",
  Fraunces: "--font-fraunces-mark",
};

const DEFAULT_CSS_VARIABLE = "--font-kaushan-script";

/** Resolves a LogoMark.fontFamily (as chosen by LogoService) to the CSS
 * variable to render with, e.g. for style={{ fontFamily: fontVariableFor(...) }}.
 * Falls back to the same default the backend uses when a name doesn't
 * match — belt and suspenders, since the backend already sanitizes this,
 * but the renderer shouldn't trust that blindly. */
export function fontVariableFor(fontFamily: string): string {
  const cssVariable = FONT_CSS_VARIABLE_BY_NAME[fontFamily] ?? DEFAULT_CSS_VARIABLE;
  return `var(${cssVariable})`;
}
