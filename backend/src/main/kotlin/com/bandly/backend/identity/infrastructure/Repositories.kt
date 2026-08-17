package com.bandly.backend.identity.infrastructure

import com.bandly.backend.identity.domain.Band
import com.bandly.backend.identity.domain.BandMember
import com.bandly.backend.identity.domain.RefreshToken
import com.bandly.backend.identity.domain.User
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmailIgnoreCase(email: String): User?
    fun existsByEmailIgnoreCase(email: String): Boolean
}

interface BandRepository : JpaRepository<Band, UUID>

interface BandMemberRepository : JpaRepository<BandMember, UUID> {
    fun findByBandIdAndUserId(bandId: UUID, userId: UUID): BandMember?
    fun findAllByUserId(userId: UUID): List<BandMember>
    fun findAllByBandId(bandId: UUID): List<BandMember>
    fun findByBandIdAndInvitedEmailIgnoreCase(bandId: UUID, email: String): BandMember?
}

interface RefreshTokenRepository : JpaRepository<RefreshToken, UUID> {
    fun findByTokenHash(tokenHash: String): RefreshToken?
    fun deleteAllByUserIdAndExpiresAtBefore(userId: UUID, before: Instant)
}
