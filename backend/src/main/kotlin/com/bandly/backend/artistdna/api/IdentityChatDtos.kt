package com.bandly.backend.artistdna.api

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty

data class ChatTurnRequest(
    @field:NotBlank val role: String, // "user" or "assistant"
    // Not @NotBlank — a turn can be an image with no caption at all.
    val content: String,
    val imageBase64: String? = null,
    val imageMimeType: String? = null,
)

data class ChatRequest(
    @field:NotEmpty val history: List<ChatTurnRequest>,
    /** ISO 639-1 — "nl" | "de" | "en". Unrecognized values fall back to
     * English in the service layer rather than rejecting the request. */
    val language: String = "en",
    /** Gemini's own descriptions of reference tracks the artist uploaded
     * before this conversation started (see analyzeTrack below) — plain
     * text, already generated, just carried along on every turn the same
     * stateless way history/language are. */
    val soundReferences: List<String> = emptyList(),
)

data class ChatReplyResponse(val reply: String)

data class AnalyzeTrackRequest(
    @field:NotBlank val audioBase64: String,
    @field:NotBlank val mimeType: String,
)

data class AnalyzeTrackResponse(val description: String)
