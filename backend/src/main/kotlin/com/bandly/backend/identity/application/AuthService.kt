package com.bandly.backend.identity.application

import com.bandly.backend.identity.domain.User
import com.bandly.backend.identity.infrastructure.UserRepository
import com.bandly.backend.platform.error.ConflictException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.JwtService
import com.bandly.backend.platform.security.RefreshTokenService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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
        if (!passwordEncoder.matches(rawPassword, user.passwordHash)) {
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

    private fun issueSession(user: User): IssuedSession =
        IssuedSession(
            userId = user.id,
            email = user.email,
            accessToken = jwtService.issueAccessToken(user.id, user.email),
            accessTokenTtlSeconds = jwtService.accessTokenTtlSeconds(),
            refreshToken = refreshTokenService.issue(user.id),
            refreshTokenTtlSeconds = refreshTokenService.refreshCookieTtlSeconds(),
        )
}
