package com.bandly.backend.sites.api

import com.bandly.backend.sites.domain.SiteContentData
import jakarta.validation.constraints.NotBlank
import java.time.Instant
import java.util.UUID

data class SiteResponse(
    val id: UUID,
    val subdomain: String,
    val customDomain: String?,
    val published: Boolean,
    val updatedAt: Instant,
)

data class PublishRequest(
    val published: Boolean,
)

data class UploadLogoRequest(
    @field:NotBlank val imageBase64: String,
    @field:NotBlank val mimeType: String,
)

data class PublicSiteResponse(
    val subdomain: String,
    val content: SiteContentData,
)
