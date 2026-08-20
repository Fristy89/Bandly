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
)
