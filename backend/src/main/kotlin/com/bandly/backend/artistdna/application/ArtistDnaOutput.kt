package com.bandly.backend.artistdna.application

/**
 * The shape we ask the model to fill in. This class *is* the schema Spring
 * AI sends to Anthropic (via BeanOutputConverter, which turns it into
 * format instructions appended to the prompt, then parses the JSON that
 * comes back into exactly this) — nothing else describes the expected
 * output. Field order here is the order the prompt asks for them in
 * ArtistDnaService.buildDnaPrompt, kept in sync by convention, not by code.
 */
data class ArtistDnaOutput(
    val shortBio: String,
    val longBio: String,
    val elevatorPitch: String,
    val aboutTheArtist: String,
    val toneOfVoice: String,
    /** A palette reasoned from the same identity context as the bios —
     * not a separate, disconnected color guess. Consumed by LogoService
     * and, through it, the band's public site — see ArtistDnaService. */
    val primaryColor: String,
    val secondaryColor: String,
)
