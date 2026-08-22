package com.bandly.backend.platform.speech

/**
 * Real audio understanding — Gemini actually listens to a reference track
 * and describes what it hears, not a metadata/tag guess. Claude (the model
 * behind the Identity Chat itself, see platform.ai) has no audio input
 * modality at all, which is exactly why this is a second, Gemini-specific
 * capability living alongside GeminiTextToSpeechAdapter rather than an
 * extension of AiGenerationPort.
 */
interface AudioUnderstandingPort {
    fun describeSound(audioBytes: ByteArray, mimeType: String): String
}
