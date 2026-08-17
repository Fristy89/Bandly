package com.bandly.backend.identity.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.identity.domain.BandRole
import com.bandly.backend.identity.infrastructure.BandMemberRepository
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
@RequestMapping("/api/v1/bands")
class BandController(
    private val bandService: BandService,
    private val bandMembers: BandMemberRepository,
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createBand(@Valid @RequestBody request: CreateBandRequest): BandResponse {
        val userId = requireAuthenticatedUser()
        val band = bandService.createBand(userId, request.name)
        return BandResponse(band.id, band.name, band.planTier, BandRole.OWNER, band.createdAt)
    }

    @GetMapping
    fun listMyBands(): List<BandResponse> {
        val userId = requireAuthenticatedUser()
        return bandService.listBandsForUser(userId).map {
            BandResponse(it.band.id, it.band.name, it.band.planTier, it.member.role, it.band.createdAt)
        }
    }

    @PostMapping("/{bandId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    fun inviteMember(
        @PathVariable bandId: UUID,
        @Valid @RequestBody request: InviteMemberRequest,
    ): BandMemberResponse {
        val userId = requireAuthenticatedUser()
        val member = bandService.inviteMember(bandId, userId, request.email, request.role)
        return BandMemberResponse(
            member.id, member.userId, member.invitedEmail, member.role, member.invitedAt, member.joinedAt,
        )
    }

    @GetMapping("/{bandId}/members")
    fun listMembers(@PathVariable bandId: UUID): List<BandMemberResponse> {
        val userId = requireAuthenticatedUser()
        bandService.requireMembership(bandId, userId)
        return bandMembers.findAllByBandId(bandId).map {
            BandMemberResponse(it.id, it.userId, it.invitedEmail, it.role, it.invitedAt, it.joinedAt)
        }
    }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")
}
