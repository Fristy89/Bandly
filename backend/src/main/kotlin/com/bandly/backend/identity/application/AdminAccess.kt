package com.bandly.backend.identity.application

import com.bandly.backend.platform.config.AdminProperties
import org.springframework.stereotype.Component

/**
 * The whole platform-admin model: an email allowlist from config
 * (bandly.admin.emails). No DB role, no rows to manage — a single platform
 * has a handful of founders and this is enough. AuthService grants matching
 * users OWNER membership on the PlatformBand at session time so every
 * existing band-scoped endpoint just works for them.
 */
@Component
class AdminAccess(private val adminProperties: AdminProperties) {

    fun isAdmin(email: String?): Boolean {
        if (email.isNullOrBlank()) return false
        return adminProperties.emails.any { it.trim().equals(email.trim(), ignoreCase = true) }
    }
}
