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
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.Base64

/**
 * Gemini's TTS models (via the Interactions API, generativelanguage.
 * googleapis.com) — not Google Cloud's separate Text-to-Speech product
 * (texttospeech.googleapis.com), which this started out calling before
 * discovering the account's API key was a Gemini/AI-Studio key (the
 * "AQ." prefix format) that Cloud TTS flatly rejects as an unsupported
 * credential type. Gemini TTS auto-detects the spoken language from the
 * input text itself — see speak(): no per-language voice catalog to
 * query, unlike Cloud TTS's voices:list.
 */
@Component
@ConditionalOnProperty(prefix = "bandly.tts", name = ["enabled"], havingValue = "true")
class GeminiTextToSpeechAdapter(
    private val properties: TtsProperties,
) : TextToSpeechPort {

    private val logger = LoggerFactory.getLogger(GeminiTextToSpeechAdapter::class.java)
    // Built directly rather than injecting RestClient.Builder — this app's
    // Spring Boot setup doesn't autoconfigure that bean (spring-boot-starter-
    // webmvc alone doesn't pull in RestClientAutoConfiguration the way the
    // classic spring-boot-starter-web does), and this adapter doesn't need
    // any of the shared builder customization that DI would exist for.
    private val restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com/v1beta").build()

    override fun synthesize(text: String, languageCode: String): TtsAudio {
        val response = runCatching {
            restClient.post()
                .uri("/interactions")
                .header("x-goog-api-key", properties.googleApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    mapOf(
                        "model" to "gemini-2.5-flash-preview-tts",
                        "input" to text,
                        "response_format" to mapOf("type" to "audio"),
                        "generation_config" to mapOf(
                            "speech_config" to listOf(mapOf("voice" to properties.voice)),
                        ),
                    ),
                )
                .retrieve()
                .body(Map::class.java)
        }.getOrElse { throw wrapGeminiError(it) }
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Gemini TTS returned no response")

        val audioPart = extractAudioPart(response)
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Gemini TTS response had no audio content")

        val base64 = audioPart["data"] as? String
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Gemini TTS audio part had no data")
        val sampleRate = (audioPart["sample_rate"] as? Number)?.toInt() ?: 24000

        // Gemini TTS returns raw 16-bit signed little-endian PCM (mime_type
        // "audio/L16;codec=pcm;rate=..."), not a playable container — the
        // browser's <audio> element needs an actual file format, so this
        // wraps it in a standard WAV header rather than shipping raw PCM.
        val pcm = Base64.getDecoder().decode(base64)
        return TtsAudio(wrapPcmAsWav(pcm, sampleRate), "audio/wav")
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractAudioPart(response: Map<*, *>): Map<String, Any>? {
        val steps = response["steps"] as? List<Map<String, Any>> ?: return null
        val modelOutput = steps.firstOrNull { it["type"] == "model_output" } ?: return null
        val content = modelOutput["content"] as? List<Map<String, Any>> ?: return null
        return content.firstOrNull { it["type"] == "audio" }
    }

    private fun wrapPcmAsWav(pcm: ByteArray, sampleRate: Int, channels: Int = 1, bitsPerSample: Int = 16): ByteArray {
        val byteRate = sampleRate * channels * bitsPerSample / 8
        val blockAlign = channels * bitsPerSample / 8
        val header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN)
        header.put("RIFF".toByteArray(Charsets.US_ASCII))
        header.putInt(36 + pcm.size)
        header.put("WAVE".toByteArray(Charsets.US_ASCII))
        header.put("fmt ".toByteArray(Charsets.US_ASCII))
        header.putInt(16)
        header.putShort(1) // PCM
        header.putShort(channels.toShort())
        header.putInt(sampleRate)
        header.putInt(byteRate)
        header.putShort(blockAlign.toShort())
        header.putShort(bitsPerSample.toShort())
        header.put("data".toByteArray(Charsets.US_ASCII))
        header.putInt(pcm.size)
        return header.array() + pcm
    }

    /** Surfaces Gemini's own error message (it's specific and actionable —
     * "API key blocked for this service", "API not enabled", etc.) instead
     * of letting an unhandled RestClientResponseException fall through to
     * a generic response that hides what actually went wrong. */
    private fun wrapGeminiError(ex: Throwable): ApiException {
        if (ex !is RestClientResponseException) {
            logger.error("Gemini TTS call failed", ex)
            return ApiException(HttpStatus.BAD_GATEWAY, "Couldn't reach Gemini TTS")
        }
        logger.warn("Gemini TTS rejected the request ({}): {}", ex.statusCode, ex.responseBodyAsString)
        return ApiException(
            HttpStatus.BAD_GATEWAY,
            "Gemini TTS rejected the request (${ex.statusCode.value()}): ${ex.responseBodyAsString}",
        )
    }
}
