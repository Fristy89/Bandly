package com.bandly.backend.sites.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import com.bandly.backend.sites.application.LogoService
import com.bandly.backend.sites.application.SiteService
import com.bandly.backend.sites.domain.SiteContentData
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/** Band-scoped, authenticated — the admin side (Bandly's own "Website" page). */
@RestController
@RequestMapping("/api/v1/bands/{bandId}/site")
class SiteController(
    private val siteService: SiteService,
    private val logoService: LogoService,
    private val bandService: BandService,
) {

    @GetMapping
    fun getSite(@PathVariable bandId: UUID): SiteResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val site = siteService.getOrCreateSite(bandId)
        return SiteResponse(site.id, site.subdomain, site.customDomain, site.published, site.updatedAt)
    }

    @GetMapping("/content")
    fun getContent(@PathVariable bandId: UUID): SiteContentData {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return siteService.getContent(bandId)
    }

    @PutMapping("/content")
    fun updateContent(@PathVariable bandId: UUID, @RequestBody content: SiteContentData): SiteContentData {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return siteService.updateContent(bandId, content)
    }

    /** Generates AND applies a new signature wordmark in one call — see
     * LogoService for why that's one step, not generate-then-save. */
    @PostMapping("/logo/generate")
    fun generateLogo(@PathVariable bandId: UUID): SiteContentData {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return logoService.generateLogo(bandId)
    }

    @PostMapping("/publish")
    fun publish(@PathVariable bandId: UUID, @RequestBody request: PublishRequest): SiteResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val site = siteService.setPublished(bandId, request.published)
        return SiteResponse(site.id, site.subdomain, site.customDomain, site.published, site.updatedAt)
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")
}
