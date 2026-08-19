// Mirrors backend/src/main/kotlin/com/bandly/backend/sites/domain/SiteContentData.kt
// field-for-field. See that file for what's deliberately not here yet
// (translations, galleries, shop).

export type ArtistInfo = {
  name: string;
  tagline: string;
  instagramUrl: string;
};

export type Track = {
  id: string;
  title: string;
  src: string;
  artwork: string;
};

export type Show = {
  id: string;
  city: string;
  date: string;
  venue: string;
  description: string;
};

export type SiteImages = {
  logo: string;
  heroBackground: string;
  bioPhoto: string;
};

export type SiteTexts = {
  welcome: string;
  bio: string;
};

export type SiteSeo = {
  title: string;
  description: string;
  keywords: string;
};

export type LogoMark = {
  fontFamily: string;
  colorHex: string;
  italic: boolean;
};

export type SiteContentData = {
  artist: ArtistInfo;
  tracks: Track[];
  shows: Show[];
  images: SiteImages;
  texts: SiteTexts;
  seo: SiteSeo;
  logoMark: LogoMark | null;
};

export type PublicSiteResponse = {
  subdomain: string;
  content: SiteContentData;
};
