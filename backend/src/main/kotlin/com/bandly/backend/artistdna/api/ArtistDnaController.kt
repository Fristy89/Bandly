package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.application.ArtistDnaService
import com.bandly.backend.identity.application.BandService
import com.bandly.backend.identity.domain.BandRole
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
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
        val profile = artistDnaService.saveIdentityProfile(bandId, request.answers)
        return IdentityProfileResponse(profile.id, profile.answers, profile.updatedAt)
    }

    @GetMapping("/identity-profile")
    fun identityProfile(@PathVariable bandId: UUID): IdentityProfileResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val profile = artistDnaService.identityProfile(bandId)
        return IdentityProfileResponse(profile.id, profile.answers, profile.updatedAt)
    }

    /** Only owner/admin trigger a (re)compile — it changes what every future
     * generated document in the band sounds like, not a casual action. */
    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    fun generate(@PathVariable bandId: UUID): ArtistDnaVersionResponse {
        bandService.requireRole(bandId, requireAuthenticatedUser(), BandRole.OWNER, BandRole.ADMIN)
        val version = artistDnaService.generateDna(bandId)
        return ArtistDnaVersionResponse(version.id, version.status, version.createdAt)
    }

    @GetMapping("/current")
    fun current(@PathVariable bandId: UUID): List<GeneratedAssetResponse> {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        return artistDnaService.currentDna(bandId).map {
            GeneratedAssetResponse(it.id, it.assetType, it.content, it.status)
        }
    }

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
