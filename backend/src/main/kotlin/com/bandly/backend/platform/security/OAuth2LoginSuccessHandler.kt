package com.bandly.backend.platform.security

import com.bandly.backend.identity.application.AuthService
import com.bandly.backend.platform.config.CorsProperties
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

/**
 * Runs once, right after Spring Security itself confirms Google's identity
 * assertion — from here on this is Bandly's own logic, not Spring's: find
 * or create the account (AuthService.findOrCreateGoogleUser), issue our own
 * JWT/refresh session (same shape /api/v1/auth/login produces), then hand
 * the browser a one-time code instead of the session itself (see
 * OAuthExchangeCodeStore for why) and send it back to the frontend SPA,
 * which is a separate origin this backend doesn't render pages for.
 */
@Component
class OAuth2LoginSuccessHandler(
    private val authService: AuthService,
    private val exchangeCodes: OAuthExchangeCodeStore,
    private val corsProperties: CorsProperties,
) : AuthenticationSuccessHandler {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val oidcUser = authentication.principal as OidcUser
        val email = oidcUser.email
            ?: run {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Google account has no verified email")
                return
            }

        val session = authService.findOrCreateGoogleUser(email)
        val code = exchangeCodes.issue(session)

        val redirectUrl = UriComponentsBuilder
            .fromUriString(frontendOrigin())
            .path("/oauth-callback")
            .queryParam("code", code)
            .build()
            .toUriString()

        response.sendRedirect(redirectUrl)
    }

    /** The frontend's own origin — reusing bandly.cors.allowed-origins
     * rather than introducing a second "where does the frontend live"
     * setting that could quietly drift out of sync with the CORS config. */
    private fun frontendOrigin(): String =
        corsProperties.allowedOrigins.firstOrNull() ?: "http://localhost:3000"
}
