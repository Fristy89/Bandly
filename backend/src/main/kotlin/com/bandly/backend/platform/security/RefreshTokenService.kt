package com.bandly.backend.platform.security

import com.bandly.backend.identity.domain.RefreshToken
import com.bandly.backend.identity.infrastructure.RefreshTokenRepository
import com.bandly.backend.platform.config.JwtProperties
import org.springframework.stereotype.Service
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Base64
import java.util.UUID

/**
 * Opaque, DB-backed, rotated-on-use refresh token (ADR-04). We never store the
 * raw token — only its SHA-256 hash — so a leaked database dump does not hand
 * out valid sessions.
 */
@Service
class RefreshTokenService(
    private val repository: RefreshTokenRepository,
    private val properties: JwtProperties,
) {
    private val random = SecureRandom()

    fun issue(userId: UUID): String {
        val raw = randomToken()
        val token = RefreshToken(
            userId = userId,
            tokenHash = hash(raw),
            expiresAt = Instant.now().plus(properties.refreshTokenTtlDays, ChronoUnit.DAYS),
        )
        repository.save(token)
        return raw
    }

    /** Validates the presented raw token and, if active, rotates it — returns the new raw token. */
    fun rotate(rawToken: String): RotationResult? {
        val stored = repository.findByTokenHash(hash(rawToken)) ?: return null
        if (!stored.isActive()) return null

        stored.revokedAt = Instant.now()
        repository.save(stored)

        val newRaw = issue(stored.userId)
        return RotationResult(userId = stored.userId, newRawToken = newRaw)
    }

    fun revoke(rawToken: String) {
        val stored = repository.findByTokenHash(hash(rawToken)) ?: return
        stored.revokedAt = Instant.now()
        repository.save(stored)
    }

    fun refreshCookieTtlSeconds(): Long = properties.refreshTokenTtlDays * 24 * 60 * 60

    private fun randomToken(): String {
        val bytes = ByteArray(48)
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun hash(raw: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(raw.toByteArray(Charsets.UTF_8))
        return Base64.getEncoder().encodeToString(digest)
    }

    data class RotationResult(val userId: UUID, val newRawToken: String)
}
