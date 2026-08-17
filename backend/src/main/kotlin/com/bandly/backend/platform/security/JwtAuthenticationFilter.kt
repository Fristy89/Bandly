package com.bandly.backend.platform.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

/**
 * Reads the "Authorization: Bearer <token>" header, validates the JWT, and —
 * on success — sets an authenticated principal whose name is the user id.
 * Authorization (band membership + role) is resolved per-request downstream,
 * not baked into the token, so a role change takes effect immediately.
 */
class JwtAuthenticationFilter(private val jwtService: JwtService) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val claims = jwtService.parse(header.removePrefix("Bearer ").trim())
            if (claims != null) {
                val userId = UUID.fromString(claims.subject)
                val authentication = UsernamePasswordAuthenticationToken(userId, null, emptyList())
                SecurityContextHolder.getContext().authentication = authentication
            }
        }
        filterChain.doFilter(request, response)
    }
}

/** Resolves the current authenticated user id, or null if the request is anonymous. */
fun currentUserId(): UUID? =
    (SecurityContextHolder.getContext().authentication?.principal as? UUID)
