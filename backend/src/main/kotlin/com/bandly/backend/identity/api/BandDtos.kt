package com.bandly.backend.identity.api

import com.bandly.backend.identity.domain.BandRole
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateBandRequest(
    @field:NotBlank @field:Size(max = 120) val name: String,
)

data class BandResponse(
    val id: UUID,
    val name: String,
    val planTier: String,
    val myRole: BandRole,
    val createdAt: Instant,
)

data class InviteMemberRequest(
    @field:Email @field:NotBlank val email: String,
    val role: BandRole = BandRole.MEMBER,
)

data class BandMemberResponse(
    val id: UUID,
    val userId: UUID?,
    val invitedEmail: String?,
    val role: BandRole,
    val invitedAt: Instant,
    val joinedAt: Instant?,
)
