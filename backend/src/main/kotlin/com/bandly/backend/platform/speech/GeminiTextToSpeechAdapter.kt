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
import java.util.concurrent.ConcurrentHashMap

/**
 * Google Cloud Text-to-Speech over its plain REST API (an API key in a
 * header, not a service-account/OAuth setup) — chosen over Azure/ElevenLabs
 * for this feature specifically for its free tier (1M chars/month at
 * Neural2/Chirp3-HD quality vs. Azure's 500K) at comparable per-character
 * pricing beyond that, while still landing on genuinely natural voices.
 */
@Component
@ConditionalOnProperty(prefix = "bandly.tts", name = ["enabled"], havingValue = "true")
class GoogleTextToSpeechAdapter(
    private val properties: TtsProperties,
) : TextToSpeechPort {

    private val logger = LoggerFactory.getLogger(GoogleTextToSpeechAdapter::class.java)
    // Built directly rather than injecting RestClient.Builder — this app's
    // Spring Boot setup doesn't autoconfigure that bean (spring-boot-starter-
    // webmvc alone doesn't pull in RestClientAutoConfiguration the way the
    // classic spring-boot-starter-web does), and this adapter doesn't need
    // any of the shared builder customization that DI would exist for.
    private val restClient = RestClient.builder().baseUrl("https://texttospeech.googleapis.com/v1").build()

    // Google's voice catalog for a given language doesn't change within a
    // running process — worth caching so every single chat reply isn't a
    // second API call just to re-discover the same voice name.
    private val voiceCache = ConcurrentHashMap<String, String>()

    // Highest-quality tier first: Chirp3-HD and Neural2 are a categorically
    // different, far less robotic model generation than the older
    // Wavenet/Standard tiers this account might otherwise default to. Not
    // every language ships every tier, so this is a preference order over
    // whatever Google actually returns, not a hard requirement.
    private val qualityRank = listOf("Chirp3-HD", "Neural2", "Wavenet", "Standard")

    override fun synthesize(text: String, languageCode: String): TtsAudio {
        val voiceName = resolveVoice(languageCode)
        val response = runCatching {
            restClient.post()
                .uri("/text:synthesize")
                .header("X-Goog-Api-Key", properties.googleApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    mapOf(
                        "input" to mapOf("text" to text),
                        "voice" to mapOf("languageCode" to languageCode, "name" to voiceName),
                        "audioConfig" to mapOf("audioEncoding" to "MP3"),
                    ),
                )
                .retrieve()
                .body(Map::class.java)
        }.getOrElse { throw wrapGoogleError(it) }
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Google Text-to-Speech returned no audio")

        val audioContent = response["audioContent"] as? String
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Google Text-to-Speech response had no audioContent")
        return TtsAudio(Base64.getDecoder().decode(audioContent), "audio/mpeg")
    }

    /** Resolves a language code to the best-quality FEMALE voice Google
     * actually offers for it right now, instead of hardcoding a voice name
     * that might not exist (or might get renamed) — see the quality-tier
     * comment above for how "best" is decided. */
    private fun resolveVoice(languageCode: String): String {
        voiceCache[languageCode]?.let { return it }

        val response = runCatching {
            restClient.get()
                .uri { it.path("/voices").queryParam("languageCode", languageCode).build() }
                .header("X-Goog-Api-Key", properties.googleApiKey)
                .retrieve()
                .body(Map::class.java)
        }.getOrElse { throw wrapGoogleError(it) }

        @Suppress("UNCHECKED_CAST")
        val voices = response?.get("voices") as? List<Map<String, Any>> ?: emptyList()
        val female = voices.filter { it["ssmlGender"] == "FEMALE" }
        val pool = female.ifEmpty { voices }

        val chosen = qualityRank
            .firstNotNullOfOrNull { tier -> pool.firstOrNull { (it["name"] as? String)?.contains(tier) == true } }
            ?: pool.firstOrNull()
            ?: throw ApiException(HttpStatus.BAD_GATEWAY, "Google Text-to-Speech has no voices for $languageCode")

        val name = chosen["name"] as String
        logger.info("Resolved {} to voice {}", languageCode, name)
        voiceCache[languageCode] = name
        return name
    }

    /** Surfaces Google's own error message (it's specific and actionable —
     * "API key not valid", "API not enabled for this project", etc.)
     * instead of letting an unhandled RestClientResponseException fall
     * through to a generic 500 that hides what actually went wrong. */
    private fun wrapGoogleError(ex: Throwable): ApiException {
        if (ex !is RestClientResponseException) {
            logger.error("Google Text-to-Speech call failed", ex)
            return ApiException(HttpStatus.BAD_GATEWAY, "Couldn't reach Google Text-to-Speech")
        }
        logger.warn("Google Text-to-Speech rejected the request ({}): {}", ex.statusCode, ex.responseBodyAsString)
        return ApiException(
            HttpStatus.BAD_GATEWAY,
            "Google Text-to-Speech rejected the request (${ex.statusCode.value()}): ${ex.responseBodyAsString}",
        )
    }
}
