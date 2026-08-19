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
     * generates one; the renderer falls back to plain text until then. */
    val logoMark: LogoMark? = null,
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
