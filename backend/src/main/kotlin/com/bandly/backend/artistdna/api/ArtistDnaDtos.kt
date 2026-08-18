package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.domain.AssetStatus
import com.bandly.backend.artistdna.domain.AssetType
import com.bandly.backend.artistdna.domain.DnaStatus
import jakarta.validation.constraints.NotEmpty
import java.time.Instant
import java.util.UUID

data class IdentityProfileRequest(
    @field:NotEmpty val answers: Map<String, String>,
)

data class IdentityProfileResponse(
    val id: UUID,
    val answers: Map<String, String>,
    val updatedAt: Instant,
)

data class ArtistDnaVersionResponse(
    val id: UUID,
    val status: DnaStatus,
    val createdAt: Instant,
)

data class GeneratedAssetResponse(
    val id: UUID,
    val assetType: AssetType,
    val content: String,
    val status: AssetStatus,
)

data class GenerationJobResponse(
    val jobId: UUID,
)
