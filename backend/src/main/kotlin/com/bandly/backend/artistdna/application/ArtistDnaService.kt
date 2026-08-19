package com.bandly.backend.artistdna.application

import com.bandly.backend.artistdna.domain.ArtistDnaVersion
import com.bandly.backend.artistdna.domain.AssetType
import com.bandly.backend.artistdna.domain.GeneratedAsset
import com.bandly.backend.artistdna.domain.IdentityProfile
import com.bandly.backend.artistdna.domain.IdentityQuestions
import com.bandly.backend.artistdna.infrastructure.ArtistDnaVersionRepository
import com.bandly.backend.artistdna.infrastructure.GeneratedAssetRepository
import com.bandly.backend.artistdna.infrastructure.IdentityProfileRepository
import com.bandly.backend.identity.infrastructure.BandRepository
import com.bandly.backend.platform.ai.GenerationJob
import com.bandly.backend.platform.ai.GenerationJobService
import com.bandly.backend.platform.ai.GenerationRequest
import com.bandly.backend.platform.error.ConflictException
import com.bandly.backend.platform.error.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

data class ArtistDnaColors(val primaryColor: String, val secondaryColor: String)

/**
 * The first real consumer of AiGenerationPort, and the module every other
 * domain module will end up depending on (blueprint §06 dependency graph) —
 * Release Manager, Content Studio, Relationships, and Grants all pull the
 * *current* DNA into their own prompts once they exist. This service is
 * deliberately the only thing in the codebase that knows the shape of a
 * "compile the artist's identity" prompt; nothing about Spring AI leaks in
 * here either — see GenerationJobService/AiGenerationPort for that layer.
 */
