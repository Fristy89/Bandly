package com.bandly.backend.platform.speech

/**
 * Server-side voice synthesis — a real neural TTS engine, not the browser's
 * own speechSynthesis, which is capped by whatever voice the visitor's OS
 * happens to have installed and is the actual source of the "robotic"
 * feedback this feature responds to. Hexagonal on purpose, mirroring
 * platform.ai.AiGenerationPort: a disabled/unconfigured deployment still
 * runs end-to-end, it just falls back to the browser's own voice (see
 * StubTextToSpeechAdapter and shared/lib/speech.ts on the frontend).
 */
interface TextToSpeechPort {
    fun synthesize(text: String, languageCode: String): TtsAudio
}

data class TtsAudio(val bytes: ByteArray, val mimeType: String)
