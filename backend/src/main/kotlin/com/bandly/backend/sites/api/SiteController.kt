package com.bandly.backend.sites.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.error.ApiException
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import com.bandly.backend.sites.application.GeneratedLogoOptions
import com.bandly.backend.sites.application.LogoMatchResult
import com.bandly.backend.sites.application.LogoService
import com.bandly.backend.sites.application.SiteService
import com.bandly.backend.sites.domain.LogoImage
import com.bandly.backend.sites.domain.LogoMark
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
     * LogoService for why that's one step, not generate-then-save. Also
     * returns the other candidates from the same call (GeneratedLogoOptions)
     * so the reveal screen can offer "try another" as an instant swap via
     * applyLogoMark below, instead of a second full generation. */
    @PostMapping("/logo/generate")
    fun generateLogo(@PathVariable bandId: UUID): GeneratedLogoOptions {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return logoService.generateLogo(bandId)
    }

    /** The instant half of "try another" — applies one of the candidates
     * generateLogo already returned, no AI call. */
    @PostMapping("/logo/apply")
    fun applyLogoMark(@PathVariable bandId: UUID, @RequestBody mark: LogoMark): SiteContentData {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return logoService.applyLogoMark(bandId, mark)
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

    /** The structured, post-DNA counterpart to Bandly's in-conversation
     * mismatch check (IdentityChatService) — called from the reveal screen
     * once the DNA is final, so the artist gets an actual "generate a
     * matching signature instead" offer rather than just a comment. */
    @PostMapping("/logo/check-match")
    fun checkLogoMatch(@PathVariable bandId: UUID, @Valid @RequestBody request: CheckLogoMatchRequest): LogoMatchResult {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return logoService.checkLogoMatch(bandId, request.visualReference)
    }

    /** A real photo of the artist/band for the public site's bio section
     * (SiteImages.bioPhoto) — a plain visual identifier, not something an
     * AI reasons about like the logo/color choices above. */
    @PostMapping("/photo/upload")
    fun uploadPhoto(@PathVariable bandId: UUID, @Valid @RequestBody request: UploadPhotoRequest): SiteContentData {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        validateImage(request.imageBase64, request.mimeType, ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, "photo")
        val dataUri = "data:${request.mimeType};base64,${request.imageBase64}"
        return siteService.updateBioPhoto(bandId, dataUri)
    }

    private fun validateLogoImage(base64: String, mimeType: String) =
        validateImage(base64, mimeType, ALLOWED_LOGO_TYPES, MAX_LOGO_BYTES, "logo")

    private fun validateImage(base64: String, mimeType: String, allowedTypes: Set<String>, maxBytes: Int, label: String) {
        if (mimeType !in allowedTypes) {
            throw ApiException(HttpStatus.BAD_REQUEST, "Unsupported $label type: $mimeType")
        }
        val decodedSize = try {
            Base64.getDecoder().decode(base64).size
        } catch (ex: IllegalArgumentException) {
            throw ApiException(HttpStatus.BAD_REQUEST, "That $label's data isn't valid base64")
        }
        if (decodedSize > maxBytes) {
            throw ApiException(HttpStatus.BAD_REQUEST, "That $label is too large — please use one under ${maxBytes / (1024 * 1024)} MB")
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

        // No SVG here — a bio photo is always a real raster photo, never a
        // vector design. Same 5MB cap the Identity Chat's photo upload
        // uses (IdentityChatController) — a phone photo routinely runs
        // 3-4MB even after typical compression.
        private val ALLOWED_PHOTO_TYPES = setOf("image/png", "image/jpeg", "image/webp")
        private const val MAX_PHOTO_BYTES = 5 * 1024 * 1024
    }
}