@Service
class ArtistDnaService(
    private val identityProfiles: IdentityProfileRepository,
    private val dnaVersions: ArtistDnaVersionRepository,
    private val generatedAssets: GeneratedAssetRepository,
    private val bands: BandRepository,
    private val generationJobs: GenerationJobService,
) {

    @Transactional
    fun saveIdentityProfile(bandId: UUID, answers: Map<String, String>): IdentityProfile {
        val profile = identityProfiles.findByBandId(bandId)
        return if (profile != null) {
            profile.answers = answers
            identityProfiles.save(profile)
        } else {
            identityProfiles.save(IdentityProfile(bandId = bandId, answers = answers))
        }
    }

    fun identityProfile(bandId: UUID): IdentityProfile =
        identityProfiles.findByBandId(bandId)
            ?: throw NotFoundException("No Artist Identity Profile yet for this band")

    /**
     * Compiles the current Identity Profile into a new DNA version and makes
     * it the band's current one. Synchronous (via GenerationJobService's
     * blocking path) because this is a deliberate, occasional action the
     * artist takes and waits for — not a hot path worth streaming.
     *
     * Not @Transactional, same reasoning as GenerationJobService.runStructured:
     * the model call in the middle of this method must not hold a DB
     * connection open. The small window where a DNA version could be saved
     * but the band's current-version pointer update fails is an accepted
     * tradeoff here, not an oversight — worth revisiting with a saga/outbox
     * step if this ever needs to be airtight.
     */
    fun generateDna(bandId: UUID): ArtistDnaVersion {
        val profile = identityProfiles.findByBandId(bandId)
            ?: throw ConflictException("Complete the Artist Identity Profile before generating Artist DNA")

        val output = generationJobs.runStructured(
            bandId = bandId,
            module = "artist-dna",
            request = buildDnaPrompt(profile),
            responseType = ArtistDnaOutput::class.java,
            fallback = { stubOutput(profile) },
        )

        val version = dnaVersions.save(
            ArtistDnaVersion(
                bandId = bandId,
                identityProfileId = profile.id,
                primaryColor = sanitizeColor(output.primaryColor, DEFAULT_PRIMARY_COLOR),
                secondaryColor = sanitizeColor(output.secondaryColor, DEFAULT_SECONDARY_COLOR),
            ),
        )
        persistAssets(bandId, version.id, output)

        val band = bands.findById(bandId).orElseThrow { NotFoundException("Band $bandId not found") }
        band.currentDnaVersionId = version.id
        bands.save(band)

        return version
    }

    fun currentDna(bandId: UUID): List<GeneratedAsset> {
        val band = bands.findById(bandId).orElseThrow { NotFoundException("Band $bandId not found") }
        val versionId = band.currentDnaVersionId
            ?: throw NotFoundException("No Artist DNA generated yet for this band")
        return generatedAssets.findAllByDnaVersionId(versionId)
    }

    /**
     * The one thing the Sites module (LogoService) reaches into this module
     * for — sites depends on artistdna, same direction as every other
     * domain module (blueprint §06), never the other way. Returns null
     * rather than throwing when there's no DNA yet: a band can generate a
     * logo before ever generating DNA, and that's a normal path, not an
     * error — see LogoService's fallback.
     */
    fun currentColors(bandId: UUID): ArtistDnaColors? {
        val band = bands.findById(bandId).orElseThrow { NotFoundException("Band $bandId not found") }
        val versionId = band.currentDnaVersionId ?: return null
        val version = dnaVersions.findById(versionId).orElse(null) ?: return null
        val primary = version.primaryColor ?: return null
        val secondary = version.secondaryColor ?: return null
        return ArtistDnaColors(primary, secondary)
    }

    /** Streams a fresh elevator pitch line — the SSE path from blueprint §12,
     * kept here rather than in a new module so there's a real, working
     * example of both AiGenerationPort call shapes in one place. */
    fun regeneratePitch(bandId: UUID): GenerationJob {
        val profile = identityProfile(bandId)
        return generationJobs.streamText(
            bandId = bandId,
            module = "artist-dna",
            request = GenerationRequest(
                systemPrompt = DNA_SYSTEM_PROMPT,
                userPrompt = """
                    Based on this artist's Identity Profile, write ONE new elevator pitch —
                    a single sentence, different in phrasing from an obvious first attempt.
                    Identity Profile:
                    ${formatAnswers(profile.answers)}
                """.trimIndent(),
            ),
        )
    }

    private fun persistAssets(bandId: UUID, versionId: UUID, output: ArtistDnaOutput) {
        listOf(
            AssetType.SHORT_BIO to output.shortBio,
            AssetType.LONG_BIO to output.longBio,
            AssetType.ELEVATOR_PITCH to output.elevatorPitch,
            AssetType.ABOUT_THE_ARTIST to output.aboutTheArtist,
            AssetType.TONE_OF_VOICE to output.toneOfVoice,
        ).forEach { (type, content) ->
            generatedAssets.save(
                GeneratedAsset(
                    bandId = bandId,
                    dnaVersionId = versionId,
                    sourceModule = "artist-dna",
                    assetType = type,
                    content = content,
                ),
            )
        }
    }

    private fun buildDnaPrompt(profile: IdentityProfile) = GenerationRequest(
        systemPrompt = DNA_SYSTEM_PROMPT,
        userPrompt = """
            Here is the artist's Identity Profile:
            ${formatAnswers(profile.answers)}

            Produce all seven fields: a short bio (2-3 sentences), a long bio (2-3
            paragraphs), a one-line elevator pitch, an "about the artist" press-kit
            paragraph, a tone-of-voice note (words/themes that fit this artist, and
            clichés or phrasing to avoid), and a two-color palette (primaryColor,
            secondaryColor, both hex) reasoned from the same identity above —
            especially their sound, personality, and the feeling they want people
            to have. A metal band and a lounge singer should not land on the same
            palette; avoid defaulting to generic "AI-chosen" colors (the usual
            purple-blue gradients or safe pastel blues) when the identity actually
            points somewhere more specific.
        """.trimIndent(),
    )

    /** Resolves raw answer keys back to their full question text (see
     * IdentityQuestions) so the model reads "Why does your music need to
     * exist?: ..." instead of a bare key like "purpose: ..." — richer
     * context for the same reasoning the intake questions were designed to
     * prompt in the artist. Unrecognized keys pass through as-is, since
     * IdentityProfile.answers isn't restricted to this exact key set. */
    private fun formatAnswers(answers: Map<String, String>): String {
        val questionsByKey = IdentityQuestions.ALL.associateBy { it.key }
        return answers.entries.joinToString("\n") { (key, answer) ->
            val question = questionsByKey[key]?.prompt ?: key
            "- $question: $answer"
        }
    }

    /** Guards against a malformed or missing hex value reaching the
     * database/renderer — the same defensive pattern LogoService uses for
     * its own color field. */
    private fun sanitizeColor(color: String, fallback: String): String =
        if (Regex("^#[0-9a-fA-F]{6}$").matches(color)) color else fallback

    /** Used when bandly.ai.enabled=false, or if a real call fails — always
     * clearly labeled so nobody mistakes it for the model's actual voice. */
    private fun stubOutput(profile: IdentityProfile) = ArtistDnaOutput(
        shortBio = "[stub short bio for ${profile.bandId}]",
        longBio = "[stub long bio — enable bandly.ai.enabled to generate this for real]",
        elevatorPitch = "[stub elevator pitch]",
        aboutTheArtist = "[stub about-the-artist paragraph]",
        toneOfVoice = "[stub tone-of-voice notes]",
        primaryColor = DEFAULT_PRIMARY_COLOR,
        secondaryColor = DEFAULT_SECONDARY_COLOR,
    )

    companion object {
        private val DNA_SYSTEM_PROMPT = """
            You are compiling an independent musician's brand identity for Bandly, an
            artist operating system. Reason across the same dimensions the artist was
            asked about: their purpose, the gap they fill, their sound, what makes
            them different, their personality, their audience, and the feeling they
            want to create. Write in a natural, specific voice grounded only in what
            the artist actually told you — never invent facts, genres, or
            achievements they didn't mention. Avoid music-press clichés such as
            "rising star" or "genre-defying".
        """.trimIndent()

        private const val DEFAULT_PRIMARY_COLOR = "#1c4fa8"
        private const val DEFAULT_SECONDARY_COLOR = "#ac7423"
    }
}
