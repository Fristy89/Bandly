package com.bandly.backend.platform.security

import com.bandly.backend.identity.application.IssuedSession
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * The MITM/leak defense from the OAuth2 login design: after Google confirms
 * the artist's identity, the browser gets redirected back with a one-time
 * code in the URL, never the real JWT — a JWT sitting in a URL persists in
 * browser history and can leak via Referrer headers; this code is single-use
 * and expires in a minute, so even a leaked one is worthless almost
 * immediately. See OAuth2LoginSuccessHandler (issues) and
 * AuthController.exchangeOAuthCode (redeems).
 *
 * A plain in-memory map, not a database table: this app runs as one
 * instance, and the whole point of this value is that it's supposed to
 * disappear within a minute — nothing about it needs to survive a restart
 * or be visible across instances.
 */
@Component
class OAuthExchangeCodeStore {

    private data class Entry(val session: IssuedSession, val expiresAt: Instant)

    private val codes = ConcurrentHashMap<String, Entry>()

    fun issue(session: IssuedSession): String {
        val code = UUID.randomUUID().toString()
        codes[code] = Entry(session, Instant.now().plusSeconds(CODE_TTL_SECONDS))
        return code
    }

    /** Single-use by design — removed on lookup regardless of whether it's
     * still valid, so a code can never be redeemed twice. */
    fun redeem(code: String): IssuedSession? {
        val entry = codes.remove(code) ?: return null
        return entry.session.takeIf { Instant.now().isBefore(entry.expiresAt) }
    }

    companion object {
        private const val CODE_TTL_SECONDS = 60L
    }
}
