package com.bandly.backend.sites.domain

/**
 * The CMS content shape — generalized from Neet Euverslaon's SiteContent
 * (Neet-Euversloan/src/lib/contentTypes.ts) for any Bandly artist rather
 * than one hardcoded brand. Deliberately dropped for this first pass, to
 * be added later rather than guessed at now: translations (multi-language),
 * galleries (photo/video), and the shop/Shopify integration — none of
 * those exist in the renderer yet either.
 *
 * This is the value stored in site_contents.content (JSONB) — see
 * SiteContent.kt (the JPA entity that owns it) and blueprint §07 on JSONB
 * being for content genuinely read/written as a whole, never queried by
 * field, which is exactly this.
 */
data class SiteContentData(
    val artist: ArtistInfo = ArtistInfo(),
    val tracks: List<Track> = emptyList(),
    val shows: List<Show> = emptyList(),
    val images: SiteImages = SiteImages(),
    val texts: SiteTexts = SiteTexts(),
    val seo: SiteSeo = SiteSeo(),
    /** AI-generated wordmark styling — see LogoService. Null until the band
     * generates one; the renderer falls back to plain text until then.
     * Superseded by logoImage below when the artist has their own real
     * logo design — a font/color choice isn't relevant once an actual
     * image exists, but this stays populated (rather than getting cleared)
     * so switching back is just dropping logoImage, not regenerating. */
    val logoMark: LogoMark? = null,
    /** An artist's own existing logo design, uploaded as-is rather than
     * generated — see SiteController.uploadLogo. Takes precedence over
     * logoMark wherever both exist (SignatureMark on the renderer, and its
     * frontend counterpart, both check this first); an AI-styled wordmark
     * is a stand-in for artists who don't have a real logo yet, not
     * something that should override one that does. */
    val logoImage: LogoImage? = null,
    /** Copied from the band's current Artist DNA version the moment a logo
     * is generated (see LogoService) — not decided independently here.
     * Lets the renderer theme more than just the wordmark (accent color,
     * buttons) from the same brand colors. Null until DNA has been
     * generated at least once. */
    val brandPalette: BrandPalette? = null,
)

data class BrandPalette(
    val primaryColor: String,
    val secondaryColor: String,
)

/**
 * A "signature" logo isn't a raster image here — it's a font + color + a
 * style flag, rendered as real, crisp, scalable text on the site (the same
 * technique Bandly's own wordmark uses — see frontend/shared/ui/brand-mark.tsx
 * and the Kaushan Script choice made for it). No image-generation model is
 * involved; Anthropic doesn't offer one, and this sidesteps needing a second
 * provider/API key for what's fundamentally a styling decision an LLM can
 * reason about well from an artist's genre and identity.
 */
data class LogoMark(
    val fontFamily: String,
    val colorHex: String,
    val italic: Boolean = true,
)

/**
 * An artist's real logo file, stored inline as base64 in this same JSONB
 * blob — the simple, no-new-infrastructure choice for now (no object
 * storage exists anywhere in this app yet). Deliberately not the long-term
 * answer: a real logo file bloats every read/write of the surrounding
 * SiteContentData row, not just logo-related ones. Worth moving to actual
 * object storage (S3-compatible) before this needs to handle real
 * production traffic — revisit then, not guessed at now.
 */
data class LogoImage(
    val base64: String,
    val mimeType: String,
)

/** The only fonts LogoService will ever pick from — curated so the AI's
 * choice is always something the renderer actually has pre-loaded (see
 * site-renderer/src/app/layout.tsx), spanning enough moods that a metal
 * band and a lounge singer don't land on the same font by default. */
object SignatureFonts {
    val CURATED = listOf(
        "Kaushan Script",
        "Caveat",
        "Permanent Marker",
        "Pacifico",
        "Yellowtail",
        "Dancing Script",
        "Sacramento",
        "Playfair Display",
        "Cinzel",
        "Bebas Neue",
        "Anton",
        "Fraunces",
    )
}

data class ArtistInfo(
    val name: String = "",
    val tagline: String = "",
    val instagramUrl: String = "",
)

data class Track(
    val id: String,
    val title: String,
    val src: String,
    val artwork: String = "",
)

data class Show(
    val id: String,
    val city: String,
    val date: String,
    val venue: String,
    val description: String = "",
)

data class SiteImages(
    val logo: String = "",
    val heroBackground: String = "",
    /** A real photo of the artist/band — set via SiteController.uploadPhoto
     * as a self-contained data: URI (base64 inline, same simple-for-now
     * storage choice as LogoImage — see that type's doc comment), not a
     * separate base64/mimeType pair, since this field predates that
     * pattern and a data URI drops straight into an <img src> either way. */
    val bioPhoto: String = "",
)

data class SiteTexts(
    val welcome: String = "",
    val bio: String = "",
)

data class SiteSeo(
    val title: String = "",
    val description: String = "",
    val keywords: String = "",
)
