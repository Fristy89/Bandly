package com.bandly.backend.artistdna.application

/** What a finished Identity Chat gets extracted into — one field per
 * IdentityQuestions.ALL entry, same keys, same order. See
 * IdentityChatService.summarize. */
data class IdentitySummary(
    val purpose: String,
    val problem: String,
    val sound: String,
    val differentiation: String,
    val personality: String,
    val audience: String,
    val feeling: String,
)
