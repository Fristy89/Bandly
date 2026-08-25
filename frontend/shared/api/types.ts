// Mirrors the backend's DTOs field-for-field (see the *Dtos.kt files in
// backend/src/main/kotlin/com/bandly/backend/**/api/). Kept hand-written
// rather than generated for now — see blueprint §08 on eventually
// generating this from the OpenAPI spec at /v3/api-docs.

export type AuthResponse = {
  userId: string;
  email: string;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
};

export type BandRole = "OWNER" | "ADMIN" | "MEMBER";

export type BandResponse = {
  id: string;
  name: string;
  planTier: string;
  myRole: BandRole;
  createdAt: string;
};

export type IdentityProfileResponse = {
  id: string;
  answers: Record<string, string>;
  language: string;
  updatedAt: string;
};

export type DnaStatus = "DRAFT" | "APPROVED";

export type ArtistDnaVersionResponse = {
  id: string;
  status: DnaStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  createdAt: string;
};

export type AssetType =
  | "SHORT_BIO"
  | "LONG_BIO"
  | "ELEVATOR_PITCH"
  | "ABOUT_THE_ARTIST"
  | "TONE_OF_VOICE";

export type AssetStatus = "DRAFT" | "EDITED" | "APPROVED";

export type GeneratedAssetResponse = {
  id: string;
  assetType: AssetType;
  content: string;
  status: AssetStatus;
};

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  imageMimeType?: string;
};

export type ChatReplyResponse = {
  reply: string;
};

export type LogoMark = {
  fontFamily: string;
  colorHex: string;
  italic: boolean;
};

export type LogoImage = {
  base64: string;
  mimeType: string;
};

// POST .../site/logo/generate now returns every candidate from that one AI
// call, not just the applied one — see LogoService.generateLogo on the
// backend for why (an instant "try another" via POST .../site/logo/apply,
// no second AI call, is the actual fix for "regenerating feels slow").
export type GeneratedLogoOptions = {
  content: SiteContentData;
  candidates: LogoMark[];
};

// Partial mirror of SiteContentData.kt — only the fields the DNA reveal
// screen reads (see dna-results.tsx). The full site content model (tracks,
// shows, images, seo, ...) belongs to the not-yet-built site-editing admin
// UI, not here.
export type SiteContentData = {
  artist: {
    name: string;
    tagline: string;
  };
  logoMark: LogoMark | null;
  logoImage: LogoImage | null;
  images: {
    bioPhoto: string;
  };
};
