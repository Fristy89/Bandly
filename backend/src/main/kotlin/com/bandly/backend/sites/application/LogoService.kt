package com.bandly.backend.sites.application

import com.bandly.backend.artistdna.application.ArtistDnaColors
import com.bandly.backend.artistdna.application.ArtistDnaService
import com.bandly.backend.platform.ai.GenerationJobService
import com.bandly.backend.platform.ai.GenerationRequest
import com.bandly.backend.platform.error.NotFoundException
import com.bandly.backend.sites.domain.LogoMark
import com.bandly.backend.sites.domain.SiteContentData
import com.bandly.backend.sites.domain.SignatureFonts
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Generates a band's signature wordmark: Claude picks a font + color from
 * the curated list (SignatureFonts), reasoned from their Artist DNA when
 * they have one, or just their name/tagline when they don't yet. One call
 * both generates and applies it — see SiteService.updateLogoMark — matching
 * how DNA regeneration elsewhere in the app works (an action with an
 * immediate, visible result, not a generate-then-separately-save flow).
 *
 * Depends on artistdna, same direction as every other domain module in the
 * dependency graph (blueprint §06) — sites doesn't get a special exception.
 */
@Service
class LogoService(
    private val siteService: SiteService,
    private val artistDnaService: ArtistDnaService,
    private val generationJobs: GenerationJobService,
) {

    fun generateLogo(bandId: UUID): SiteContentData {
        val dnaColors = artistDnaService.currentColors(bandId)

        val aiChoice = generationJobs.runStructured(
            bandId = bandId,
            module = "site-logo",
            request = buildPrompt(bandId, dnaColors),
            responseType = LogoMark::class.java,
            fallback = { DEFAULT_LOGO },
        )
        // DNA's palette wins over the model's independent color guess when
        // one exists — the whole point of this feature is that the logo's
        // color isn't decided twice, disconnected from the rest of the
        // brand. Font/italic stay the model's own call either way; a color
        // palette and a typeface aren't the same kind of decision.
        val mark = sanitize(aiChoice).let { m ->
            dnaColors?.let { m.copy(colorHex = it.primaryColor) } ?: m
        }

        siteService.updateLogoMark(bandId, mark)
        return dnaColors
            ?.let { siteService.updateBrandPalette(bandId, it.primaryColor, it.secondaryColor) }
            ?: siteService.getContent(bandId)
    }

    private fun buildPrompt(bandId: UUID, dnaColors: ArtistDnaColors?): GenerationRequest {
        val identity = try {
            artistDnaService.currentDna(bandId).joinToString("\n") { "${it.assetType}: ${it.content}" }
        } catch (ex: NotFoundException) {
            null
        }
        val artist = siteService.getContent(bandId).artist

        return GenerationRequest(
            systemPrompt = """
                You are choosing a signature wordmark style for an independent
                musician's website: a font, a color, and whether it should be
                italic. Pick exactly one font name from this list, copied
                character for character, nothing else:
                ${SignatureFonts.CURATED.joinToString(", ")}

                Match the artist's actual genre and mood, not just what looks
                nice in general — a metal band and a lounge singer should not
                land on the same font.
                ${
            if (dnaColors != null) {
                "This artist already has a brand color, ${dnaColors.primaryColor} — it will be " +
                    "used regardless of what you choose here, so just pick the font/italic that " +
                    "suits it. Still return a color field; it will be ignored."
            } else {
                "No brand color exists yet, so also choose one hex color that suits the font and " +
                    "the artist."
            }
        }
            """.trimIndent(),
            userPrompt = buildString {
                appendLine("Artist name: ${artist.name}")
                appendLine("Tagline: ${artist.tagline}")
                if (identity != null) {
                    appendLine()
                    appendLine("Brand identity:")
                    appendLine(identity)
                }
            },
        )
    }

    /** The model is instructed to copy a font name verbatim, but nothing
     * stops it from paraphrasing or getting the case wrong — this is what
     * keeps a mismatched name from ever reaching the renderer, which only
     * has these exact fonts loaded. */
    private fun sanitize(mark: LogoMark): LogoMark {
        val matchedFont = SignatureFonts.CURATED.firstOrNull { it.equals(mark.fontFamily, ignoreCase = true) }
            ?: DEFAULT_LOGO.fontFamily
        val validColor = if (Regex("^#[0-9a-fA-F]{6}$").matches(mark.colorHex)) mark.colorHex else DEFAULT_LOGO.colorHex
        return LogoMark(matchedFont, validColor, mark.italic)
    }

    companion object {
        val DEFAULT_LOGO = LogoMark(fontFamily = "Kaushan Script", colorHex = "#e0913f", italic = true)
    }
}
