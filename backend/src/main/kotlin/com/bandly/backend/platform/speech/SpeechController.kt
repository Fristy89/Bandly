package com.bandly.backend.platform.speech

import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import jakarta.validation.Valid
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/** Not band-scoped — synthesizing a sentence isn't band data, it just
 * needs a logged-in caller, same trust level as any other authenticated
 * endpoint. */
@RestController
@RequestMapping("/api/v1/speech")
class SpeechController(private val textToSpeech: TextToSpeechPort) {

    @PostMapping("/synthesize")
    fun synthesize(@Valid @RequestBody request: SynthesizeRequest): ResponseEntity<ByteArray> {
        requireAuthenticatedUser()
        val audio = textToSpeech.synthesize(request.text, request.languageCode)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, audio.mimeType)
            .body(audio.bytes)
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")
}
