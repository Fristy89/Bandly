package com.bandly.backend.artistdna.application

import com.bandly.backend.artistdna.domain.ArtistDnaVersion
import com.bandly.backend.artistdna.domain.AssetType
import com.bandly.backend.artistdna.domain.GeneratedAsset
import com.bandly.backend.artistdna.domain.IdentityProfile
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

        val version = dnaVersions.save(ArtistDnaVersion(bandId = bandId, identityProfileId = profile.id))
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

            Produce all five fields: a short bio (2-3 sentences), a long bio (2-3
            paragraphs), a one-line elevator pitch, an "about the artist" press-kit
            paragraph, and a tone-of-voice note (words/themes that fit this artist,
            and clichés or phrasing to avoid).
        """.trimIndent(),
    )

    private fun formatAnswers(answers: Map<String, String>) =
        answers.entries.joinToString("\n") { (question, answer) -> "- $question: $answer" }

    /** Used when bandly.ai.enabled=false, or if a real call fails — always
     * clearly labeled so nobody mistakes it for the model's actual voice. */
    private fun stubOutput(profile: IdentityProfile) = ArtistDnaOutput(
        shortBio = "[stub short bio for ${profile.bandId}]",
        longBio = "[stub long bio — enable bandly.ai.enabled to generate this for real]",
        elevatorPitch = "[stub elevator pitch]",
        aboutTheArtist = "[stub about-the-artist paragraph]",
        toneOfVoice = "[stub tone-of-voice notes]",
    )

    companion object {
        private val DNA_SYSTEM_PROMPT = """
            You are compiling an independent musician's brand identity for Bandly, an
            artist operating system. Write in a natural, specific voice grounded only
            in what the artist actually told you — never invent facts, genres, or
            achievements they didn't mention. Avoid music-press clichés such as
            "rising star" or "genre-defying".
        """.trimIndent()
    }
}
