package com.bandly.backend.platform.speech

import com.bandly.backend.platform.error.ApiException
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component

/** Same on/off switch as GeminiTextToSpeechAdapter — one Gemini API key
 * enables both features together, since there's only one credential to
 * configure, not two independent ones a deployer could mismatch. */
@Component
@ConditionalOnProperty(prefix = "bandly.tts", name = ["enabled"], havingValue = "false", matchIfMissing = true)
class StubAudioUnderstandingAdapter : AudioUnderstandingPort {

    private val logger = LoggerFactory.getLogger(StubAudioUnderstandingAdapter::class.java)

    override fun describeSound(audioBytes: ByteArray, mimeType: String): String {
        logger.info("bandly.tts.enabled=false — no Gemini key, can't analyze reference tracks")
        throw ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Reference-track analysis isn't configured")
    }
}
