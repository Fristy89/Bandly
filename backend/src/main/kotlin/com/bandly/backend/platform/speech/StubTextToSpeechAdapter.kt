package com.bandly.backend.platform.speech

import com.bandly.backend.platform.error.ApiException
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component

/**
 * The default until bandly.tts.enabled=true — no Google Cloud key, no
 * network call, no surprise bill. The frontend treats a failed call to
 * /api/v1/speech/synthesize as a signal to fall back to the browser's own
 * voice (see shared/lib/speech.ts), so this deliberately fails loudly
 * rather than returning silence that would look like a bug.
 */
@Component
@ConditionalOnProperty(prefix = "bandly.tts", name = ["enabled"], havingValue = "false", matchIfMissing = true)
class StubTextToSpeechAdapter : TextToSpeechPort {

    private val logger = LoggerFactory.getLogger(StubTextToSpeechAdapter::class.java)

    override fun synthesize(text: String, languageCode: String): TtsAudio {
        logger.info("bandly.tts.enabled=false — no server-side voice, caller should fall back to the browser's own")
        throw ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Server-side voice isn't configured")
    }
}
