package com.bandly.backend.artistdna.api

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty

data class ChatTurnRequest(
    @field:NotBlank val role: String, // "user" or "assistant"
    @field:NotBlank val content: String,
)

data class ChatRequest(
    @field:NotEmpty val history: List<ChatTurnRequest>,
)

data class ChatReplyResponse(val reply: String)
