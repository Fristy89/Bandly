package com.bandly.backend.sites.application

import com.bandly.backend.artistdna.application.ArtistDnaColors
import com.bandly.backend.artistdna.application.ArtistDnaService
import com.bandly.backend.platform.ai.ChatRole
import com.bandly.backend.platform.ai.ChatTurn
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

    /**
     * Generates GENERATE_COUNT candidates in one call rather than one —
     * applies the first immediately (unchanged behavior), but returns the
     * rest too so the reveal screen can offer "try another" as an instant,
     * no-AI-call swap (see applyLogoMark) instead of a second full
     * generation. That's the actual fix for "regenerating takes too long
     * when the artist isn't happy": the wait only ever happens once.
     *
     * Also uses HAIKU_MODEL instead of the app's default frontier model —
     * picking a font from a curated list of 12 is a simple classification
     * task with no reasoning depth this identity's writing doesn't need,
     * so there's no quality tradeoff being made for the latency win here.
     */
    fun generateLogo(bandId: UUID): GeneratedLogoOptions {
        val dnaColors = artistDnaService.currentColors(bandId)

        val choices = generationJobs.runStructured(
            bandId = bandId,
            module = "site-logo",
            request = buildPrompt(bandId, dnaColors),
            responseType = LogoMarkCandidates::class.java,
            fallback = { LogoMarkCandidates(listOf(DEFAULT_LOGO)) },
        )
        // DNA's palette wins over the model's independent color guess when
        // one exists — the whole point of this feature is that the logo's
        // color isn't decided twice, disconnected from the rest of the
        // brand. Font/italic stay the model's own call either way; a color
        // palette and a typeface aren't the same kind of decision.
        val candidates = choices.candidates.ifEmpty { listOf(DEFAULT_LOGO) }
            .map { c -> sanitize(c).let { m -> dnaColors?.let { m.copy(colorHex = it.primaryColor) } ?: m } }
            .distinct()
            .take(GENERATE_COUNT)

        siteService.updateLogoMark(bandId, candidates.first())
        val content = dnaColors
            ?.let { siteService.updateBrandPalette(bandId, it.primaryColor, it.secondaryColor) }
            ?: siteService.getContent(bandId)
        return GeneratedLogoOptions(content, candidates)
    }

    /** The instant half of "try another": no AI call at all, just persists
     * an already-generated candidate the reveal screen cached from
     * generateLogo's response. Re-sanitized rather than trusted — this is
     * client-submitted input, even if it originated from our own AI call a
     * moment earlier. */
    fun applyLogoMark(bandId: UUID, mark: LogoMark): SiteContentData =
        siteService.updateLogoMark(bandId, sanitize(mark))

    /**
     * Claude looking at an artist's own uploaded logo (SiteController.uploadLogo)
     * and describing its visual mood in words that are actually comparable to
     * how they describe their sound — reuses the same vision path the Identity
     * Chat already uses for an artist's photo (ChatTurn.imageBase64), just as
     * a one-shot call instead of a real back-and-forth. The result travels
     * into the chat as ChatRequest.visualReference (see IdentityChatService),
     * not stored here — it's conversational context, not site content.
     */
    fun describeUploadedLogo(bandId: UUID, imageBase64: String, mimeType: String): String {
        // Claude's vision input accepts raster formats, not SVG — this isn't
        // caught by the try/catch this method's only caller already wraps it
        // in by accident, it's a known, permanent limitation worth being
        // explicit about rather than spending a doomed API call discovering.
        if (mimeType == "image/svg+xml") return ""

        val turn = ChatTurn(
            role = ChatRole.USER,
            content = "Describe this logo's visual mood in one concrete sentence.",
            imageBase64 = imageBase64,
            imageMimeType = mimeType,
        )
        return generationJobs.runChat(bandId, "logo-visual-feel", LOGO_FEEL_SYSTEM_PROMPT, listOf(turn))
    }

    /**
     * The structured counterpart to IdentityChatService's in-conversation
     * mismatch check — that one is Bandly noticing out loud, mid-chat, in
     * whatever words fit the moment; this one runs once the DNA is actually
     * final and needs a clean yes/no plus a short reason a UI can act on
     * (the reveal screen's offer to generate a matching signature instead).
     * Fails open (matches=true) on any error or missing DNA — never block
     * or falsely alarm the artist over a check that couldn't run.
     */
    fun checkLogoMatch(bandId: UUID, visualReference: String): LogoMatchResult {
        val identity = try {
            artistDnaService.currentDna(bandId).joinToString("\n") { "${it.assetType}: ${it.content}" }
        } catch (ex: NotFoundException) {
            return LogoMatchResult(matches = true, note = "")
        }

        return generationJobs.runStructured(
            bandId = bandId,
            module = "logo-match-check",
            request = GenerationRequest(
                systemPrompt = """
                    You're checking whether an independent musician's own uploaded
                    logo actually fits the artist identity they've established.
                    You'll be given a description of the logo's visual mood and
                    their Artist DNA (bios, tone). Decide honestly whether the
                    logo's feel and the music's feel genuinely align — minor
                    differences in specifics don't count as a mismatch, only a
                    real tonal clash (e.g. a bright, playful logo for heavy,
                    brooding music). Return matches=true/false and a short,
                    one-sentence, non-judgmental note explaining your read
                    either way.
                """.trimIndent(),
                userPrompt = "Logo's visual mood: $visualReference\n\nArtist DNA:\n$identity",
            ),
            responseType = LogoMatchResult::class.java,
            fallback = { LogoMatchResult(matches = true, note = "") },
        )
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
                You are choosing signature wordmark styles for an independent
                musician's website: a font, a color, and whether it should be
                italic. Return $GENERATE_COUNT genuinely different options, best
                first — not near-duplicates (varying only the color slightly
                doesn't count as different). Each font must come from this
                list, copied character for character, nothing else:
                ${SignatureFonts.CURATED.joinToString(", ")}

                Match the artist's actual genre and mood, not just what looks
                nice in general — a metal band and a lounge singer should not
                land on the same font, and none of your $GENERATE_COUNT options
                should feel like a wrong fit even though they differ from each
                other.
                ${
            if (dnaColors != null) {
                "This artist already has a brand color, ${dnaColors.primaryColor} — it will be " +
                    "used regardless of what you choose here, so just pick the font/italic that " +
                    "suits it for each option. Still return a color field on each; it will be ignored."
            } else {
                "No brand color exists yet, so also choose one hex color per option that suits its " +
                    "font and the artist."
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
            // Picking a font from a curated list is simple classification —
            // no reasoning depth here that the app's default frontier model
            // would add quality for, only latency.
            model = HAIKU_MODEL,
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

        private const val GENERATE_COUNT = 3

        // Haiku 4.5 — see generateLogo's doc comment for why this task
        // specifically doesn't need the app's default frontier-tier model.
        private const val HAIKU_MODEL = "claude-haiku-4-5-20251001"

        private val LOGO_FEEL_SYSTEM_PROMPT = """
            You are looking at an independent musician's logo. Describe what it
            visually feels like in ONE concrete sentence — the kind of vocabulary
            that also describes music: warm or cold, raw or polished, playful or
            serious, vintage or modern, minimal or maximalist, aggressive or
            gentle. Be specific to this image, not generic design-review language.
            Return only that sentence, nothing else.
        """.trimIndent()
    }
}

data class LogoMatchResult(val matches: Boolean, val note: String)

/** The raw shape Claude returns — GenerateLogoOptions is what the rest of
 * the app actually works with (sanitized, deduplicated, DNA-color-applied). */
data class LogoMarkCandidates(val candidates: List<LogoMark>)

data class GeneratedLogoOptions(val content: SiteContentData, val candidates: List<LogoMark>)
