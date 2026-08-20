package com.bandly.backend.platform.speech

import com.bandly.backend.platform.config.TtsProperties
import com.bandly.backend.platform.error.ApiException
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
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
    restClientBuilder: RestClient.Builder,
    private val properties: TtsProperties,
) : TextToSpeechPort {

    private val logger = LoggerFactory.getLogger(GoogleTextToSpeechAdapter::class.java)
    private val restClient = restClientBuilder.baseUrl("https://texttospeech.googleapis.com/v1").build()

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
        val response = restClient.post()
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

        val response = restClient.get()
            .uri { it.path("/voices").queryParam("languageCode", languageCode).build() }
            .header("X-Goog-Api-Key", properties.googleApiKey)
            .retrieve()
            .body(Map::class.java)

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
}
