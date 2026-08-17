package com.bandly.backend.identity.api

import com.bandly.backend.identity.application.AuthService
import com.bandly.backend.identity.application.IssuedSession
import com.bandly.backend.platform.error.UnauthorizedException
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private const val REFRESH_COOKIE_NAME = "bandly_refresh_token"

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val session = authService.register(request.email, request.password)
        return sessionResponse(session, HttpStatus.CREATED)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val session = authService.login(request.email, request.password)
        return sessionResponse(session, HttpStatus.OK)
    }

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest): ResponseEntity<AuthResponse> {
        val rawToken = request.cookies?.firstOrNull { it.name == REFRESH_COOKIE_NAME }?.value
            ?: throw UnauthorizedException("No refresh token presented")
        val session = authService.refresh(rawToken)
        return sessionResponse(session, HttpStatus.OK)
    }

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest): ResponseEntity<Void> {
        request.cookies?.firstOrNull { it.name == REFRESH_COOKIE_NAME }?.value?.let {
            authService.logout(it)
        }
        val expired = refreshCookie("", 0)
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expired.toString()).build()
    }

    private fun sessionResponse(session: IssuedSession, status: HttpStatus): ResponseEntity<AuthResponse> {
        val cookie = refreshCookie(session.refreshToken, session.refreshTokenTtlSeconds)
        val body = AuthResponse(
            userId = session.userId,
            email = session.email,
            accessToken = session.accessToken,
            accessTokenExpiresInSeconds = session.accessTokenTtlSeconds,
        )
        return ResponseEntity.status(status).header(HttpHeaders.SET_COOKIE, cookie.toString()).body(body)
    }

    private fun refreshCookie(value: String, maxAgeSeconds: Long): ResponseCookie =
        ResponseCookie.from(REFRESH_COOKIE_NAME, value)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/api/v1/auth")
            .maxAge(maxAgeSeconds)
            .build()
}
