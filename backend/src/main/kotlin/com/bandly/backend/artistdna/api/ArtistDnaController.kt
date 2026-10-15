package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.application.ArtistDnaService
import com.bandly.backend.artistdna.domain.ArtistDnaVersion
import com.bandly.backend.identity.application.BandService
import com.bandly.backend.identity.domain.BandRole
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/bands/{bandId}/dna")
class ArtistDnaController(
    private val artistDnaService: ArtistDnaService,
    private val bandService: BandService,
) {

    @PostMapping("/identity-profile")
    fun saveIdentityProfile(
        @PathVariable bandId: UUID,
        @Valid @RequestBody request: IdentityProfileRequest,
    ): IdentityProfileResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val profile = artistDnaService.saveIdentityProfile(bandId, request.answers, request.language)
        return IdentityProfileResponse(profile.id, profile.answers, profile.language, profile.updatedAt)
    }

    @GetMapping("/identity-profile")
    fun identityProfile(@PathVariable bandId: UUID): IdentityProfileResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val profile = artistDnaService.identityProfile(bandId)
        return IdentityProfileResponse(profile.id, profile.answers, profile.language, profile.updatedAt)
    }

    /** Only owner/admin trigger a (re)compile — it changes what every future
     * generated document in the band sounds like, not a casual action. */
    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    fun generate(
        @PathVariable bandId: UUID,
        @RequestBody(required = false) request: GenerateDnaRequest?,
    ): ArtistDnaVersionResponse {
        bandService.requireRole(bandId, requireAuthenticatedUser(), BandRole.OWNER, BandRole.ADMIN)
        val version = artistDnaService.generateDna(bandId, request?.preferredPrimaryColor)
        return toResponse(version)
    }

    @GetMapping("/current")
    fun current(@PathVariable bandId: UUID): List<GeneratedAssetResponse> {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return artistDnaService.currentDna(bandId).map {
            GeneratedAssetResponse(it.id, it.assetType, it.content, it.status)
        }
    }

    /** Rewrites just this one field — membership is enough here (unlike
     * /generate's OWNER/ADMIN gate): regenerating a single line is a much
     * lower-stakes action than recompiling the whole DNA. */
    @PostMapping("/assets/{assetId}/regenerate")
    fun regenerateAsset(@PathVariable bandId: UUID, @PathVariable assetId: UUID): GeneratedAssetResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val asset = artistDnaService.regenerateAsset(bandId, assetId)
        return GeneratedAssetResponse(asset.id, asset.assetType, asset.content, asset.status)
    }

    @PatchMapping("/assets/{assetId}")
    fun editAsset(
        @PathVariable bandId: UUID,
        @PathVariable assetId: UUID,
        @Valid @RequestBody request: EditAssetRequest,
    ): GeneratedAssetResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val asset = artistDnaService.editAsset(bandId, assetId, request.content)
        return GeneratedAssetResponse(asset.id, asset.assetType, asset.content, asset.status)
    }

    /** The version marker itself (status + palette) — separate from
     * /current, which returns the text assets. Lets a page load pick the
     * colors back up without re-running generation. */
    @GetMapping("/current-version")
    fun currentVersion(@PathVariable bandId: UUID): ArtistDnaVersionResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return toResponse(artistDnaService.currentVersion(bandId))
    }

    private fun toResponse(version: ArtistDnaVersion) =
        ArtistDnaVersionResponse(
            version.id,
            version.status,
            version.primaryColor,
            version.secondaryColor,
            version.brandMantra,
            version.primaryArchetype,
            version.dnaComponents,
            version.createdAt,
        )

    /** Kicks off a streamed regeneration; the response is the job to then
     * open at GET .../generation-jobs/{jobId}/events (GenerationJobController). */
    @PostMapping("/pitch/regenerate")
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun regeneratePitch(@PathVariable bandId: UUID): GenerationJobResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val job = artistDnaService.regeneratePitch(bandId)
        return GenerationJobResponse(job.id)
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")
}
