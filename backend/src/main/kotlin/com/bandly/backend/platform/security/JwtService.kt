package com.bandly.backend.platform.security

import com.bandly.backend.platform.config.JwtProperties
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.crypto.SecretKey

/**
 * Issues and validates the short-lived JWT access token (ADR-04).
 * The refresh token is a separate, opaque, DB-backed credential — see RefreshTokenService.
 */
@Service
class JwtService(private val properties: JwtProperties) {

    private val key: SecretKey = Keys.hmacShaKeyFor(properties.secret.toByteArray(Charsets.UTF_8))

    fun issueAccessToken(userId: UUID, email: String): String {
        val now = Instant.now()
        val expiry = now.plus(properties.accessTokenTtlMinutes, ChronoUnit.MINUTES)
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .issuedAt(java.util.Date.from(now))
            .expiration(java.util.Date.from(expiry))
            .signWith(key)
            .compact()
    }

    fun parse(token: String): Claims? =
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload
        } catch (_: JwtException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        }

    fun accessTokenTtlSeconds(): Long = properties.accessTokenTtlMinutes * 60
}
