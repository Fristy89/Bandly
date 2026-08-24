package com.bandly.backend.platform.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

/**
 * Split out of SecurityConfig: once SecurityConfig also needed
 * OAuth2LoginSuccessHandler (which needs AuthService, which needs
 * PasswordEncoder), defining this bean inside SecurityConfig itself created
 * a circular dependency — Spring couldn't finish constructing SecurityConfig
 * while one of its own constructor args needed a bean SecurityConfig hadn't
 * finished defining yet. A standalone config class has no such cycle.
 */
@Configuration
class PasswordEncoderConfig {

    // Argon2id, per the blueprint's security architecture (§11).
    @Bean
    fun passwordEncoder(): PasswordEncoder = Argon2PasswordEncoder(16, 32, 1, 19456, 2)
}
