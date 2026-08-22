package com.bandly.backend.platform.speech

import com.bandly.backend.platform.config.TtsProperties
import com.bandly.backend.platform.error.ApiException
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientResponseException
import java.util.Base64

/**
 * Gemini's Interactions API again (see GeminiTextToSpeechAdapter for the
 * TTS side of this same endpoint) — this time sending audio in as an
 * "input" part instead of asking for one out, for reference-track analysis
 * before the Identity Chat starts (see IdentityChatController.analyzeTrack
 * and ArtistDnaService's use of the resulting description).
 */
@Component
@ConditionalOnProperty(prefix = "bandly.tts", name = ["enabled"], havingValue = "true")
class GeminiAudioAnalysisAdapter(
    private val properties: TtsProperties,
) : AudioUnderstandingPort {

    private val logger = LoggerFactory.getLogger(GeminiAudioAnalysisAdapter::class.java)
    private val restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com/v1beta").build()

    override fun describeSound(audioBytes: ByteArray, mimeType: String): String {
        val base64 = Base64.getEncoder().encodeToString(audioBytes)
        val response = runCatching {
            restClient.post()
                .uri("/interactions")
                .header("x-goog-api-key", properties.googleApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    mapOf(
                        "model" to "gemini-3.6-flash",
                        "input" to listOf(
                            mapOf("type" to "text", "text" to ANALYSIS_PROMPT),
                            mapOf("type" to "audio", "data" to base64, "mime_type" to mimeType),
                        ),
                    ),
                )
                .retrieve()
                .body(Map::class.java)
        }.getOrElse { throw wrapGeminiError(it) }
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Gemini returned no response")

        return extractText(response)
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Gemini's response had no text content")
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractText(response: Map<*, *>): String? {
        val steps = response["steps"] as? List<Map<String, Any>> ?: return null
        // Steps also include a "thought" entry (the model's own reasoning,
        // not meant to be surfaced) ahead of the actual "model_output" —
        // skip straight to the real answer.
        val modelOutput = steps.firstOrNull { it["type"] == "model_output" } ?: return null
        val content = modelOutput["content"] as? List<Map<String, Any>> ?: return null
        val textPart = content.firstOrNull { it["type"] == "text" } ?: return null
        return textPart["text"] as? String
    }

    private fun wrapGeminiError(ex: Throwable): ApiException {
        if (ex !is RestClientResponseException) {
            logger.error("Gemini audio analysis call failed", ex)
            return ApiException(HttpStatus.BAD_GATEWAY, "Couldn't reach Gemini")
        }
        logger.warn("Gemini rejected the audio analysis request ({}): {}", ex.statusCode, ex.responseBodyAsString)
        return ApiException(
            HttpStatus.BAD_GATEWAY,
            "Gemini rejected the request (${ex.statusCode.value()}): ${ex.responseBodyAsString}",
        )
    }

    companion object {
        private val ANALYSIS_PROMPT = """
            Listen to this track and describe its sound in one focused paragraph
            for a musician building their artist brand: genre and subgenre,
            instrumentation, production style (raw/polished, analog/electronic),
            tempo and energy, and the overall mood or feeling it creates. Be
            specific and concrete — this is reference material an AI will use
            later to understand this artist's sound, not a general music review.
        """.trimIndent()
    }
}
