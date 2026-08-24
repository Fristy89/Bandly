package com.bandly.backend.platform.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "bandly.jwt")
data class JwtProperties(
    val secret: String,
    val accessTokenTtlMinutes: Long = 15,
    val refreshTokenTtlDays: Long = 30,
)

@ConfigurationProperties(prefix = "bandly.cors")
data class CorsProperties(
    val allowedOrigins: List<String> = listOf("http://localhost:3000"),
)

@ConfigurationProperties(prefix = "bandly.ai")
data class AiProperties(
    val enabled: Boolean = false,
)

@ConfigurationProperties(prefix = "bandly.tts")
data class TtsProperties(
    val enabled: Boolean = false,
    val googleApiKey: String = "",
    // Gemini TTS voices aren't gendered in the API itself — these are
    // Google's own style descriptors, not verified gender labels. Kore is
    // Google's own flagship example voice across their docs/samples.
    val voice: String = "Kore",
)

@ConfigurationProperties(prefix = "bandly.oauth.google")
data class GoogleOAuthProperties(
    val enabled: Boolean = false,
    val clientId: String = "",
    val clientSecret: String = "",
)
