package com.bandly.backend.artistdna.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.ai.ChatRole
import com.bandly.backend.platform.ai.ChatTurn
import com.bandly.backend.platform.error.ApiException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import com.bandly.backend.platform.speech.AudioUnderstandingPort
import com.bandly.backend.artistdna.application.ChatModeration
import com.bandly.backend.artistdna.application.IdentityChatService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.Base64
import java.util.UUID

@RestController
@RequestMapping("/api/v1/bands/{bandId}/dna/chat")
class IdentityChatController(
    private val identityChatService: IdentityChatService,
    private val bandService: BandService,
    private val audioUnderstanding: AudioUnderstandingPort,
) {

    @PostMapping
    fun reply(@PathVariable bandId: UUID, @Valid @RequestBody request: ChatRequest): ChatReplyResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        validateNotAbusive(request.history.lastOrNull())
        val reply = identityChatService.reply(
            bandId,
            toTurns(request.history),
            request.language,
            request.soundReferences,
            request.visualReference,
        )
        return ChatReplyResponse(reply)
    }

    /** Before the conversation starts, not a chat turn itself — the
     * artist uploads up to a few reference tracks and Gemini's read on
     * each becomes part of request.soundReferences on every /chat and
     * /chat/summarize call from then on (see ChatRequest). */
    @PostMapping("/analyze-track")
    fun analyzeTrack(@PathVariable bandId: UUID, @Valid @RequestBody request: AnalyzeTrackRequest): AnalyzeTrackResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        validateAudio(request.audioBase64, request.mimeType)
        val description = audioUnderstanding.describeSound(Base64.getDecoder().decode(request.audioBase64), request.mimeType)
        return AnalyzeTrackResponse(description)
    }

    private fun validateAudio(base64: String, mimeType: String?) {
        if (mimeType !in ALLOWED_AUDIO_TYPES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Unsupported audio type: $mimeType")
        }
        val decodedSize = try {
            Base64.getDecoder().decode(base64).size
        } catch (ex: IllegalArgumentException) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Audio data isn't valid base64")
        }
        if (decodedSize > MAX_AUDIO_BYTES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "That track is too large — please use one under 15 MB")
        }
    }

    /** Only the newest turn — everything earlier in the history already
     * passed this same check on a prior request, so there's no reason to
     * re-scan the whole transcript every time. */
    private fun validateNotAbusive(latestTurn: ChatTurnRequest?) {
        if (latestTurn != null && ChatModeration.containsProfanity(latestTurn.content)) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Let's keep this conversation respectful — try rephrasing that.")
        }
    }

    @PostMapping("/summarize")
    fun summarize(@PathVariable bandId: UUID, @Valid @RequestBody request: ChatRequest): IdentityProfileResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val profile = identityChatService.summarize(bandId, toTurns(request.history), request.language)
        return IdentityProfileResponse(profile.id, profile.answers, profile.language, profile.updatedAt)
    }

    private fun toTurns(history: List<ChatTurnRequest>): List<ChatTurn> =
        history.map { turn ->
            turn.imageBase64?.let { validateImage(it, turn.imageMimeType) }
            ChatTurn(
                role = if (turn.role.equals("assistant", ignoreCase = true)) ChatRole.ASSISTANT else ChatRole.USER,
                content = turn.content,
                imageBase64 = turn.imageBase64,
                imageMimeType = turn.imageMimeType,
            )
        }

    /** Rejected here, not silently dropped or passed through — a caller
     * sending a 20MB "photo" almost certainly has a bug worth surfacing,
     * not something to quietly downsize server-side. */
    private fun validateImage(base64: String, mimeType: String?) {
        if (mimeType !in ALLOWED_IMAGE_TYPES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Unsupported image type: $mimeType")
        }
        val decodedSize = try {
            Base64.getDecoder().decode(base64).size
        } catch (ex: IllegalArgumentException) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Image data isn't valid base64")
        }
        if (decodedSize > MAX_IMAGE_BYTES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Image is too large — please use one under 5 MB")
        }
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")

    companion object {
        private val ALLOWED_IMAGE_TYPES = setOf("image/jpeg", "image/png", "image/webp")
        private const val MAX_IMAGE_BYTES = 5 * 1024 * 1024
        private val ALLOWED_AUDIO_TYPES = setOf("audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a")
        private const val MAX_AUDIO_BYTES = 15 * 1024 * 1024
    }
}
