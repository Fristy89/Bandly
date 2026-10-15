package com.bandly.backend.identity.application

import com.bandly.backend.identity.domain.BandMember
import com.bandly.backend.identity.domain.BandRole
import com.bandly.backend.identity.domain.PlatformBand
import com.bandly.backend.identity.domain.User
import com.bandly.backend.identity.infrastructure.BandMemberRepository
import com.bandly.backend.identity.infrastructure.UserRepository
import com.bandly.backend.platform.error.ConflictException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.JwtService
import com.bandly.backend.platform.security.RefreshTokenService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

data class IssuedSession(
    val userId: UUID,
    val email: String,
    val accessToken: String,
    val accessTokenTtlSeconds: Long,
    val refreshToken: String,
    val refreshTokenTtlSeconds: Long,
)

@Service
class AuthService(
    private val users: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val refreshTokenService: RefreshTokenService,
    private val bandMembers: BandMemberRepository,
    private val adminAccess: AdminAccess,
) {

    @Transactional
    fun register(email: String, rawPassword: String): IssuedSession {
        val normalizedEmail = email.trim().lowercase()
        if (users.existsByEmailIgnoreCase(normalizedEmail)) {
            throw ConflictException("An account with this email already exists")
        }
        val user = users.save(
            User(email = normalizedEmail, passwordHash = passwordEncoder.encode(rawPassword)!!),
        )
        return issueSession(user)
    }

    @Transactional
    fun login(email: String, rawPassword: String): IssuedSession {
        val user = users.findByEmailIgnoreCase(email.trim().lowercase())
            ?: throw UnauthorizedException("Invalid email or password")
        val passwordHash = user.passwordHash
            ?: throw UnauthorizedException("Invalid email or password")
        if (!passwordEncoder.matches(rawPassword, passwordHash)) {
            throw UnauthorizedException("Invalid email or password")
        }
        return issueSession(user)
    }

    @Transactional
    fun refresh(rawRefreshToken: String): IssuedSession {
        val rotation = refreshTokenService.rotate(rawRefreshToken)
            ?: throw UnauthorizedException("Refresh token is invalid or expired")
        val user = users.findById(rotation.userId).orElseThrow {
            UnauthorizedException("Refresh token is invalid or expired")
        }
        return IssuedSession(
            userId = user.id,
            email = user.email,
            accessToken = jwtService.issueAccessToken(user.id, user.email),
            accessTokenTtlSeconds = jwtService.accessTokenTtlSeconds(),
            refreshToken = rotation.newRawToken,
            refreshTokenTtlSeconds = refreshTokenService.refreshCookieTtlSeconds(),
        )
    }


    fun logout(rawRefreshToken: String) {
        refreshTokenService.revoke(rawRefreshToken)
    }

    /**
     * Called from OAuth2LoginSuccessHandler after Google confirms the
     * artist's identity — matches purely on email, same account either way:
     * an existing "local" (password) account signing in with Google for the
     * first time logs into that same account rather than creating a
     * duplicate, and a genuinely new email creates a fresh Google-only
     * account (no password, authProvider = "google"). authProvider on an
     * existing user is deliberately left as-is — it records how the account
     * *originated*, not which method was used most recently.
     */
    @Transactional
    fun findOrCreateGoogleUser(email: String): IssuedSession {
        val normalizedEmail = email.trim().lowercase()
        val user = users.findByEmailIgnoreCase(normalizedEmail)
            ?: users.save(User(email = normalizedEmail, authProvider = "google"))
        return issueSession(user)
    }

    private fun issueSession(user: User): IssuedSession {
        ensurePlatformAdminAccess(user)
        return IssuedSession(
            userId = user.id,
            email = user.email,
            accessToken = jwtService.issueAccessToken(user.id, user.email),
            accessTokenTtlSeconds = jwtService.accessTokenTtlSeconds(),
            refreshToken = refreshTokenService.issue(user.id),
            refreshTokenTtlSeconds = refreshTokenService.refreshCookieTtlSeconds(),
        )
    }

    /**
     * Idempotently gives a config-listed admin OWNER membership on the
     * PlatformBand the first time they sign in, so /admin/dna and every
     * band-scoped DNA endpoint work for them without any special-casing in
     * BandService. A no-op for everyone else.
     */
    private fun ensurePlatformAdminAccess(user: User) {
        if (!adminAccess.isAdmin(user.email)) return
        if (bandMembers.findByBandIdAndUserId(PlatformBand.ID, user.id) != null) return
        bandMembers.save(
            BandMember(
                bandId = PlatformBand.ID,
                userId = user.id,
                role = BandRole.OWNER,
                joinedAt = Instant.now(),
            ),
        )
    }
}
