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
  updatedAt: string;
};

export type DnaStatus = "DRAFT" | "APPROVED";

export type ArtistDnaVersionResponse = {
  id: string;
  status: DnaStatus;
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
