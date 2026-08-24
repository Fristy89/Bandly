package com.bandly.backend.platform.security

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest

/**
 * The one thing this class exists to get right: a save/load round trip
 * through the actual cookie has to reconstruct an equivalent request,
 * including the state value the CSRF check depends on — and a tampered or
 * missing cookie has to fail closed (null), not throw.
 */
class CookieAuthorizationRequestRepositoryTest {

    private val repository = CookieAuthorizationRequestRepository()

    @Test
    fun `round-trips an authorization request through the cookie`() {
        val original = OAuth2AuthorizationRequest.authorizationCode()
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .clientId("test-client-id")
            .redirectUri("http://localhost:8080/login/oauth2/code/google")
            .scopes(setOf("email", "profile"))
            .state("a-random-csrf-state-value")
            .additionalParameters(mapOf("response_type" to "code"))
            .attributes(mapOf("registration_id" to "google"))
            .build()

        val saveRequest = MockHttpServletRequest()
        val saveResponse = MockHttpServletResponse()
        repository.saveAuthorizationRequest(original, saveRequest, saveResponse)

        val cookie = saveResponse.getCookie(CookieAuthorizationRequestRepository.COOKIE_NAME)
        checkNotNull(cookie) { "saveAuthorizationRequest didn't set the cookie" }

        val loadRequest = MockHttpServletRequest()
        loadRequest.setCookies(cookie)

        val loaded = repository.loadAuthorizationRequest(loadRequest)

        assertEquals(original.authorizationUri, loaded?.authorizationUri)
        assertEquals(original.clientId, loaded?.clientId)
        assertEquals(original.redirectUri, loaded?.redirectUri)
        assertEquals(original.scopes, loaded?.scopes)
        assertEquals(original.state, loaded?.state)
        assertEquals(original.attributes["registration_id"], loaded?.attributes?.get("registration_id"))
    }

    @Test
    fun `returns null instead of throwing when there is no cookie`() {
        assertNull(repository.loadAuthorizationRequest(MockHttpServletRequest()))
    }

    @Test
    fun `returns null instead of throwing when the cookie is garbage`() {
        val request = MockHttpServletRequest()
        request.setCookies(jakarta.servlet.http.Cookie(CookieAuthorizationRequestRepository.COOKIE_NAME, "not-valid-base64-json!!"))

        assertNull(repository.loadAuthorizationRequest(request))
    }

    @Test
    fun `removeAuthorizationRequest returns the pending request and clears the cookie`() {
        val original = OAuth2AuthorizationRequest.authorizationCode()
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .clientId("test-client-id")
            .state("state-value")
            .build()

        val saveRequest = MockHttpServletRequest()
        val saveResponse = MockHttpServletResponse()
        repository.saveAuthorizationRequest(original, saveRequest, saveResponse)
        val cookie = checkNotNull(saveResponse.getCookie(CookieAuthorizationRequestRepository.COOKIE_NAME))

        val removeRequest = MockHttpServletRequest()
        removeRequest.setCookies(cookie)
        val removeResponse = MockHttpServletResponse()

        val removed = repository.removeAuthorizationRequest(removeRequest, removeResponse)
        assertEquals(original.state, removed?.state)

        val clearedCookie = checkNotNull(removeResponse.getCookie(CookieAuthorizationRequestRepository.COOKIE_NAME))
        assertEquals(0, clearedCookie.maxAge)
    }
}
