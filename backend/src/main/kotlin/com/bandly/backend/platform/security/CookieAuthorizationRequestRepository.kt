package com.bandly.backend.platform.security

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.web.util.WebUtils
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.util.Base64

/**
 * Spring Security's own default (HttpSessionOAuth2AuthorizationRequestRepository)
 * stashes the pending OAuth2 request in the HTTP session between the redirect
 * to Google and the callback — but SecurityConfig runs this app fully
 * STATELESS (no sessions at all, JWTs only), so that default silently has
 * nowhere reliable to write to. This is the cookie-based replacement: same
 * idea as AuthController's refresh-token cookie (httpOnly, short-lived,
 * scoped), just for the ~seconds-long round trip to Google and back instead
 * of a 30-day session.
 *
 * Deliberately does NOT use raw Java object (de)serialization on the cookie
 * value — a cookie is fully client-controlled input, and deserializing an
 * arbitrary object graph from it is the classic gadget-chain RCE class of
 * bug (first draft of this class did exactly that; caught it from a
 * deprecation warning on SerializationUtils.deserialize before it shipped).
 * Instead only the specific fields this app's authorization-code flow
 * actually needs are pulled out and round-tripped as JSON into one fixed,
 * known shape (PendingAuthorizationRequest) — Jackson deserializing into a
 * single concrete data class can't be tricked into instantiating anything
 * else, unlike ObjectInputStream.
 */
class CookieAuthorizationRequestRepository : AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    // jacksonObjectMapper(), not a bare JsonMapper.builder().build() — that
    // wouldn't register the Kotlin module, and without it Jackson has no way
    // to construct PendingAuthorizationRequest (a constructor-only data
    // class, no default constructor or setters) and fails at runtime despite
    // compiling fine.
    private val json = jacksonObjectMapper()

    override fun loadAuthorizationRequest(request: HttpServletRequest): OAuth2AuthorizationRequest? =
        WebUtils.getCookie(request, COOKIE_NAME)?.value?.let(::deserialize)?.toAuthorizationRequest()

    override fun saveAuthorizationRequest(
        authorizationRequest: OAuth2AuthorizationRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        val cookie = Cookie(COOKIE_NAME, serialize(authorizationRequest)).apply {
            isHttpOnly = true
            secure = request.isSecure
            path = "/"
            maxAge = COOKIE_MAX_AGE_SECONDS
        }
        response.addCookie(cookie)
    }

    override fun removeAuthorizationRequest(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): OAuth2AuthorizationRequest? {
        val authorizationRequest = loadAuthorizationRequest(request)
        deleteCookie(response, request)
        return authorizationRequest
    }

    private fun deleteCookie(response: HttpServletResponse, request: HttpServletRequest) {
        val expired = Cookie(COOKIE_NAME, "").apply {
            isHttpOnly = true
            secure = request.isSecure
            path = "/"
            maxAge = 0
        }
        response.addCookie(expired)
    }

    private fun serialize(authorizationRequest: OAuth2AuthorizationRequest): String {
        val pending = PendingAuthorizationRequest(
            authorizationUri = authorizationRequest.authorizationUri,
            clientId = authorizationRequest.clientId,
            redirectUri = authorizationRequest.redirectUri,
            scopes = authorizationRequest.scopes,
            state = authorizationRequest.state,
            // additionalParameters/attributes are Map<String, Any> on the real
            // type, but for this app's single "google" authorization-code
            // registration every value in practice is a String (registration_id,
            // response_type, and friends) — narrowing here is what makes the JSON
            // shape fixed and predictable instead of "any JSON Jackson can parse."
            additionalParameters = authorizationRequest.additionalParameters.mapValues { it.value.toString() },
            attributes = authorizationRequest.attributes.mapValues { it.value.toString() },
        )
        return Base64.getUrlEncoder().encodeToString(json.writeValueAsBytes(pending))
    }

    private fun deserialize(value: String): PendingAuthorizationRequest? =
        try {
            json.readValue(Base64.getUrlDecoder().decode(value), PendingAuthorizationRequest::class.java)
        } catch (_: Exception) {
            null // malformed/tampered cookie value — treat as "no pending request", not a crash
        }

    private fun PendingAuthorizationRequest.toAuthorizationRequest(): OAuth2AuthorizationRequest =
        OAuth2AuthorizationRequest.authorizationCode()
            .authorizationUri(authorizationUri)
            .clientId(clientId)
            .redirectUri(redirectUri)
            .scopes(scopes)
            .state(state)
            .additionalParameters(additionalParameters)
            .attributes(attributes)
            .build()

    private data class PendingAuthorizationRequest(
        val authorizationUri: String,
        val clientId: String,
        val redirectUri: String?,
        val scopes: Set<String>,
        val state: String?,
        val additionalParameters: Map<String, String>,
        val attributes: Map<String, String>,
    )

    companion object {
        const val COOKIE_NAME = "bandly_oauth2_request"

        // Long enough for a human to actually pick a Google account and click
        // through consent, short enough that a leaked cookie (browser history,
        // a stray log line) is worthless within minutes.
        private const val COOKIE_MAX_AGE_SECONDS = 180
    }
}
