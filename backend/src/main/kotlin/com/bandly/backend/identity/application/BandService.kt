package com.bandly.backend.identity.application

import com.bandly.backend.identity.domain.Band
import com.bandly.backend.identity.domain.BandMember
import com.bandly.backend.identity.domain.BandRole
import com.bandly.backend.identity.infrastructure.BandMemberRepository
import com.bandly.backend.identity.infrastructure.BandRepository
import com.bandly.backend.identity.infrastructure.UserRepository
import com.bandly.backend.platform.error.ConflictException
import com.bandly.backend.platform.error.ForbiddenException
import com.bandly.backend.platform.error.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

data class BandMembership(val band: Band, val member: BandMember)

@Service
class BandService(
    private val bands: BandRepository,
    private val bandMembers: BandMemberRepository,
    private val users: UserRepository,
) {

    @Transactional
    fun createBand(ownerUserId: UUID, name: String): Band {
        val band = bands.save(Band(name = name.trim()))
        bandMembers.save(
            BandMember(
                bandId = band.id,
                userId = ownerUserId,
                role = BandRole.OWNER,
                joinedAt = Instant.now(),
            ),
        )
        return band
    }

    fun listBandsForUser(userId: UUID): List<BandMembership> =
        bandMembers.findAllByUserId(userId).map { member ->
            val band = bands.findById(member.bandId).orElseThrow {
                NotFoundException("Band ${member.bandId} not found")
            }
            BandMembership(band, member)
        }

    /**
     * Every band-scoped endpoint calls this first to resolve the caller's role,
     * or reject the request — the single authorization choke point (blueprint §10).
     */
    fun requireMembership(bandId: UUID, userId: UUID): BandMember =
        bandMembers.findByBandIdAndUserId(bandId, userId)
            ?.takeIf { it.joinedAt != null }
            ?: throw ForbiddenException("You are not a member of this band")

    fun requireRole(bandId: UUID, userId: UUID, vararg allowed: BandRole): BandMember {
        val member = requireMembership(bandId, userId)
        if (member.role !in allowed) {
            throw ForbiddenException("This action requires one of: ${allowed.joinToString()}")
        }
        return member
    }

    @Transactional
    fun inviteMember(bandId: UUID, requesterId: UUID, email: String, role: BandRole): BandMember {
        requireRole(bandId, requesterId, BandRole.OWNER, BandRole.ADMIN)

        val normalizedEmail = email.trim().lowercase()
        val existingInvite = bandMembers.findByBandIdAndInvitedEmailIgnoreCase(bandId, normalizedEmail)
        if (existingInvite != null) {
            throw ConflictException("This email has already been invited to this band")
        }

        val existingUser = users.findByEmailIgnoreCase(normalizedEmail)
        if (existingUser != null && bandMembers.findByBandIdAndUserId(bandId, existingUser.id) != null) {
            throw ConflictException("This user is already a member of this band")
        }

        // If the invitee already has a Bandly account we link it immediately and mark
        // them joined; otherwise we hold the invite by email until they register.
        val member = BandMember(
            bandId = bandId,
            userId = existingUser?.id,
            invitedEmail = if (existingUser == null) normalizedEmail else null,
            role = role,
            joinedAt = if (existingUser != null) Instant.now() else null,
        )
        return bandMembers.save(member)
    }
}
