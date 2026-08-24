package com.bandly.backend.platform.security

import com.bandly.backend.platform.config.GoogleOAuthProperties
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.registration.ClientRegistrations
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository

/**
 * Builds the Google ClientRegistration by hand instead of letting Spring
 * Boot's OAuth2 client autoconfiguration build it from
 * spring.security.oauth2.client.registration.* properties — that
 * autoconfiguration validates client-id as non-empty the instant such a
 * property block exists at all, with no way to make it conditional on our
 * own bandly.oauth.google.enabled flag. Only existing as a bean when
 * enabled=true (see SecurityConfig, which only calls .oauth2Login() in that
 * case too) is what keeps Google credentials optional — same shape as
 * bandly.ai.enabled/bandly.tts.enabled elsewhere in this app.
 */
@Configuration
class OAuth2ClientConfig(private val properties: GoogleOAuthProperties) {

    @Bean
    @ConditionalOnProperty(prefix = "bandly.oauth.google", name = ["enabled"], havingValue = "true")
    fun clientRegistrationRepository(): ClientRegistrationRepository {
        // fromOidcIssuerLocation does real OIDC discovery against Google's
        // own .well-known/openid-configuration at startup — authorization/
        // token/user-info/jwk-set URIs come from Google itself, not
        // hardcoded here (the older CommonOAuth2Provider.GOOGLE convenience
        // class this would once have used doesn't exist in this Spring
        // Security version). registrationId is set explicitly to "google"
        // since the redirect URI registered with Google
        // (/login/oauth2/code/google) depends on that exact value.
        val google = ClientRegistrations.fromOidcIssuerLocation("https://accounts.google.com")
            .registrationId("google")
            .clientId(properties.clientId)
            .clientSecret(properties.clientSecret)
            .scope("openid", "email", "profile")
            .build()
        return InMemoryClientRegistrationRepository(google)
    }
}
