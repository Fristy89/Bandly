package com.bandly.backend.sites.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.error.ApiException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import com.bandly.backend.sites.application.LogoService
import com.bandly.backend.sites.application.SiteService
import com.bandly.backend.sites.domain.LogoImage
import com.bandly.backend.sites.domain.SiteContentData
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.Base64
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

    /** An artist's own logo, uploaded as-is — the alternative to LogoService
     * generating a font-based wordmark for artists who already have a real
     * design (see SiteContentData.logoImage on why it takes precedence). */
    @PostMapping("/logo/upload")
    fun uploadLogo(@PathVariable bandId: UUID, @Valid @RequestBody request: UploadLogoRequest): UploadLogoResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        validateLogoImage(request.imageBase64, request.mimeType)
        val content = siteService.updateLogoImage(bandId, LogoImage(request.imageBase64, request.mimeType))
        // Best-effort: a failed vision call shouldn't block the upload the
        // artist actually asked for — Bandly just won't have anything to
        // compare it against in the conversation that follows.
        val visualDescription = try {
            logoService.describeUploadedLogo(bandId, request.imageBase64, request.mimeType)
        } catch (ex: Exception) {
            ""
        }
        return UploadLogoResponse(content, visualDescription)
    }

    private fun validateLogoImage(base64: String, mimeType: String) {
        if (mimeType !in ALLOWED_LOGO_TYPES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Unsupported logo image type: $mimeType")
        }
        val decodedSize = try {
            Base64.getDecoder().decode(base64).size
        } catch (ex: IllegalArgumentException) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Logo image data isn't valid base64")
        }
        if (decodedSize > MAX_LOGO_BYTES) {
            throw ApiException(HttpStatus.BAD_REQUEST, "That logo is too large — please use one under 2 MB")
        }
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")

    companion object {
        // Rendered via <img>, never inlined into the page markup — an SVG
        // loaded that way can't execute embedded scripts, so it's as safe
        // as any raster format here despite being technically "code."
        private val ALLOWED_LOGO_TYPES = setOf("image/png", "image/jpeg", "image/webp", "image/svg+xml")
        private const val MAX_LOGO_BYTES = 2 * 1024 * 1024
    }
}
