package com.bandly.backend.identity.api

import com.bandly.backend.identity.application.AdminAccess
import com.bandly.backend.identity.domain.PlatformBand
import com.bandly.backend.identity.infrastructure.UserRepository
import com.bandly.backend.platform.error.ForbiddenException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * The one thing the frontend needs to gate /admin/dna: "is the signed-in
 * user a platform admin?" 200 with the platform band id if so, 403 if not.
 * Admin identity itself is just the bandly.admin.emails allowlist
 * (AdminAccess); the OWNER membership that makes the DNA endpoints work is
 * granted at session time by AuthService.
 */
@RestController
@RequestMapping("/api/v1/admin")
class AdminController(
    private val adminAccess: AdminAccess,
    private val users: UserRepository,
) {

    @GetMapping("/me")
    fun me(): AdminMeResponse {
        val userId = currentUserId() ?: throw UnauthorizedException("Authentication required")
        val user = users.findById(userId).orElseThrow { UnauthorizedException("Authentication required") }
        if (!adminAccess.isAdmin(user.email)) {
            throw ForbiddenException("This area is for platform admins only")
        }
        return AdminMeResponse(admin = true, platformBandId = PlatformBand.ID)
    }
}

data class AdminMeResponse(
    val admin: Boolean,
    val platformBandId: UUID,
)
