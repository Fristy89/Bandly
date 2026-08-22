package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.domain.AssetStatus
import com.bandly.backend.artistdna.domain.AssetType
import com.bandly.backend.artistdna.domain.DnaStatus
import jakarta.validation.constraints.NotEmpty
import java.time.Instant
import java.util.UUID

data class IdentityProfileRequest(
    @field:NotEmpty val answers: Map<String, String>,
    val language: String = "en",
)

data class IdentityProfileResponse(
    val id: UUID,
    val answers: Map<String, String>,
    val language: String,
    val updatedAt: Instant,
)

data class GenerateDnaRequest(
    /** The artist's own existing brand color, if they have one — hex,
     * validated/re-checked server-side (see ArtistDnaService.generateDna).
     * Null means "let Bandly choose", the previous and still-default
     * behavior. */
    val preferredPrimaryColor: String? = null,
)

data class ArtistDnaVersionResponse(
    val id: UUID,
    val status: DnaStatus,
    val primaryColor: String?,
    val secondaryColor: String?,
    val createdAt: Instant,
)

data class GeneratedAssetResponse(
    val id: UUID,
    val assetType: AssetType,
    val content: String,
    val status: AssetStatus,
)

data class EditAssetRequest(
    @field:NotEmpty val content: String,
)

data class GenerationJobResponse(
    val jobId: UUID,
)
