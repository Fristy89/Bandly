package com.bandly.backend.identity.api

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

data class RegisterRequest(
    @field:Email @field:NotBlank val email: String,
    @field:Size(min = 10, max = 200, message = "Password must be at least 10 characters") val password: String,
)

data class LoginRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val password: String,
)

data class AuthResponse(
    val userId: UUID,
    val email: String,
    val accessToken: String,
    val accessTokenExpiresInSeconds: Long,
)
