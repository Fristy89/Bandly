package com.bandly.backend.platform.security

import com.bandly.backend.platform.config.CorsProperties
import com.bandly.backend.platform.config.GoogleOAuthProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.http.HttpStatus
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtService: JwtService,
    private val corsProperties: CorsProperties,
    private val oauth2LoginSuccessHandler: OAuth2LoginSuccessHandler,
    private val googleOAuthProperties: GoogleOAuthProperties,
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            // Without this, adding .oauth2Login() below silently replaces the
            // default entry point for the WHOLE app: every unauthenticated
            // request to any endpoint (not just the OAuth2 ones) would
            // redirect the browser to Google instead of returning a plain
            // 401 — breaking the JSON API contract the frontend's apiFetch/
            // ApiError handling depends on. Clicking "Continue with Google"
            // still works: that redirect happens via a dedicated filter
            // matching /oauth2/authorization/google specifically, not
            // through this exception-handling path at all.
            .exceptionHandling { it.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/oauth/exchange",
                    // The redirect-to-Google and Google's-callback-lands-here
                    // routes — Spring Security serves these itself, but they
                    // still pass through this same filter chain, so they need
                    // to be reachable before anyone has a JWT.
                    "/oauth2/authorization/**",
                    "/login/oauth2/code/**",
                    "/actuator/health",
                    // Swagger UI itself is public for local dev testing; the API
                    // calls made *through* it still require the Bearer token you
                    // paste into its "Authorize" dialog.
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    // The site-renderer app resolves a band's public website
                    // through here — same trust level as the website itself.
                    "/api/v1/public/**",
                ).permitAll()
                it.anyRequest().authenticated()
            }
            .addFilterBefore(JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter::class.java)

        // Only wired in when a ClientRegistrationRepository bean actually
        // exists (OAuth2ClientConfig, gated on the same flag) — calling
        // .oauth2Login() unconditionally would make Spring look for that
        // bean regardless, and fail to start without it.
        if (googleOAuthProperties.enabled) {
            http.oauth2Login { oauth2 ->
                oauth2.authorizationEndpoint { it.authorizationRequestRepository(CookieAuthorizationRequestRepository()) }
                oauth2.successHandler(oauth2LoginSuccessHandler)
            }
        }

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
