package com.bandly.backend.platform.security

import com.bandly.backend.platform.config.CorsProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtService: JwtService,
    private val corsProperties: CorsProperties,
) {

    // Argon2id, per the blueprint's security architecture (§11).
    @Bean
    fun passwordEncoder(): PasswordEncoder = Argon2PasswordEncoder(16, 32, 1, 19456, 2)

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/actuator/health",
                    // Swagger UI itself is public for local dev testing; the API
                    // calls made *through* it still require the Bearer token you
                    // paste into its "Authorize" dialog.
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                ).permitAll()
                it.anyRequest().authenticated()
            }
            .addFilterBefore(JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    private fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = corsProperties.allowedOrigins
            allowedMethods = listOf(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
            )
            allowedHeaders = listOf("Authorization", "Content-Type", "Idempotency-Key")
            allowCredentials = true
        }
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
